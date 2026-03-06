import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Icon } from '@/atoms/Icon/Icon';

describe('Icon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Icon name="send" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('sets aria-hidden="true" by default (decorative)', () => {
    const { container } = render(<Icon name="send" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with aria-label when provided (meaningful icon)', () => {
    render(<Icon name="send" aria-label="Send message" />);
    const svg = screen.getByLabelText('Send message');
    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the size class based on the size prop', () => {
    const { container } = render(<Icon name="send" size="lg" />);
    expect(container.querySelector('svg')).toHaveClass('icon--lg');
  });

  it('references a use element pointing to the icon name', () => {
    const { container } = render(<Icon name="logout" />);
    const use = container.querySelector('use');
    expect(use).toBeInTheDocument();
    expect(use).toHaveAttribute('href', '#icon-logout');
  });
});
