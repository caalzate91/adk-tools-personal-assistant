import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from '@/atoms/TextInput/TextInput';

describe('TextInput', () => {
  it('renders with a controlled value', () => {
    render(<TextInput value="hello" onChange={() => {}} aria-label="Message" />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('calls onChange as user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextInput value="" onChange={handleChange} aria-label="Message" />);

    await user.type(screen.getByRole('textbox'), 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onSubmit when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TextInput value="hi" onChange={() => {}} onSubmit={handleSubmit} aria-label="Message" />);

    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it('does not call onSubmit on Shift+Enter', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TextInput value="hi" onChange={() => {}} onSubmit={handleSubmit} aria-label="Message" />);

    await user.type(screen.getByRole('textbox'), '{Shift>}{Enter}{/Shift}');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('applies aria-label for accessibility', () => {
    render(<TextInput value="" onChange={() => {}} aria-label="Chat input" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Chat input');
  });

  it('has placeholder text when provided', () => {
    render(<TextInput value="" onChange={() => {}} placeholder="Type a message…" aria-label="Message" />);
    expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<TextInput value="" onChange={() => {}} disabled aria-label="Message" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
