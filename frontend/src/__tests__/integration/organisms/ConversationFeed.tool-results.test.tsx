import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversationFeed } from '@/organisms/ConversationFeed/ConversationFeed';
import type { Message } from '@/types/message';

describe('ConversationFeed tool-result rendering', () => {
  it('renders ToolResultWidget for tool_result messages', () => {
    const toolMsg: Message = {
      id: 'tool-1',
      sender: 'assistant',
      content: {
        kind: 'tool_result',
        toolType: 'exchange_rate',
        payload: { from: 'USD', to: 'EUR', rate: 0.92 },
        summary: '1 USD = 0.92 EUR',
      },
      timestamp: new Date(),
      status: 'received',
    };
    const { container } = render(<ConversationFeed messages={[toolMsg]} status="idle" />);
    expect(container.querySelector('.tool-result--exchange_rate')).not.toBeNull();
    expect(container.querySelector('.tool-result__rate')).toHaveTextContent('0.92');
  });

  it('renders text messages alongside tool results', () => {
    const messages: Message[] = [
      {
        id: 'txt-1',
        sender: 'user',
        content: { kind: 'text', text: 'What is EUR to USD?' },
        timestamp: new Date(),
        status: 'received',
      },
      {
        id: 'tool-1',
        sender: 'assistant',
        content: {
          kind: 'tool_result',
          toolType: 'exchange_rate',
          payload: { from: 'EUR', to: 'USD', rate: 1.09 },
          summary: '1 EUR = 1.09 USD',
        },
        timestamp: new Date(),
        status: 'received',
      },
    ];
    const { container } = render(<ConversationFeed messages={messages} status="idle" />);
    expect(screen.getByText('What is EUR to USD?')).toBeInTheDocument();
    expect(container.querySelector('.tool-result__rate')).toHaveTextContent('1.09');
  });
});
