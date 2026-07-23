import { useEffect, useMemo, useState } from 'react'
import { Empty, ErrorNotice, Stat } from '../components/ui'
import { payrollService } from '../services/api'
import type { Payslip, User } from '../types'

interface ProfileScreenProps {
  user: User
  token: string
}

function monthName(month: number) {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'long' })
}

function money(value: number) {
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ProfileScreen({ user, token }: ProfileScreenProps) {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    payrollService.mine(token)
      .then(setPayslips)
      .catch(value => setError(value instanceof Error ? value.message : 'Could not load your payslips'))
      .finally(() => setLoading(false))
  }, [token])

  const latest = payslips[0]
  const yearToDate = useMemo(() => payslips
    .filter(payslip => payslip.year === new Date().getFullYear())
    .reduce((total, payslip) => total + Number(payslip.netSalary), 0), [payslips])

  return <>
    <section className="welcome employee-welcome">
      <div><p className="eyebrow">Employee self-service</p><h2>{user.firstName} {user.lastName}</h2><p>{user.email}</p></div>
      <span className="badge">{user.role}</span>
    </section>
    <section className="stats">
      <Stat label="Available payslips" value={payslips.length} />
      <Stat label="Latest period" value={latest ? `${monthName(latest.month)} ${latest.year}` : '-'} />
      <Stat label="Latest net pay" value={latest ? `$${money(latest.netSalary)}` : '-'} />
      <Stat label={`${new Date().getFullYear()} net pay`} value={`$${money(yearToDate)}`} />
    </section>
    <ErrorNotice message={error} />
    <section className="panel table-wrap">
      <div className="panel-head payslip-heading"><div><h3>Your payslips</h3><p>Only payslips associated with your employee record are shown.</p></div></div>
      {loading ? <p className="loading-state">Loading your payslips...</p> : <>
        <table><thead><tr><th>Pay period</th><th>Gross pay</th><th>Deductions</th><th>Net pay</th><th>Generated</th></tr></thead>
          <tbody>{payslips.map(payslip => <tr key={payslip.id}>
            <td><strong>{monthName(payslip.month)} {payslip.year}</strong><small>Payslip #{payslip.id}</small></td>
            <td>${money(payslip.grossSalary)}</td>
            <td>${money(payslip.totalDeductions)}</td>
            <td><strong>${money(payslip.netSalary)}</strong></td>
            <td>{new Date(payslip.createdAt).toLocaleDateString()}</td>
          </tr>)}</tbody>
        </table>
        {!payslips.length && !error && <Empty text="Your processed payslips will appear here." />}
      </>}
    </section>
  </>
}