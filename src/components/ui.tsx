interface StatProps {
  label: string
  value: string | number
}

export function Stat({ label, value }: StatProps) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>
}

export function Empty({ text }: { text: string }) {
  return <div className="empty"><strong>Nothing to show</strong><p>{text}</p></div>
}

export function ErrorNotice({ message }: { message: string }) {
  if (!message) return null
  return <div className="notice error">{message}</div>
}