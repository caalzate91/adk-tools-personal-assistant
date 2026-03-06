import { useEffect, useRef } from 'react';
import type { Message } from '@/types/message';
import { MessageBubble } from '@/molecules/MessageBubble/MessageBubble';
import { LoadingDots } from '@/atoms/LoadingDots/LoadingDots';
import './ConversationFeed.css';

interface ConversationFeedProps {
  messages: Message[];
  status: 'idle' | 'sending' | 'streaming' | 'error';
}

export function ConversationFeed({ messages, status }: ConversationFeedProps) {
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages.length]);

  const isStreaming = status === 'sending' || status === 'streaming';

  return (
    <ul className="conversation-feed" aria-live="polite">
      {messages.map((msg) => (
        <li key={msg.id} className="conversation-feed__item">
          <MessageBubble message={msg} />
        </li>
      ))}
      {isStreaming && (
        <li className="conversation-feed__item">
          <LoadingDots />
        </li>
      )}
      <li ref={endRef} aria-hidden="true" />
    </ul>
  );
}
