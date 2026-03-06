import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSession, deleteSession, runSSEStream } from '@/services/adkService';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('createSession', () => {
  it('returns session id on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'session-123', app_name: 'personal_assistant', user_id: 'uid-1' }),
    });

    const sessionId = await createSession('uid-1');
    expect(sessionId).toBe('session-123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/apps/personal_assistant/users/uid-1/sessions'),
      { method: 'POST' },
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(createSession('uid-1')).rejects.toThrow('Failed to create session: 500');
  });
});

describe('deleteSession', () => {
  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    await expect(deleteSession('uid-1', 'session-123')).resolves.toBeUndefined();
  });

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(deleteSession('uid-1', 'session-123')).rejects.toThrow('Failed to delete session: 404');
  });
});

describe('runSSEStream', () => {
  function createSSEStream(events: string[]): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        for (const event of events) {
          controller.enqueue(encoder.encode(`data: ${event}\n\n`));
        }
        controller.close();
      },
    });
  }

  it('parses text content from SSE events', async () => {
    const events = [
      JSON.stringify({ author: 'assistant', content: { role: 'assistant', parts: [{ text: 'Hello!' }] }, is_final_response: true }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(events),
    });

    const received: unknown[] = [];
    await runSSEStream('uid-1', 'session-1', 'Hi', (msg) => received.push(msg));

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      content: { kind: 'text', text: 'Hello!' },
      sender: 'assistant',
      isFinal: true,
    });
  });

  it('handles error events', async () => {
    const events = [
      JSON.stringify({ author: 'assistant', error: 'Something went wrong' }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(events),
    });

    const received: unknown[] = [];
    await runSSEStream('uid-1', 'session-1', 'Hi', (msg) => received.push(msg));

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      status: 'error',
    });
  });

  it('throws on non-ok fetch response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 422 });
    await expect(
      runSSEStream('uid-1', 'session-1', 'Hi', vi.fn()),
    ).rejects.toThrow('SSE request failed: 422');
  });

  it('supports abort via signal', async () => {
    const controller = new AbortController();
    controller.abort();

    mockFetch.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));

    await expect(
      runSSEStream('uid-1', 'session-1', 'Hi', vi.fn(), controller.signal),
    ).rejects.toThrow();
  });

  it('parses function_response as tool_result', async () => {
    const events = [
      JSON.stringify({
        author: 'assistant',
        content: {
          role: 'assistant',
          parts: [{ function_response: { name: 'get_exchange_rate', response: { rate: 1.08 } } }],
        },
        is_final_response: true,
      }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(events),
    });

    const received: unknown[] = [];
    await runSSEStream('uid-1', 'session-1', 'rate?', (msg) => received.push(msg));

    expect(received[0]).toMatchObject({
      content: { kind: 'tool_result', toolType: 'exchange_rate' },
    });
  });

  it('skips malformed SSE chunks', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: not-json\n\n'));
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ author: 'a', content: { role: 'a', parts: [{ text: 'ok' }] }, is_final_response: true })}\n\n`,
          ),
        );
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({ ok: true, body: stream });

    const received: unknown[] = [];
    await runSSEStream('uid-1', 's-1', 'hi', (msg) => received.push(msg));

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ content: { kind: 'text', text: 'ok' } });
  });

  it('throws when response body is null', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, body: null });
    await expect(
      runSSEStream('uid-1', 'session-1', 'Hi', vi.fn()),
    ).rejects.toThrow('Response body is not readable');
  });

  it('parses wikipedia function_response as tool_result', async () => {
    const events = [
      JSON.stringify({
        author: 'assistant',
        content: {
          role: 'assistant',
          parts: [{ function_response: { name: 'langchain_wikipedia', response: { text: 'wiki' } } }],
        },
        is_final_response: true,
      }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(events),
    });

    const received: unknown[] = [];
    await runSSEStream('uid-1', 'session-1', 'wiki?', (msg) => received.push(msg));
    expect(received[0]).toMatchObject({
      content: { kind: 'tool_result', toolType: 'wikipedia' },
    });
  });

  it('parses google_search function_response as search tool_result', async () => {
    const events = [
      JSON.stringify({
        author: 'assistant',
        content: {
          role: 'assistant',
          parts: [{ function_response: { name: 'google_search_agent', response: { results: [] } } }],
        },
        is_final_response: true,
      }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(events),
    });

    const received: unknown[] = [];
    await runSSEStream('uid-1', 'session-1', 'search', (msg) => received.push(msg));
    expect(received[0]).toMatchObject({
      content: { kind: 'tool_result', toolType: 'search' },
    });
  });

  it('parses unknown function as unknown tool_result', async () => {
    const events = [
      JSON.stringify({
        author: 'assistant',
        content: {
          role: 'assistant',
          parts: [{ function_response: { name: 'some_other_tool', response: {} } }],
        },
        is_final_response: true,
      }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(events),
    });

    const received: unknown[] = [];
    await runSSEStream('uid-1', 'session-1', 'other', (msg) => received.push(msg));
    expect(received[0]).toMatchObject({
      content: { kind: 'tool_result', toolType: 'unknown' },
    });
  });

  it('skips events with no parseable content parts', async () => {
    const events = [
      JSON.stringify({
        author: 'assistant',
        content: { role: 'assistant', parts: [{ function_call: { name: 'fn', args: {} } }] },
      }),
      JSON.stringify({
        author: 'assistant',
        content: { role: 'assistant', parts: [{ text: 'final' }] },
        is_final_response: true,
      }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(events),
    });

    const received: unknown[] = [];
    await runSSEStream('uid-1', 'session-1', 'test', (msg) => received.push(msg));
    // Only the text event should have produced a callback
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ content: { kind: 'text', text: 'final' } });
  });
});
