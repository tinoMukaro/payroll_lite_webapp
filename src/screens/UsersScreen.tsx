import { useEffect, useState, type FormEvent } from 'react'
import { Empty, ErrorNotice } from '../components/ui'
import { userService } from '../services/api'
import type { InternalUserFormData, Role, User } from '../types'

const emptyInternalUser: InternalUserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'HR',
}

export function UsersScreen({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Record<number, Role>>({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [internalUser, setInternalUser] = useState<InternalUserFormData>(emptyInternalUser)
  const [creating, setCreating] = useState(false)

  async function createInternalUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setCreating(true)
    try {
      const created = await userService.createInternal(internalUser, token)
      setUsers(current => [created, ...current])
      setSelectedRoles(current => ({ ...current, [created.id]: created.role }))
      setInternalUser({ ...emptyInternalUser })
      setMessage(`${created.firstName} ${created.lastName} can now sign in as ${created.role}.`)
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Could not create internal user')
    } finally {
      setCreating(false)
    }
  }

  async function saveRole(user: User) {
    const role = selectedRoles[user.id] ?? user.role
    if (role === user.role) return
    setError('')
    setMessage('')
    setUpdatingId(user.id)
    try {
      const updated = await userService.updateRole(user.id, role, token)
      setUsers(current => current.map(item => item.id === updated.id ? updated : item))
      setSelectedRoles(current => ({ ...current, [updated.id]: updated.role }))
      setMessage(`${updated.firstName} ${updated.lastName} is now ${updated.role}.`)
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Could not update user role')
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    userService.list(token).then(value => {
      setUsers(value)
      setSelectedRoles(Object.fromEntries(value.map(user => [user.id, user.role])))
    }).catch(value => setError(value.message))
  }, [token])

  return <>
    <div className="panel settings-intro">
      <h3>Account access</h3>
      <p>Create internal HR or Admin accounts, or change access for an existing user. The system always keeps at least one administrator so access cannot be accidentally locked out.</p>
    </div>
    <div className="panel">
      <div className="panel-head"><div>
        <h3>Add internal user</h3>
        <p>Employee accounts continue through employee registration. Internal users can sign in immediately with the initial password.</p>
      </div></div>
      <form className="form-grid internal-user-form" onSubmit={createInternalUser}>
        <label>First name<input required value={internalUser.firstName} onChange={event => setInternalUser(current => ({ ...current, firstName: event.target.value }))} /></label>
        <label>Last name<input required value={internalUser.lastName} onChange={event => setInternalUser(current => ({ ...current, lastName: event.target.value }))} /></label>
        <label className="internal-email">Email<input required type="email" value={internalUser.email} onChange={event => setInternalUser(current => ({ ...current, email: event.target.value }))} /></label>
        <label>Role<select value={internalUser.role} onChange={event => setInternalUser(current => ({ ...current, role: event.target.value as InternalUserFormData['role'] }))}>
          <option value="HR">HR</option><option value="ADMIN">ADMIN</option>
        </select></label>
        <label className="internal-password">Initial password<input required type="password" minLength={8} autoComplete="new-password" value={internalUser.password} onChange={event => setInternalUser(current => ({ ...current, password: event.target.value }))} /></label>
        <div className="form-actions"><button className="primary" disabled={creating} type="submit">{creating ? 'Creating...' : 'Create internal user'}</button></div>
      </form>
    </div>
    <ErrorNotice message={error} />
    {message && <div className="notice">{message}</div>}
    <div className="panel table-wrap"><table>
      <thead><tr><th>User</th><th>Current role</th><th>New role</th><th>Account</th><th></th></tr></thead>
      <tbody>{users.map(user => <tr key={user.id}>
        <td><strong>{user.firstName} {user.lastName}</strong><small>{user.email}</small></td>
        <td><span className="badge">{user.role}</span></td>
        <td><select className="role-select" value={selectedRoles[user.id] ?? user.role} disabled={updatingId === user.id} onChange={event => {
          setMessage('')
          setSelectedRoles(current => ({ ...current, [user.id]: event.target.value as Role }))
        }}>
          <option value="ADMIN">ADMIN</option><option value="HR">HR</option><option value="EMPLOYEE">EMPLOYEE</option>
        </select></td>
        <td>{user.enabled === false ? 'Disabled' : 'Enabled'}</td>
        <td><button className="secondary role-save" disabled={updatingId === user.id || (selectedRoles[user.id] ?? user.role) === user.role} onClick={() => saveRole(user)}>
          {updatingId === user.id ? 'Saving...' : 'Save'}
        </button></td>
      </tr>)}</tbody>
    </table>{!users.length && !error && <Empty text="No user accounts found." />}</div>
  </>
}
