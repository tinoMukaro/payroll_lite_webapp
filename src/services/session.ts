import type { AuthResponse } from '../types'

const STORAGE_KEY = 'payroll-auth'

export const sessionService = {
  load(): AuthResponse | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) as AuthResponse : null
    } catch {
      return null
    }
  },
  save(auth: AuthResponse) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },
}