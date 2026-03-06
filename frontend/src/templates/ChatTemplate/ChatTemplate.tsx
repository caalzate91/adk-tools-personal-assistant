import type { ReactNode } from 'react';
import './ChatTemplate.css';

interface ChatTemplateProps {
  header: ReactNode;
  feed: ReactNode;
  composer: ReactNode;
}

export function ChatTemplate({ header, feed, composer }: ChatTemplateProps) {
  return (
    <div className="chat-template">
      <div className="chat-template__header">{header}</div>
      <div className="chat-template__feed">{feed}</div>
      <div className="chat-template__composer">{composer}</div>
    </div>
  );
}
