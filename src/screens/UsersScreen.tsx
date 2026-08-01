import { useEffect, useState } from 'react'
import { Empty, ErrorNotice } from '../components/ui'
import { userService } from '../services/api'
import type { Role, User } from '../types'

export function UsersScreen({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Record<number, Role>>({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

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
      <p>Select a new role and save it. The system always keeps at least one administrator so access cannot be accidentally locked out.</p>
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
