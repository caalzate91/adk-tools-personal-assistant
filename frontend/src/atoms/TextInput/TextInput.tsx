import type { InputHTMLAttributes, KeyboardEvent } from 'react';
import './TextInput.css';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  onSubmit?: () => void;
  error?: boolean;
}

export function TextInput({ onSubmit, className, error, ...rest }: TextInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <input
      type="text"
      className={`text-input${className ? ` ${className}` : ''}`}
      onKeyDown={handleKeyDown}
      aria-invalid={error || undefined}
      {...rest}
    />
  );
}
