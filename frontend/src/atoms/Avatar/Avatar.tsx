import './Avatar.css';

interface AvatarProps {
  photoURL: string | null;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

export function Avatar({ photoURL, displayName, size = 'md' }: AvatarProps) {
  return (
    <div className={`avatar avatar--${size}`}>
      {photoURL ? (
        <img className="avatar__img" src={photoURL} alt={displayName || 'User avatar'} />
      ) : (
        <span aria-hidden="true">{getInitials(displayName)}</span>
      )}
    </div>
  );
}
