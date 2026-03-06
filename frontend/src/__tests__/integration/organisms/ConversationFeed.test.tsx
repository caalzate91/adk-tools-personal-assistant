import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversationFeed } from '@/organisms/ConversationFeed/ConversationFeed';
import type { Message } from '@/types/message';

function makeMessages(count: number): Message[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    sender: (i % 2 === 0 ? 'user' : 'assistant') as Message['sender'],
    content: { kind: 'text' as const, text: `Message ${i}` },
    timestamp: new Date(`2025-01-15T10:${String(i).padStart(2, '0')}:00Z`),
    status: 'received' as const,
  }));
}

describe('ConversationFeed', () => {
  it('renders messages in order', () => {
    const msgs = makeMessages(4);
    render(<ConversationFeed messages={msgs} status="idle" />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent('Message 0');
    expect(items[3]).toHaveTextContent('Message 3');
  });

  it('has accessible list structure', () => {
    render(<ConversationFeed messages={makeMessages(2)} status="idle" />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('shows LoadingDots for in-progress streaming', () => {
    render(<ConversationFeed messages={makeMessages(1)} status="streaming" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not show LoadingDots when idle', () => {
    render(<ConversationFeed messages={makeMessages(1)} status="idle" />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders empty state when no messages', () => {
    render(<ConversationFeed messages={[]} status="idle" />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
