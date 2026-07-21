import { useEffect, useState } from 'react'
import { Stat } from '../components/ui'
import { employeeService, payrollService } from '../services/api'
import type { Employee, PayrollRun, User, View } from '../types'

interface DashboardProps {
  token: string
  user: User
  onNavigate: (view: View) => void
}

export function DashboardScreen({ token, user, onNavigate }: DashboardProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [runs, setRuns] = useState<PayrollRun[]>([])

  useEffect(() => {
    employeeService.list(token).then(setEmployees).catch(() => {})
    payrollService.list(token).then(setRuns).catch(() => {})
  }, [token])

  const activeEmployees = employees.filter(employee => employee.status === 'ACTIVE').length
  const latestRun = runs.at(-1)

  return <>
    <section className="welcome">
      <div><h2>Good day, {user.firstName}.</h2><p>Here is the current state of your payroll workspace.</p></div>
      <button className="primary" onClick={() => onNavigate('payroll')}>View payroll</button>
    </section>
    <section className="stats">
      <Stat label="Total employees" value={employees.length} />
      <Stat label="Active employees" value={activeEmployees} />
      <Stat label="Payroll runs" value={runs.length} />
      <Stat label="Latest status" value={latestRun?.status ?? '-'} />
    </section>
    <section className="panel">
      <div className="panel-head"><div><h3>Quick actions</h3><p>Common payroll administration tasks.</p></div></div>
      <div className="actions">
        <button onClick={() => onNavigate('employees')}><strong>Manage employees</strong><span>Add records and update employment status.</span></button>
        <button onClick={() => onNavigate('payroll')}><strong>Run payroll</strong><span>Create a period and generate payslips.</span></button>
        {user.role === 'ADMIN' && <button onClick={() => onNavigate('users')}><strong>Review access</strong><span>View system accounts and roles.</span></button>}
      </div>
    </section>
  </>
}