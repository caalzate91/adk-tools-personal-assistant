import { Button } from '@/atoms/Button/Button';
import './ErrorBanner.css';

interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <span className="error-banner__message">{message}</span>
      <div className="error-banner__actions">
        {onRetry && <Button label="Retry" onClick={onRetry} variant="secondary" />}
        <Button label="Dismiss" onClick={onDismiss} variant="secondary" />
      </div>
    </div>
  );
}
