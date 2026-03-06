import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInputBar } from '@/molecules/MessageInputBar/MessageInputBar';

describe('MessageInputBar', () => {
  it('calls onSend when Enter is pressed with non-empty text', async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();
    render(<MessageInputBar onSend={handleSend} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello{Enter}');
    expect(handleSend).toHaveBeenCalledWith('Hello');
  });

  it('calls onSend when send button is clicked', async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();
    render(<MessageInputBar onSend={handleSend} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hi there');
    await user.click(screen.getByRole('button', { name: /send/i }));
    expect(handleSend).toHaveBeenCalledWith('Hi there');
  });

  it('blocks submission of whitespace-only input', async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();
    render(<MessageInputBar onSend={handleSend} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '   {Enter}');
    expect(handleSend).not.toHaveBeenCalled();
  });

  it('disables input and button when disabled prop is true', () => {
    render(<MessageInputBar onSend={() => {}} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('clears input after successful send', async () => {
    const user = userEvent.setup();
    render(<MessageInputBar onSend={() => {}} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Test message{Enter}');
    expect(input).toHaveValue('');
  });
});
