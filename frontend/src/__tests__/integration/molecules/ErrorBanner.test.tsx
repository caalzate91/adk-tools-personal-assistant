import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from '@/molecules/ErrorBanner/ErrorBanner';

describe('ErrorBanner', () => {
  it('renders the error message', () => {
    render(<ErrorBanner message="Something went wrong" onDismiss={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();
    render(<ErrorBanner message="Error" onDismiss={handleDismiss} />);

    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<ErrorBanner message="Error" onDismiss={() => {}} onRetry={handleRetry} />);

    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('does not render when message is null', () => {
    const { container } = render(<ErrorBanner message={null} onDismiss={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('has role="alert" for screen reader announcement', () => {
    render(<ErrorBanner message="Network timeout" onDismiss={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
