import { useState } from 'react'
import type { User, View } from '../types'
import { DashboardScreen } from '../screens/DashboardScreen'
import { EmployeesScreen } from '../screens/EmployeesScreen'
import { PayrollScreen } from '../screens/PayrollScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { UsersScreen } from '../screens/UsersScreen'

interface AppShellProps {
  user: User
  token: string
  onLogout: () => void
}

const titles: Record<View, string> = {
  dashboard: 'Overview',
  employees: 'Employees',
  payroll: 'Payroll runs',
  users: 'System users',
  profile: 'My account',
}

export function AppShell({ user, token, onLogout }: AppShellProps) {
  const [view, setView] = useState<View>(user.role === 'EMPLOYEE' ? 'profile' : 'dashboard')
  const navigation: [View, string][] = user.role === 'EMPLOYEE'
    ? [['profile', 'My account']]
    : [
        ['dashboard', 'Overview'],
        ['employees', 'Employees'],
        ['payroll', 'Payroll runs'],
        ...(user.role === 'ADMIN' ? [['users', 'Users'] as [View, string]] : []),
      ]

  return <div className="app-shell">
    <aside>
      <div className="brand"><span>PL</span> Payroll Lite</div>
      <nav>{navigation.map(([key, label]) =>
        <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>{label}</button>
      )}</nav>
      <div className="side-user">
        <div className="avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
        <div><strong>{user.firstName} {user.lastName}</strong><small>{user.role}</small></div>
      </div>
    </aside>
    <main className="workspace">
      <header>
        <div><p className="eyebrow">{user.role} workspace</p><h1>{titles[view]}</h1></div>
        <button className="secondary" onClick={onLogout}>Sign out</button>
      </header>
      {view === 'dashboard' && <DashboardScreen token={token} user={user} onNavigate={setView} />}
      {view === 'employees' && <EmployeesScreen token={token} />}
      {view === 'payroll' && <PayrollScreen token={token} />}
      {view === 'users' && <UsersScreen token={token} />}
      {view === 'profile' && <ProfileScreen user={user} />}
    </main>
  </div>
}