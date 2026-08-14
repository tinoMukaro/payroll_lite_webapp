import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { AuthScreen } from './screens/AuthScreen'
import { sessionService } from './services/session'
import { ApiRequestError, authService } from './services/api'
import type { AuthResponse } from './types'

function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(() => sessionService.load())
  const restoredToken = auth?.token

  useEffect(() => {
    if (!restoredToken) return
    let active = true
    authService.me(restoredToken).then(user => {
      if (!active) return
      const refreshed = { token: restoredToken, user }
      sessionService.save(refreshed)
      setAuth(refreshed)
    }).catch(value => {
      if (!active || !(value instanceof ApiRequestError) || ![401, 403].includes(value.status)) return
      sessionService.clear()
      setAuth(null)
    })
    return () => { active = false }
  }, [restoredToken])

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
