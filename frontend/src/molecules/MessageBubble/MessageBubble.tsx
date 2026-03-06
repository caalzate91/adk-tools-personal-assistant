import type { Message } from '@/types/message';
import { ToolResultWidget } from '@/molecules/ToolResultWidget/ToolResultWidget';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const alignClass = message.sender === 'user' ? 'message-bubble--user' : 'message-bubble--assistant';

  return (
    <div className={`message-bubble ${alignClass}`}>
      {message.content.kind === 'text' && (
        <span className="message-bubble__text">{message.content.text}</span>
      )}
      {message.content.kind === 'tool_result' && (
        <ToolResultWidget content={message.content} />
      )}
      {message.status === 'error' && (
        <span className="message-bubble__error" role="alert">
          Failed to deliver
        </span>
      )}
      <time className="message-bubble__time" dateTime={message.timestamp.toISOString()}>
        {formatTime(message.timestamp)}
      </time>
    </div>
  );
}
