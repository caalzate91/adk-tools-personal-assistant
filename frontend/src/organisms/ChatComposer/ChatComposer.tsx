import { MessageInputBar } from '@/molecules/MessageInputBar/MessageInputBar';
import { ErrorBanner } from '@/molecules/ErrorBanner/ErrorBanner';
import { LoadingDots } from '@/atoms/LoadingDots/LoadingDots';
import './ChatComposer.css';

interface ChatComposerProps {
  onSend: (text: string) => void;
  status: 'idle' | 'sending' | 'streaming' | 'error';
  errorMessage: string | null;
  onClearError: () => void;
}

export function ChatComposer({ onSend, status, errorMessage, onClearError }: ChatComposerProps) {
  const isLoading = status === 'sending' || status === 'streaming';

  return (
    <div className="chat-composer">
      <ErrorBanner message={errorMessage} onDismiss={onClearError} />
      <LoadingDots visible={isLoading} />
      <MessageInputBar onSend={onSend} disabled={isLoading} />
    </div>
  );
}
