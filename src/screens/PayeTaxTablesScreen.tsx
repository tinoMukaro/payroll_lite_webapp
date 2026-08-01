import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Empty, ErrorNotice } from '../components/ui'
import { payeTaxTableService } from '../services/api'
import type {
  CurrencyCode,
  PayeTaxBandFormData,
  PayeTaxTable,
  PayeTaxTableFormData,
} from '../types'

const initialBand: PayeTaxBandFormData = {
  lowerBound: '0',
  upperBound: '',
  ratePercent: '0',
}

const emptyForm: PayeTaxTableFormData = {
  version: '',
  currency: 'USD',
  effectiveFrom: '',
  effectiveTo: '',
  aidsLevyPercent: '3',
  active: true,
  bands: [initialBand],
}

function toForm(table: PayeTaxTable): PayeTaxTableFormData {
  return {
    version: table.version,
    currency: table.currency,
    effectiveFrom: table.effectiveFrom,
    effectiveTo: table.effectiveTo ?? '',
    aidsLevyPercent: String(Number(table.aidsLevyRate) * 100),
    active: table.active,
    bands: table.bands.map(band => ({
      lowerBound: String(band.lowerBound),
      upperBound: band.upperBound === null ? '' : String(band.upperBound),
      ratePercent: String(Number(band.rate) * 100),
    })),
  }
}

export function PayeTaxTablesScreen({ token }: { token: string }) {
  const [tables, setTables] = useState<PayeTaxTable[]>([])
  const [form, setForm] = useState<PayeTaxTableFormData>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadTables = useCallback(() => {
    payeTaxTableService.list(token).then(setTables).catch(value => setError(value.message))
  }, [token])

  useEffect(() => { loadTables() }, [loadTables])

  function update<K extends keyof Omit<PayeTaxTableFormData, 'bands'>>(
    key: K,
    value: PayeTaxTableFormData[K],
  ) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function updateBand(index: number, key: keyof PayeTaxBandFormData, value: string) {
    setForm(current => ({
      ...current,
      bands: current.bands.map((band, bandIndex) =>
        bandIndex === index ? { ...band, [key]: value } : band),
    }))
  }

  function addBand() {
    const previous = form.bands.at(-1)
    if (!previous?.upperBound) {
      setError('Enter an upper bound for the current final band before adding another band.')
      return
    }
    setError('')
    setForm(current => ({
      ...current,
      bands: [...current.bands, {
        lowerBound: previous.upperBound,
        upperBound: '',
        ratePercent: '',
      }],
    }))
  }

  function removeBand(index: number) {
    if (form.bands.length === 1) return
    setForm(current => ({
      ...current,
      bands: current.bands.filter((_, bandIndex) => bandIndex !== index),
    }))
  }

  function resetForm() {
    setForm({ ...emptyForm, bands: [{ ...initialBand }] })
    setEditingId(null)
    setError('')
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId === null) await payeTaxTableService.create(form, token)
      else await payeTaxTableService.update(editingId, form, token)
      resetForm()
      loadTables()
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Could not save PAYE tax table')
    } finally {
      setSaving(false)
    }
  }

  function edit(table: PayeTaxTable) {
    setEditingId(table.id)
    setForm(toForm(table))
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <>
    <div className="panel settings-intro">
      <h3>How PAYE tables are used</h3>
      <p>Payroll selects one active monthly table matching its currency and period. Bands must start at zero, meet without gaps, and finish with one open-ended band. Enter rates as percentages.</p>
    </div>

    <form className="panel rule-form" onSubmit={save}>
      <div className="panel-head">
        <div><h3>{editingId === null ? 'Add PAYE tax table' : `Edit PAYE table #${editingId}`}</h3><p>Use monthly values from an official ZIMRA tax table.</p></div>
        {editingId !== null && <button type="button" className="secondary" onClick={resetForm}>Cancel editing</button>}
      </div>
      <div className="form-grid rule-fields">
        <label>Table version<input required value={form.version} placeholder="e.g. PAYE-USD-2026" onChange={event => update('version', event.target.value)} /></label>
        <label>Currency<select value={form.currency} onChange={event => update('currency', event.target.value as CurrencyCode)}><option value="USD">USD</option><option value="ZWG">ZWG</option></select></label>
        <label>Effective from<input required type="date" value={form.effectiveFrom} onChange={event => update('effectiveFrom', event.target.value)} /></label>
        <label>Effective to <small>Optional</small><input type="date" value={form.effectiveTo} onChange={event => update('effectiveTo', event.target.value)} /></label>
        <label>AIDS levy (%)<input required type="number" min="0" max="100" step="0.0001" value={form.aidsLevyPercent} onChange={event => update('aidsLevyPercent', event.target.value)} /></label>
        <label className="check-label"><input type="checkbox" checked={form.active} onChange={event => update('active', event.target.checked)} /> Active and available to payroll</label>
      </div>

      <div className="band-editor">
        <div className="panel-head"><div><h3>Progressive monthly bands</h3><p>The final upper bound must remain blank.</p></div><button type="button" className="secondary" onClick={addBand}>Add band</button></div>
        {form.bands.map((band, index) => <div className="band-row" key={index}>
          <span className="band-number">{index + 1}</span>
          <label>From<input required type="number" min="0" step="0.01" value={band.lowerBound} onChange={event => updateBand(index, 'lowerBound', event.target.value)} /></label>
          <label>To {index === form.bands.length - 1 && <small>Blank = and above</small>}<input type="number" min="0" step="0.01" value={band.upperBound} onChange={event => updateBand(index, 'upperBound', event.target.value)} /></label>
          <label>Rate (%)<input required type="number" min="0" max="100" step="0.0001" value={band.ratePercent} onChange={event => updateBand(index, 'ratePercent', event.target.value)} /></label>
          <button type="button" className="remove-band" disabled={form.bands.length === 1} onClick={() => removeBand(index)}>Remove</button>
        </div>)}
      </div>

      <ErrorNotice message={error} />
      <div className="form-actions"><button className="primary" disabled={saving}>{saving ? 'Saving...' : editingId === null ? 'Add table' : 'Save changes'}</button></div>
    </form>

    <div className="panel table-wrap"><table>
      <thead><tr><th>Version</th><th>Currency</th><th>Effective period</th><th>AIDS levy</th><th>Bands</th><th>Status</th><th></th></tr></thead>
      <tbody>{tables.map(table => <tr key={table.id}>
        <td><strong>{table.version}</strong><small>Table #{table.id}</small></td>
        <td><span className="badge">{table.currency}</span></td>
        <td>{table.effectiveFrom}<small>to {table.effectiveTo ?? 'ongoing'}</small></td>
        <td>{(Number(table.aidsLevyRate) * 100).toFixed(2)}%</td>
        <td><strong>{table.bands.length}</strong><small>{table.bands.map(band => `${band.lowerBound}-${band.upperBound ?? 'above'} @ ${(Number(band.rate) * 100).toFixed(2)}%`).join(' | ')}</small></td>
        <td><span className={`badge ${table.active ? 'active' : ''}`}>{table.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
        <td className="row-actions"><button onClick={() => edit(table)}>Edit</button></td>
      </tr>)}</tbody>
    </table>{!tables.length && <Empty text="No PAYE tax tables have been configured yet." />}</div>
  </>
}
