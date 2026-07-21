import { useEffect, useState } from 'react'
import { Empty, ErrorNotice } from '../components/ui'
import { userService } from '../services/api'
import type { User } from '../types'

export function UsersScreen({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    userService.list(token).then(setUsers).catch(value => setError(value.message))
  }, [token])

  return <>
    <ErrorNotice message={error} />
    <div className="panel table-wrap"><table>
      <thead><tr><th>User</th><th>Role</th><th>Account</th></tr></thead>
      <tbody>{users.map(user => <tr key={user.id}>
        <td><strong>{user.firstName} {user.lastName}</strong><small>{user.email}</small></td>
        <td><span className="badge">{user.role}</span></td>
        <td>{user.enabled === false ? 'Disabled' : 'Enabled'}</td>
      </tr>)}</tbody>
    </table>{!users.length && !error && <Empty text="No user accounts found." />}</div>
  </>
}