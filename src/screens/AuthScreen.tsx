import { useState } from 'react'
import type { FormEvent } from 'react'
import { authService } from '../services/api'
import type { AuthResponse, RegisterRequest } from '../types'

export function AuthScreen({ onLogin }: { onLogin: (auth: AuthResponse) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState<RegisterRequest>({ firstName: '', lastName: '', email: '', password: '' })

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (mode === 'register') {
        await authService.register(form)
        setMode('login')
        setMessage('Account created. Sign in to continue.')
      } else {
        onLogin(await authService.login(form.email, form.password))
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setMessage('')
  }

  return <main className="auth-page">
    <section className="auth-intro">
      <div className="brand"><span>PL</span> Payroll Lite</div>
      <div><p className="eyebrow">Payroll management</p><h1>Clear payroll operations for growing teams.</h1><p>Manage employees, payroll runs and access from one focused workspace.</p></div>
      <small>Secure access - Role-based workspaces - Reliable records</small>
    </section>
    <section className="auth-panel"><div className="auth-card">
      <p className="eyebrow">Welcome</p>
      <h2>{mode === 'login' ? 'Sign in to your account' : 'Create an employee account'}</h2>
      <p className="muted">{mode === 'login' ? 'Use your Payroll Lite credentials.' : 'New registrations receive employee access.'}</p>
      <form onSubmit={submit}>
        {mode === 'register' && <div className="form-row">
          <label>First name<input required value={form.firstName} onChange={event => setForm({ ...form, firstName: event.target.value })} /></label>
          <label>Last name<input required value={form.lastName} onChange={event => setForm({ ...form, lastName: event.target.value })} /></label>
        </div>}
        <label>Email address<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="name@company.com" /></label>
        <label>Password<input required minLength={8} type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label>
        {message && <div className="notice">{message}</div>}
        <button className="primary wide" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="switch">{mode === 'login' ? 'New to Payroll Lite?' : 'Already have an account?'} <button onClick={switchMode}>{mode === 'login' ? 'Register' : 'Sign in'}</button></p>
    </div></section>
  </main>
}