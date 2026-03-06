import './LoadingDots.css';

interface LoadingDotsProps {
  visible?: boolean;
}

export function LoadingDots({ visible = true }: LoadingDotsProps) {
  if (!visible) return null;

  return (
    <div className="loading-dots" role="status" aria-label="Loading">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </div>
  );
}
