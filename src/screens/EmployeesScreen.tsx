import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Empty, ErrorNotice } from '../components/ui'
import { employeeService } from '../services/api'
import type { CurrencyCode, Employee, EmployeeFormData, EmployeeStatus } from '../types'

const emptyEmployee: EmployeeFormData = {
  firstName: '', lastName: '', email: '', jobTitle: '',
  basicSalary: '', salaryCurrency: 'USD', hireDate: '', status: 'ACTIVE',
}

export function EmployeesScreen({ token }: { token: string }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<EmployeeFormData>(emptyEmployee)
  const [error, setError] = useState('')

  const loadEmployees = useCallback(() => {
    employeeService.list(token).then(setEmployees).catch(value => setError(value.message))
  }, [token])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await employeeService.create(form, token)
      setForm(emptyEmployee)
      setShowForm(false)
      loadEmployees()
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Could not save employee')
    }
  }

  return <>
    <div className="toolbar">
      <p>{employees.length} employee records</p>
      <button className="primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : 'Add employee'}</button>
    </div>
    {showForm && <form className="panel form-grid" onSubmit={submit}>
      <label>First name<input required value={form.firstName} onChange={event => setForm({ ...form, firstName: event.target.value })} /></label>
      <label>Last name<input required value={form.lastName} onChange={event => setForm({ ...form, lastName: event.target.value })} /></label>
      <label>Email<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
      <label>Job title<input required value={form.jobTitle} onChange={event => setForm({ ...form, jobTitle: event.target.value })} /></label>
      <label>Basic salary<input required min="0.01" step="0.01" type="number" value={form.basicSalary} onChange={event => setForm({ ...form, basicSalary: event.target.value })} /></label>
      <label>Salary currency<select value={form.salaryCurrency} onChange={event => setForm({ ...form, salaryCurrency: event.target.value as CurrencyCode })}>
        <option value="USD">USD</option><option value="ZWG">ZWG</option>
      </select></label>
      <label>Hire date<input required type="date" value={form.hireDate} onChange={event => setForm({ ...form, hireDate: event.target.value })} /></label>
      <label>Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as EmployeeStatus })}>
        <option>ACTIVE</option><option>ON_LEAVE</option><option>SUSPENDED</option><option>TERMINATED</option>
      </select></label>
      <div className="form-actions">{error && <span className="error">{error}</span>}<button className="primary">Save employee</button></div>
    </form>}
    {!showForm && <ErrorNotice message={error} />}
    <div className="panel table-wrap"><table>
      <thead><tr><th>Employee</th><th>Number</th><th>Job title</th><th>Status</th><th>Account</th><th>Basic salary</th></tr></thead>
      <tbody>{employees.map(employee => <tr key={employee.id}>
        <td><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.email}</small></td>
        <td>{employee.employeeNumber}</td><td>{employee.jobTitle}</td>
        <td><span className={`badge ${employee.status.toLowerCase()}`}>{employee.status.replace('_', ' ')}</span></td>
        <td><span className="badge">{employee.accountLinked ? 'Linked' : 'No account'}</span></td>
        <td>{employee.salaryCurrency} {Number(employee.basicSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>)}</tbody>
    </table>{!employees.length && <Empty text="No employees have been added yet." />}</div>
  </>
}