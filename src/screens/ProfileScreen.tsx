import { useEffect, useState } from 'react'
import { Empty, ErrorNotice, Stat } from '../components/ui'
import { PayslipLineItems } from '../components/PayslipLineItems'
import { PayslipDownloadButton } from '../components/PayslipDownloadButton'
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
  const latestCurrency = latest?.currency
  const yearToDate = payslips
    .filter(payslip => payslip.year === new Date().getFullYear() && payslip.currency === latestCurrency)
    .reduce((total, payslip) => total + Number(payslip.netSalary), 0)

  return <>
    <section className="welcome employee-welcome">
      <div><p className="eyebrow">Employee self-service</p><h2>{user.firstName} {user.lastName}</h2><p>{user.email}</p></div>
      <span className="badge">{user.role}</span>
    </section>
    <section className="stats">
      <Stat label="Available payslips" value={payslips.length} />
      <Stat label="Latest period" value={latest ? `${monthName(latest.month)} ${latest.year}` : '-'} />
      <Stat label="Latest net pay" value={latest ? `${latest.currency} ${money(latest.netSalary)}` : '-'} />
      <Stat label={`${new Date().getFullYear()} net (${latestCurrency ?? 'currency'})`} value={`${latestCurrency ?? ''} ${money(yearToDate)}`} />
    </section>
    <ErrorNotice message={error} />
    <section className="panel table-wrap">
      <div className="panel-head payslip-heading"><div><h3>Your payslips</h3><p>Only payslips associated with your employee record are shown.</p></div></div>
      {loading ? <p className="loading-state">Loading your payslips...</p> : <>
        <table><thead><tr><th>Pay period</th><th>Gross pay</th><th>Adjustments</th><th>NSSA</th><th>PAYE</th><th>Deductions</th><th>Net pay</th><th>Generated</th><th></th></tr></thead>
          <tbody>{payslips.map(payslip => <tr key={payslip.id ?? `${payslip.year}-${payslip.month}`}>
            <td><strong>{monthName(payslip.month)} {payslip.year}</strong><small>Payslip #{payslip.id}</small></td>
            <td>{payslip.currency} {money(payslip.grossSalary)}</td>
            <td><PayslipLineItems currency={payslip.currency} items={payslip.lineItems ?? []} /></td>
            <td>{payslip.currency} {money(payslip.employeeNssaContribution)}</td>
            <td>{payslip.currency} {money(payslip.payeDeduction)}<small>{payslip.payeRuleVersion}</small></td>
            <td>{payslip.currency} {money(payslip.totalDeductions)}</td>
            <td><strong>{payslip.currency} {money(payslip.netSalary)}</strong></td>
            <td>{payslip.createdAt ? new Date(payslip.createdAt).toLocaleDateString() : '-'}</td>
            <td className="row-actions"><PayslipDownloadButton payslip={payslip} token={token} /></td>
          </tr>)}</tbody>
        </table>
        {!payslips.length && !error && <Empty text="Your processed payslips will appear here." />}
      </>}
    </section>
  </>
}
