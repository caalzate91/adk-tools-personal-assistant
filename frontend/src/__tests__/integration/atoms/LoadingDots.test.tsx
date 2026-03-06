import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingDots } from '@/atoms/LoadingDots/LoadingDots';

describe('LoadingDots', () => {
  it('renders three dot elements', () => {
    render(<LoadingDots />);
    const dots = screen.getByRole('status').querySelectorAll('.loading-dot');
    expect(dots).toHaveLength(3);
  });

  it('has role="status" for accessibility', () => {
    render(<LoadingDots />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has an accessible aria-label', () => {
    render(<LoadingDots />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('is hidden from assistive tech when visible is false', () => {
    render(<LoadingDots visible={false} />);
    const el = screen.queryByRole('status');
    expect(el).toBeNull();
  });

  it('renders when visible is true', () => {
    render(<LoadingDots visible={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('defaults to visible when no prop is provided', () => {
    render(<LoadingDots />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
