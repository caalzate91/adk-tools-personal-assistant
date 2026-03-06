import { useAuth } from '@/hooks/useAuth';
import { LoginTemplate } from '@/templates/LoginTemplate/LoginTemplate';
import { Button } from '@/atoms/Button/Button';
import { ErrorBanner } from '@/molecules/ErrorBanner/ErrorBanner';

export function LoginPage() {
  const { loading, error, signIn } = useAuth();

  return (
    <LoginTemplate>
      <h1>Personal Assistant</h1>
      <p>Sign in to start chatting with your AI assistant.</p>
      {error && <ErrorBanner message={error} onDismiss={() => {}} />}
      <Button
        label="Sign in with Google"
        onClick={signIn}
        disabled={loading}
      />
    </LoginTemplate>
  );
}
