import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversation } from '@/hooks/useConversation';
import { ChatTemplate } from '@/templates/ChatTemplate/ChatTemplate';
import { ConversationFeed } from '@/organisms/ConversationFeed/ConversationFeed';
import { ChatComposer } from '@/organisms/ChatComposer/ChatComposer';
import { AppHeader } from '@/organisms/AppHeader/AppHeader';

export function ChatPage() {
  const { user, signOut } = useAuth();
  const { messages, status, errorMessage, sendMessage, initSession, clearError } = useConversation(
    user?.uid ?? null,
  );

  useEffect(() => {
    if (user) {
      initSession(user.uid).catch(() => {
        // handled inside hook
      });
    }
  }, [user, initSession]);

  return (
    <ChatTemplate
      header={user ? <AppHeader user={user} onSignOut={signOut} /> : null}
      feed={<ConversationFeed messages={messages} status={status} />}
      composer={<ChatComposer onSend={sendMessage} status={status} errorMessage={errorMessage} onClearError={clearError} />}
    />
  );
}
