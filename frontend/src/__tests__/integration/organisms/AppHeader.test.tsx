import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppHeader } from '@/organisms/AppHeader/AppHeader';
import type { AppUser } from '@/types/user';

const mockUser: AppUser = {
  uid: 'u1',
  displayName: 'Ada Lovelace',
  email: 'ada@example.com',
  photoURL: 'https://example.com/ada.jpg',
};

describe('AppHeader', () => {
  let onSignOut: () => void;

  beforeEach(() => {
    onSignOut = vi.fn();
  });

  it('renders the user display name', () => {
    render(<AppHeader user={mockUser} onSignOut={onSignOut} />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('renders the Avatar with the user photo', () => {
    render(<AppHeader user={mockUser} onSignOut={onSignOut} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/ada.jpg');
  });

  it('renders a sign-out button', () => {
    render(<AppHeader user={mockUser} onSignOut={onSignOut} />);
    expect(screen.getByRole('button', { name: /sign.out/i })).toBeInTheDocument();
  });

  it('calls onSignOut when sign-out is clicked', async () => {
    const user = userEvent.setup();
    render(<AppHeader user={mockUser} onSignOut={onSignOut} />);
    await user.click(screen.getByRole('button', { name: /sign.out/i }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('renders the banner element with role="banner"', () => {
    render(<AppHeader user={mockUser} onSignOut={onSignOut} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders "User" when displayName is null', () => {
    const noNameUser = { ...mockUser, displayName: null };
    render(<AppHeader user={noNameUser} onSignOut={onSignOut} />);
    expect(screen.getByText('User')).toBeInTheDocument();
  });
});
