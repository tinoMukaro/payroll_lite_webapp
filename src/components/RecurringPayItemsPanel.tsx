import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Empty, ErrorNotice } from './ui'
import { recurringPayItemService } from '../services/api'
import type {
  Employee,
  PayrollAdjustmentType,
  RecurringPayItem,
  RecurringPayItemFormData,
} from '../types'

interface RecurringPayItemsPanelProps {
  employee: Employee
  token: string
  onClose: () => void
}

function firstDayOfCurrentMonth() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
}

function emptyForm(): RecurringPayItemFormData {
  return {
    type: 'EARNING',
    description: '',
    amount: '',
    taxable: true,
    effectiveFrom: firstDayOfCurrentMonth(),
    effectiveTo: '',
    active: true,
  }
}

export function RecurringPayItemsPanel({ employee, token, onClose }: RecurringPayItemsPanelProps) {
  const [items, setItems] = useState<RecurringPayItem[]>([])
  const [form, setForm] = useState<RecurringPayItemFormData>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadItems = useCallback(() => {
    recurringPayItemService.list(employee.id, token)
      .then(setItems)
      .catch(value => setError(value instanceof Error ? value.message : 'Could not load recurring items'))
      .finally(() => setLoading(false))
  }, [employee.id, token])

  useEffect(() => { loadItems() }, [loadItems])

  function changeType(type: PayrollAdjustmentType) {
    setForm(current => ({
      ...current,
      type,
      taxable: type === 'EARNING' ? current.taxable : false,
    }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editingId) {
        await recurringPayItemService.update(employee.id, editingId, form, token)
      } else {
        await recurringPayItemService.create(employee.id, form, token)
      }
      setForm(emptyForm())
      setEditingId(null)
      loadItems()
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Could not save recurring item')
    } finally {
      setSaving(false)
    }
  }

  function edit(item: RecurringPayItem) {
    setEditingId(item.id)
    setForm({
      type: item.type,
      description: item.description,
      amount: String(item.amount),
      taxable: item.taxable,
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo ?? '',
      active: item.active,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
  }

  return <section className="panel recurring-panel">
    <div className="panel-head"><div>
      <h3>Recurring pay items — {employee.firstName} {employee.lastName}</h3>
      <p>Fixed monthly amounts in {employee.salaryCurrency}. Items are selected by their effective dates when payroll is processed.</p>
    </div><button className="secondary" onClick={onClose}>Close</button></div>
    <ErrorNotice message={error} />
    <form className="recurring-form" onSubmit={submit}>
      <label>Type<select value={form.type} onChange={event => changeType(event.target.value as PayrollAdjustmentType)}>
        <option value="EARNING">Earning</option><option value="DEDUCTION">Deduction</option>
      </select></label>
      <label>Description<input required maxLength={100} placeholder="e.g. Transport allowance" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
      <label>Monthly amount<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} /></label>
      <label>Effective from<input required type="date" value={form.effectiveFrom} onChange={event => setForm({ ...form, effectiveFrom: event.target.value })} /></label>
      <label>Effective to <small>Optional</small><input type="date" min={form.effectiveFrom} value={form.effectiveTo} onChange={event => setForm({ ...form, effectiveTo: event.target.value })} /></label>
      <label className={`check-label ${form.type === 'DEDUCTION' ? 'disabled-check' : ''}`}><input type="checkbox" checked={form.taxable} disabled={form.type === 'DEDUCTION'} onChange={event => setForm({ ...form, taxable: event.target.checked })} />Taxable earning</label>
      <label className="check-label"><input type="checkbox" checked={form.active} onChange={event => setForm({ ...form, active: event.target.checked })} />Active</label>
      <div className="recurring-actions">
        {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
        <button className="primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update item' : 'Add item'}</button>
      </div>
    </form>
    {loading ? <p className="muted">Loading recurring items...</p> : items.length ? <div className="table-wrap recurring-list"><table>
      <thead><tr><th>Description</th><th>Type</th><th>Amount</th><th>Tax treatment</th><th>Effective period</th><th>Status</th><th></th></tr></thead>
      <tbody>{items.map(item => <tr key={item.id}>
        <td><strong>{item.description}</strong></td>
        <td><span className={`badge ${item.type.toLowerCase()}`}>{item.type}</span></td>
        <td>{item.currency} {Number(item.amount).toFixed(2)}</td>
        <td>{item.type === 'EARNING' ? (item.taxable ? 'Taxable' : 'Non-taxable') : 'After tax'}</td>
        <td>{item.effectiveFrom}<small>to {item.effectiveTo ?? 'ongoing'}</small></td>
        <td><span className={`badge ${item.active ? 'active' : 'cancelled'}`}>{item.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
        <td className="row-actions"><button onClick={() => edit(item)}>Edit</button></td>
      </tr>)}</tbody>
    </table></div> : <Empty text="No recurring earnings or deductions are configured for this employee." />}
  </section>
}
