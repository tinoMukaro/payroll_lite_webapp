import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Empty, ErrorNotice } from '../components/ui'
import { auditService } from '../services/api'
import type { AuditAction, AuditEntityType, AuditEventPage } from '../types'

const actions: AuditAction[] = [
  'ADMIN_BOOTSTRAPPED', 'USER_REGISTERED', 'USER_ROLE_CHANGED',
  'EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED',
  'NSSA_RULE_CREATED', 'NSSA_RULE_UPDATED', 'PAYE_TABLE_CREATED', 'PAYE_TABLE_UPDATED',
  'RECURRING_PAY_ITEM_CREATED', 'RECURRING_PAY_ITEM_UPDATED',
  'PAYROLL_RUN_CREATED', 'PAYROLL_RUN_PROCESSED',
  'PAYROLL_ADJUSTMENT_CREATED', 'PAYROLL_ADJUSTMENT_DELETED', 'PAYSLIP_DOWNLOADED',
]

const entityTypes: AuditEntityType[] = [
  'USER', 'EMPLOYEE', 'NSSA_RULE', 'PAYE_TABLE', 'RECURRING_PAY_ITEM',
  'PAYROLL_RUN', 'PAYROLL_ADJUSTMENT', 'PAYSLIP',
]

interface FilterForm {
  action: '' | AuditAction
  entityType: '' | AuditEntityType
  actorEmail: string
  from: string
  to: string
}

const emptyFilters: FilterForm = { action: '', entityType: '', actorEmail: '', from: '', to: '' }

function label(value: string) {
  return value.toLowerCase().replaceAll('_', ' ').replace(/^./, character => character.toUpperCase())
}

function toInstant(value: string, endOfDay = false) {
  if (!value) return undefined
  return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`).toISOString()
}

export function AuditLogScreen({ token }: { token: string }) {
  const [form, setForm] = useState<FilterForm>(emptyFilters)
  const [filters, setFilters] = useState<FilterForm>(emptyFilters)
  const [result, setResult] = useState<AuditEventPage | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true
    auditService.search({
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        actorEmail: filters.actorEmail.trim() || undefined,
        from: toInstant(filters.from),
        to: toInstant(filters.to, true),
        page,
        size: 20,
      }, token).then(value => {
        if (current) setResult(value)
      }).catch(value => {
        if (current) setError(value instanceof Error ? value.message : 'Could not load audit events')
      }).finally(() => {
        if (current) setLoading(false)
      })
    return () => { current = false }
  }, [filters, page, token])

  function search(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    setPage(0)
    setFilters({ ...form })
  }

  function clear() {
    setError('')
    setLoading(true)
    setForm(emptyFilters)
    setPage(0)
    setFilters(emptyFilters)
  }

  function changePage(nextPage: number) {
    setError('')
    setLoading(true)
    setPage(nextPage)
  }

  return <>
    <div className="panel settings-intro">
      <h3>Business history</h3>
      <p>Review who changed payroll-related records and when. Events are permanent and cannot be edited or deleted.</p>
    </div>
    <form className="panel audit-filters" onSubmit={search}>
      <label>Action<select value={form.action} onChange={event => setForm(current => ({ ...current, action: event.target.value as FilterForm['action'] }))}>
        <option value="">All actions</option>{actions.map(action => <option key={action} value={action}>{label(action)}</option>)}
      </select></label>
      <label>Record type<select value={form.entityType} onChange={event => setForm(current => ({ ...current, entityType: event.target.value as FilterForm['entityType'] }))}>
        <option value="">All records</option>{entityTypes.map(type => <option key={type} value={type}>{label(type)}</option>)}
      </select></label>
      <label>Actor email<input type="search" placeholder="name@company.com" value={form.actorEmail} onChange={event => setForm(current => ({ ...current, actorEmail: event.target.value }))} /></label>
      <label>From<input type="date" value={form.from} onChange={event => setForm(current => ({ ...current, from: event.target.value }))} /></label>
      <label>To<input type="date" value={form.to} onChange={event => setForm(current => ({ ...current, to: event.target.value }))} /></label>
      <div className="audit-filter-actions"><button type="button" className="secondary" onClick={clear}>Clear</button><button type="submit" className="primary">Search</button></div>
    </form>
    <ErrorNotice message={error} />
    <div className="panel table-wrap"><table>
      <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Record</th><th>Details</th></tr></thead>
      <tbody>{result?.content.map(item => <tr key={item.id}>
        <td className="audit-time"><strong>{new Date(item.occurredAt).toLocaleDateString()}</strong><small>{new Date(item.occurredAt).toLocaleTimeString()}</small></td>
        <td><strong>{item.actorEmail ?? 'SYSTEM'}</strong><small>{item.actorRole ?? 'Automated process'}</small></td>
        <td><span className="badge">{label(item.action)}</span></td>
        <td><strong>{label(item.entityType)}</strong><small>{item.entityId ? `ID ${item.entityId}` : 'No record ID'}</small></td>
        <td className="audit-details">{item.details || '—'}</td>
      </tr>)}</tbody>
    </table>{loading && <Empty text="Loading audit events..." />}{!loading && !error && !result?.content.length && <Empty text="No audit events match these filters." />}</div>
    {result && result.totalPages > 0 && <div className="audit-pagination">
      <span>Showing {result.page * result.size + 1}–{Math.min((result.page + 1) * result.size, result.totalElements)} of {result.totalElements}</span>
      <div><button className="secondary" disabled={result.first || loading} onClick={() => changePage(page - 1)}>Previous</button><span>Page {result.page + 1} of {result.totalPages}</span><button className="secondary" disabled={result.last || loading} onClick={() => changePage(page + 1)}>Next</button></div>
    </div>}
  </>
}
