import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Empty, ErrorNotice } from '../components/ui'
import { PayrollAdjustmentsPanel } from '../components/PayrollAdjustmentsPanel'
import { PayslipLineItems } from '../components/PayslipLineItems'
import { payrollService } from '../services/api'
import type { CurrencyCode, PayrollRun, Payslip } from '../types'

function monthName(month: number) {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'long' })
}

export function PayrollScreen({ token }: { token: string }) {
  const [runs, setRuns] = useState<PayrollRun[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [error, setError] = useState('')
  const [payslips, setPayslips] = useState<Payslip[] | null>(null)
  const [selectedRun, setSelectedRun] = useState<number | null>(null)
  const [adjustmentRun, setAdjustmentRun] = useState<PayrollRun | null>(null)

  const loadRuns = useCallback(() => {
    payrollService.list(token)
      .then(data => setRuns(data.sort((first, second) => second.id - first.id)))
      .catch(value => setError(value.message))
  }, [token])

  useEffect(() => { loadRuns() }, [loadRuns])

  async function createRun(event: FormEvent) {
    event.preventDefault()
    setError('')
    try { await payrollService.create(month, year, currency, token); loadRuns() }
    catch (value) { setError(value instanceof Error ? value.message : 'Could not create payroll run') }
  }

  async function processRun(id: number) {
    if (!confirm('Process this payroll run for all active employees using its current adjustments?')) return
    setError('')
    try { await payrollService.process(id, token); setAdjustmentRun(null); loadRuns() }
    catch (value) { setError(value instanceof Error ? value.message : 'Could not process payroll') }
  }

  async function viewPayslips(id: number) {
    setSelectedRun(id)
    setPayslips(null)
    try { setPayslips(await payrollService.payslips(id, token)) }
    catch (value) { setError(value instanceof Error ? value.message : 'Could not load payslips') }
  }

  return <>
    <form className="toolbar payroll-create" onSubmit={createRun}><div>
      <label>Month<select value={month} onChange={event => setMonth(Number(event.target.value))}>
        {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{monthName(index + 1)}</option>)}
      </select></label>
      <label>Year<input type="number" min="2000" value={year} onChange={event => setYear(Number(event.target.value))} /></label>
      <label>Currency<select value={currency} onChange={event => setCurrency(event.target.value as CurrencyCode)}><option value="USD">USD</option><option value="ZWG">ZWG</option></select></label>
    </div><button className="primary">Create draft</button></form>
    <ErrorNotice message={error} />
    <div className="panel table-wrap"><table>
      <thead><tr><th>Period</th><th>Currency</th><th>Status</th><th>Created</th><th>Processed</th><th></th></tr></thead>
      <tbody>{runs.map(run => <tr key={run.id}>
        <td><strong>{monthName(run.month)} {run.year}</strong><small>Run #{run.id}</small></td>
        <td><span className="badge">{run.currency}</span></td>
        <td><span className={`badge ${run.status.toLowerCase()}`}>{run.status}</span></td>
        <td>{new Date(run.createdAt).toLocaleDateString()}</td>
        <td>{run.processedAt ? new Date(run.processedAt).toLocaleDateString() : '-'}</td>
        <td className="row-actions">{run.status === 'DRAFT' && <><button onClick={() => setAdjustmentRun(run)}>Adjustments</button><button onClick={() => processRun(run.id)}>Process</button></>}<button onClick={() => viewPayslips(run.id)}>Payslips</button></td>
      </tr>)}</tbody>
    </table>{!runs.length && <Empty text="No payroll runs have been created." />}</div>
    {adjustmentRun && <PayrollAdjustmentsPanel key={adjustmentRun.id} run={adjustmentRun} token={token} onClose={() => setAdjustmentRun(null)} />}
    {selectedRun && <div className="panel">
      <div className="panel-head"><div><h3>Payslips for run #{selectedRun}</h3><p>Salary snapshots generated during processing.</p></div><button className="secondary" onClick={() => setSelectedRun(null)}>Close</button></div>
      {payslips === null ? <p className="muted">Loading...</p> : payslips.length ? <div className="table-wrap"><table>
        <thead><tr><th>Employee</th><th>Gross</th><th>Adjustments</th><th>NSSA</th><th>PAYE</th><th>Deductions</th><th>Net salary</th></tr></thead>
        <tbody>{payslips.map(payslip => <tr key={payslip.id}>
          <td><strong>{payslip.employeeName}</strong><small>{payslip.employeeNumber}</small></td>
          <td>{payslip.currency} {Number(payslip.grossSalary).toFixed(2)}</td>
          <td><PayslipLineItems currency={payslip.currency} items={payslip.lineItems ?? []} /></td>
          <td>{payslip.currency} {Number(payslip.employeeNssaContribution).toFixed(2)}<small>{payslip.nssaRuleVersion}</small></td>
          <td>{payslip.currency} {Number(payslip.payeDeduction).toFixed(2)}<small>{payslip.payeRuleVersion}</small></td>
          <td>{payslip.currency} {Number(payslip.totalDeductions).toFixed(2)}</td>
          <td><strong>{payslip.currency} {Number(payslip.netSalary).toFixed(2)}</strong></td>
        </tr>)}</tbody>
      </table></div> : <Empty text="No payslips are available for this run." />}
    </div>}
  </>
}
