import { useState } from 'react'
import { payrollService } from '../services/api'
import type { Payslip } from '../types'

export function PayslipDownloadButton({ payslip, token }: { payslip: Payslip; token: string }) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  if (payslip.id === null) return null

  async function download() {
    if (payslip.id === null) return
    setDownloading(true)
    setError('')
    try {
      const blob = await payrollService.downloadPayslip(payslip.id, token)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Payslip-${payslip.employeeNumber}-${payslip.year}-${String(payslip.month).padStart(2, '0')}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  return <div className="download-control">
    <button onClick={download} disabled={downloading}>{downloading ? 'Downloading...' : 'Download PDF'}</button>
    {error && <small>{error}</small>}
  </div>
}
