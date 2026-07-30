import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Empty, ErrorNotice } from '../components/ui'
import { nssaRuleService } from '../services/api'
import type { CurrencyCode, NssaRule, NssaRuleFormData } from '../types'

const emptyForm: NssaRuleFormData = {
  version: '',
  currency: 'USD',
  effectiveFrom: '',
  effectiveTo: '',
  employeeRatePercent: '4.5',
  employerRatePercent: '4.5',
  pensionableEarningsCeiling: '',
  active: true,
}

function toForm(rule: NssaRule): NssaRuleFormData {
  return {
    version: rule.version,
    currency: rule.currency,
    effectiveFrom: rule.effectiveFrom,
    effectiveTo: rule.effectiveTo ?? '',
    employeeRatePercent: String(Number(rule.employeeRate) * 100),
    employerRatePercent: String(Number(rule.employerRate) * 100),
    pensionableEarningsCeiling: String(rule.pensionableEarningsCeiling),
    active: rule.active,
  }
}

export function NssaRulesScreen({ token }: { token: string }) {
  const [rules, setRules] = useState<NssaRule[]>([])
  const [form, setForm] = useState<NssaRuleFormData>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadRules = useCallback(() => {
    nssaRuleService.list(token).then(setRules).catch(value => setError(value.message))
  }, [token])

  useEffect(() => { loadRules() }, [loadRules])

  function update<K extends keyof NssaRuleFormData>(key: K, value: NssaRuleFormData[K]) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId === null) await nssaRuleService.create(form, token)
      else await nssaRuleService.update(editingId, form, token)
      resetForm()
      loadRules()
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Could not save NSSA rule')
    } finally {
      setSaving(false)
    }
  }

  function edit(rule: NssaRule) {
    setEditingId(rule.id)
    setForm(toForm(rule))
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <>
    <div className="panel settings-intro">
      <h3>How these rules are used</h3>
      <p>When payroll is processed, the system selects the active rule matching its currency and period. Rates are entered as percentages; the ceiling is the maximum salary amount used for NSSA.</p>
    </div>

    <form className="panel rule-form" onSubmit={save}>
      <div className="panel-head">
        <div><h3>{editingId === null ? 'Add NSSA rule' : `Edit NSSA rule #${editingId}`}</h3><p>Use values from an official NSSA notice.</p></div>
        {editingId !== null && <button type="button" className="secondary" onClick={resetForm}>Cancel editing</button>}
      </div>
      <div className="form-grid rule-fields">
        <label>Rule version<input required value={form.version} placeholder="e.g. NSSA-USD-2026-01" onChange={event => update('version', event.target.value)} /></label>
        <label>Currency<select value={form.currency} onChange={event => update('currency', event.target.value as CurrencyCode)}><option value="USD">USD</option><option value="ZWG">ZWG</option></select></label>
        <label>Effective from<input required type="date" value={form.effectiveFrom} onChange={event => update('effectiveFrom', event.target.value)} /></label>
        <label>Effective to <small>Optional</small><input type="date" value={form.effectiveTo} onChange={event => update('effectiveTo', event.target.value)} /></label>
        <label>Employee rate (%)<input required type="number" min="0" max="100" step="0.0001" value={form.employeeRatePercent} onChange={event => update('employeeRatePercent', event.target.value)} /></label>
        <label>Employer rate (%)<input required type="number" min="0" max="100" step="0.0001" value={form.employerRatePercent} onChange={event => update('employerRatePercent', event.target.value)} /></label>
        <label>Pensionable earnings ceiling<input required type="number" min="0.01" step="0.01" value={form.pensionableEarningsCeiling} onChange={event => update('pensionableEarningsCeiling', event.target.value)} /></label>
        <label className="check-label"><input type="checkbox" checked={form.active} onChange={event => update('active', event.target.checked)} /> Active and available to payroll</label>
      </div>
      <ErrorNotice message={error} />
      <div className="form-actions"><button className="primary" disabled={saving}>{saving ? 'Saving...' : editingId === null ? 'Add rule' : 'Save changes'}</button></div>
    </form>

    <div className="panel table-wrap"><table>
      <thead><tr><th>Version</th><th>Currency</th><th>Effective period</th><th>Employee</th><th>Employer</th><th>Ceiling</th><th>Status</th><th></th></tr></thead>
      <tbody>{rules.map(rule => <tr key={rule.id}>
        <td><strong>{rule.version}</strong><small>Rule #{rule.id}</small></td>
        <td><span className="badge">{rule.currency}</span></td>
        <td>{rule.effectiveFrom}<small>to {rule.effectiveTo ?? 'ongoing'}</small></td>
        <td>{(Number(rule.employeeRate) * 100).toFixed(2)}%</td>
        <td>{(Number(rule.employerRate) * 100).toFixed(2)}%</td>
        <td>{rule.currency} {Number(rule.pensionableEarningsCeiling).toFixed(2)}</td>
        <td><span className={`badge ${rule.active ? 'active' : ''}`}>{rule.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
        <td className="row-actions"><button onClick={() => edit(rule)}>Edit</button></td>
      </tr>)}</tbody>
    </table>{!rules.length && <Empty text="No NSSA rules have been configured yet." />}</div>
  </>
}