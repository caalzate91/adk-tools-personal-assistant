import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '@/atoms/Avatar/Avatar';

describe('Avatar', () => {
  it('renders an img when photoURL is provided', () => {
    render(<Avatar photoURL="https://example.com/photo.jpg" displayName="Jane Doe" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Jane Doe');
  });

  it('renders initials fallback when no photoURL', () => {
    render(<Avatar photoURL={null} displayName="Jane Doe" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('always has a non-empty alt attribute on img', () => {
    render(<Avatar photoURL="https://example.com/photo.jpg" displayName="" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('alt')).toBeTruthy();
  });

  it('handles single-word display name for initials', () => {
    render(<Avatar photoURL={null} displayName="Jane" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('applies size class when provided', () => {
    const { container } = render(<Avatar photoURL={null} displayName="AB" size="lg" />);
    expect(container.firstChild).toHaveClass('avatar--lg');
  });
});
