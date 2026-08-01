import { useState } from 'react'
import { NssaRulesScreen } from './NssaRulesScreen'
import { PayeTaxTablesScreen } from './PayeTaxTablesScreen'

type StatutoryTab = 'nssa' | 'paye'

export function StatutorySettingsScreen({ token }: { token: string }) {
  const [tab, setTab] = useState<StatutoryTab>('nssa')

  return <>
    <div className="section-tabs" role="tablist" aria-label="Statutory settings">
      <button className={tab === 'nssa' ? 'active' : ''} onClick={() => setTab('nssa')}>NSSA</button>
      <button className={tab === 'paye' ? 'active' : ''} onClick={() => setTab('paye')}>PAYE tax tables</button>
    </div>
    {tab === 'nssa' ? <NssaRulesScreen token={token} /> : <PayeTaxTablesScreen token={token} />}
  </>
}
