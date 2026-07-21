import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { AuthScreen } from './screens/AuthScreen'
import { sessionService } from './services/session'
import type { AuthResponse } from './types'

function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(() => sessionService.load())

  function login(value: AuthResponse) {
    sessionService.save(value)
    setAuth(value)
  }

  function logout() {
    sessionService.clear()
    setAuth(null)
  }

  return auth
    ? <AppShell user={auth.user} token={auth.token} onLogout={logout} />
    : <AuthScreen onLogin={login} />
}

export default App