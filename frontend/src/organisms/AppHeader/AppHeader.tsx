import type { AppUser } from '@/types/user';
import { Avatar } from '@/atoms/Avatar/Avatar';
import { Button } from '@/atoms/Button/Button';
import './AppHeader.css';

interface AppHeaderProps {
  user: AppUser;
  onSignOut: () => void;
}

export function AppHeader({ user, onSignOut }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__user">
        <Avatar
          displayName={user.displayName ?? 'User'}
          photoURL={user.photoURL}
          size="sm"
        />
        <span className="app-header__name">{user.displayName ?? 'User'}</span>
      </div>
      <Button label="Sign out" variant="secondary" onClick={onSignOut} />
    </header>
  );
}
