import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/atoms/Button/Button';

describe('Button', () => {
  it('renders the label text', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Send" onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Send" onClick={handleClick} disabled />);

    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has disabled attribute when disabled prop is true', () => {
    render(<Button label="Send" onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is activatable via Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Send" onClick={handleClick} />);

    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is activatable via Space key', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Send" onClick={handleClick} />);

    screen.getByRole('button').focus();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('applies variant class when provided', () => {
    render(<Button label="Go" onClick={() => {}} variant="primary" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('primary');
  });
});
