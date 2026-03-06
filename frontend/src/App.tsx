import { useAuth } from '@/hooks/useAuth'
import { LoginPage } from '@/pages/LoginPage/LoginPage'
import { ChatPage } from '@/pages/ChatPage/ChatPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="app-loading">Loading…</div>
  }

  if (!user) {
    return <LoginPage />
  }

  return <ChatPage />
}

export default App
