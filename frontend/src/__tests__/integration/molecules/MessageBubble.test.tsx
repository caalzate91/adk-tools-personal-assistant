import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '@/molecules/MessageBubble/MessageBubble';
import type { Message } from '@/types/message';

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    sender: 'user',
    content: { kind: 'text', text: 'Hello' },
    timestamp: new Date('2025-01-15T10:30:00Z'),
    status: 'received',
    ...overrides,
  };
}

describe('MessageBubble', () => {
  it('renders user bubble with right alignment class', () => {
    const { container } = render(<MessageBubble message={makeMessage({ sender: 'user' })} />);
    expect(container.querySelector('.message-bubble--user')).not.toBeNull();
  });

  it('renders assistant bubble with left alignment class', () => {
    const { container } = render(<MessageBubble message={makeMessage({ sender: 'assistant' })} />);
    expect(container.querySelector('.message-bubble--assistant')).not.toBeNull();
  });

  it('renders text content', () => {
    render(<MessageBubble message={makeMessage({ content: { kind: 'text', text: 'Hi there' } })} />);
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('displays a timestamp', () => {
    render(<MessageBubble message={makeMessage()} />);
    // Look for a <time> element with the ISO string
    const timeEl = document.querySelector('time');
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute('datetime')).toBe('2025-01-15T10:30:00.000Z');
  });

  it('shows error indicator for error status', () => {
    render(<MessageBubble message={makeMessage({ status: 'error' })} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
