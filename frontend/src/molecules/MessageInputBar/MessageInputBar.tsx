import { useState } from 'react';
import { TextInput } from '@/atoms/TextInput/TextInput';
import { Button } from '@/atoms/Button/Button';
import './MessageInputBar.css';

interface MessageInputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInputBar({ onSend, disabled = false }: MessageInputBarProps) {
  const [value, setValue] = useState('');

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <div className="message-input-bar">
      <TextInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={handleSubmit}
        disabled={disabled}
        placeholder="Type a message…"
        aria-label="Message input"
      />
      <Button label="Send" onClick={handleSubmit} disabled={disabled || !value.trim()} />
    </div>
  );
}
