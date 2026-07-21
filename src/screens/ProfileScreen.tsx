import type { User } from '../types'

export function ProfileScreen({ user }: { user: User }) {
  return <section className="panel profile">
    <div className="profile-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
    <div><h2>{user.firstName} {user.lastName}</h2><p>{user.email}</p><span className="badge">{user.role}</span></div>
    <hr />
    <div><h3>Employee self-service</h3><p className="muted">Payslips will appear here once employee accounts are linked to employee records in the API.</p></div>
  </section>
}