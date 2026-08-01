import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Empty, ErrorNotice } from './ui'
import { employeeService, payrollAdjustmentService } from '../services/api'
import type {
  Employee,
  PayrollAdjustment,
  PayrollAdjustmentType,
  PayrollRun,
} from '../types'

interface PayrollAdjustmentsPanelProps {
  run: PayrollRun
  token: string
  onClose: () => void
}

export function PayrollAdjustmentsPanel({ run, token, onClose }: PayrollAdjustmentsPanelProps) {
  const [adjustments, setAdjustments] = useState<PayrollAdjustment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [type, setType] = useState<PayrollAdjustmentType>('EARNING')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [taxable, setTaxable] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const eligibleEmployees = useMemo(() => employees.filter(employee =>
    employee.status === 'ACTIVE' && employee.salaryCurrency === run.currency
  ), [employees, run.currency])

  useEffect(() => {
    Promise.all([
      payrollAdjustmentService.list(run.id, token),
      employeeService.list(token),
    ])
      .then(([adjustmentData, employeeData]) => {
        setAdjustments(adjustmentData)
        setEmployees(employeeData)
        const firstEligible = employeeData.find(employee =>
          employee.status === 'ACTIVE' && employee.salaryCurrency === run.currency
        )
        setEmployeeId(firstEligible ? String(firstEligible.id) : '')
      })
      .catch(value => setError(value instanceof Error ? value.message : 'Could not load adjustments'))
      .finally(() => setLoading(false))
  }, [run.id, run.currency, token])

  async function addAdjustment(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const created = await payrollAdjustmentService.create(run.id, {
        employeeId: Number(employeeId),
        type,
        description,
        amount: Number(amount),
        taxable: type === 'EARNING' && taxable,
      }, token)
      setAdjustments(current => [...current, created])
      setDescription('')
      setAmount('')
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Could not add adjustment')
    } finally {
      setSaving(false)
    }
  }

  async function removeAdjustment(adjustment: PayrollAdjustment) {
    if (!confirm(`Remove ${adjustment.description} for ${adjustment.employeeName}?`)) return
    setError('')
    try {
      await payrollAdjustmentService.remove(run.id, adjustment.id, token)
      setAdjustments(current => current.filter(item => item.id !== adjustment.id))
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Could not remove adjustment')
    }
  }

  return <section className="panel adjustment-panel">
    <div className="panel-head"><div>
      <h3>Adjustments for run #{run.id}</h3>
      <p>One-off inputs for {run.month}/{run.year} in {run.currency}. Earnings affect gross pay; only taxable earnings affect PAYE.</p>
    </div><button className="secondary" onClick={onClose}>Close</button></div>
    <ErrorNotice message={error} />
    {!loading && eligibleEmployees.length ? <form className="adjustment-form" onSubmit={addAdjustment}>
      <label>Employee<select required value={employeeId} onChange={event => setEmployeeId(event.target.value)}>
        {eligibleEmployees.map(employee => <option key={employee.id} value={employee.id}>
          {employee.employeeNumber} — {employee.firstName} {employee.lastName}
        </option>)}
      </select></label>
      <label>Type<select value={type} onChange={event => {
        const nextType = event.target.value as PayrollAdjustmentType
        setType(nextType)
        if (nextType === 'DEDUCTION') setTaxable(false)
      }}><option value="EARNING">Earning</option><option value="DEDUCTION">Deduction</option></select></label>
      <label>Description<input required maxLength={100} placeholder="e.g. Performance bonus" value={description} onChange={event => setDescription(event.target.value)} /></label>
      <label>Amount<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} /></label>
      <label className={`check-label ${type === 'DEDUCTION' ? 'disabled-check' : ''}`}>
        <input type="checkbox" checked={taxable} disabled={type === 'DEDUCTION'} onChange={event => setTaxable(event.target.checked)} />Taxable earning
      </label>
      <button className="primary" disabled={saving}>{saving ? 'Adding...' : 'Add adjustment'}</button>
    </form> : !loading && <Empty text={`No active ${run.currency} employees are available for this run.`} />}
    {loading ? <p className="muted">Loading adjustments...</p> : adjustments.length ? <div className="table-wrap adjustment-list"><table>
      <thead><tr><th>Employee</th><th>Type</th><th>Description</th><th>Amount</th><th>Tax treatment</th><th></th></tr></thead>
      <tbody>{adjustments.map(adjustment => <tr key={adjustment.id}>
        <td><strong>{adjustment.employeeName}</strong><small>{adjustment.employeeNumber}</small></td>
        <td><span className={`badge ${adjustment.type.toLowerCase()}`}>{adjustment.type}</span></td>
        <td>{adjustment.description}</td>
        <td>{run.currency} {Number(adjustment.amount).toFixed(2)}</td>
        <td>{adjustment.type === 'EARNING' ? (adjustment.taxable ? 'Taxable' : 'Non-taxable') : 'After tax'}</td>
        <td className="row-actions"><button onClick={() => removeAdjustment(adjustment)}>Remove</button></td>
      </tr>)}</tbody>
    </table></div> : !loading && eligibleEmployees.length > 0 && <Empty text="No adjustments have been added to this draft." />}
  </section>
}
