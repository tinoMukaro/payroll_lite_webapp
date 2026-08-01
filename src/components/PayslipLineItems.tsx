import type { CurrencyCode, PayslipLineItem } from '../types'

interface PayslipLineItemsProps {
  currency: CurrencyCode
  items: PayslipLineItem[]
}

export function PayslipLineItems({ currency, items }: PayslipLineItemsProps) {
  if (!items.length) return <span className="muted">-</span>

  return <div className="payslip-lines">
    {items.map((item, index) => <div className="payslip-line" key={`${item.type}-${item.description}-${index}`}>
      <span>{item.description}{item.taxable && <small>Taxable</small>}</span>
      <strong className={item.type.toLowerCase()}>
        {item.type === 'EARNING' ? '+' : '-'} {currency} {Number(item.amount).toFixed(2)}
      </strong>
    </div>)}
  </div>
}
