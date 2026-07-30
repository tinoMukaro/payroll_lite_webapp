import type {
  AuthResponse,
  Employee,
  EmployeeFormData,
  CurrencyCode,
  PayrollRun,
  Payslip,
  NssaRule,
  NssaRuleFormData,
  RegisterRequest,
  User,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:9090/api'

interface ApiError {
  message?: string
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as ApiError
    throw new Error(error.message ?? `Request failed (${response.status})`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const authService = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: RegisterRequest) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
}

export const employeeService = {
  list: (token: string) => request<Employee[]>('/employees', {}, token),
  create: (data: EmployeeFormData, token: string) =>
    request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify({ ...data, basicSalary: Number(data.basicSalary) }),
    }, token),
}

export const payrollService = {
  list: (token: string) => request<PayrollRun[]>('/payroll-runs', {}, token),
  create: (month: number, year: number, currency: CurrencyCode, token: string) =>
    request<PayrollRun>('/payroll-runs', {
      method: 'POST',
      body: JSON.stringify({ month, year, currency }),
    }, token),
  process: (id: number, token: string) =>
    request<PayrollRun>(`/payroll-runs/${id}/process`, { method: 'POST' }, token),
  payslips: (id: number, token: string) =>
    request<Payslip[]>(`/payroll-runs/${id}/payslips`, {}, token),
  mine: (token: string) => request<Payslip[]>('/payslips/me', {}, token),
}

export const userService = {
  list: (token: string) => request<User[]>('/users', {}, token),
}
function nssaPayload(data: NssaRuleFormData) {
  return {
    version: data.version,
    currency: data.currency,
    effectiveFrom: data.effectiveFrom,
    effectiveTo: data.effectiveTo || null,
    employeeRate: Number(data.employeeRatePercent) / 100,
    employerRate: Number(data.employerRatePercent) / 100,
    pensionableEarningsCeiling: Number(data.pensionableEarningsCeiling),
    active: data.active,
  }
}

export const nssaRuleService = {
  list: (token: string) => request<NssaRule[]>('/nssa-rules', {}, token),
  create: (data: NssaRuleFormData, token: string) =>
    request<NssaRule>('/nssa-rules', { method: 'POST', body: JSON.stringify(nssaPayload(data)) }, token),
  update: (id: number, data: NssaRuleFormData, token: string) =>
    request<NssaRule>(`/nssa-rules/${id}`, { method: 'PUT', body: JSON.stringify(nssaPayload(data)) }, token),
}