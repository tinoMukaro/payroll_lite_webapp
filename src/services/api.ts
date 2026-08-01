import type {
  AuthResponse,
  Employee,
  EmployeeFormData,
  CurrencyCode,
  PayrollRun,
  PayrollAdjustment,
  PayrollAdjustmentFormData,
  Payslip,
  NssaRule,
  NssaRuleFormData,
  PayeTaxTable,
  PayeTaxTableFormData,
  RegisterRequest,
  RecurringPayItem,
  RecurringPayItemFormData,
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

async function requestBlob(path: string, token: string): Promise<Blob> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as ApiError
    throw new Error(error.message ?? `Request failed (${response.status})`)
  }
  return response.blob()
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

function recurringPayItemPayload(data: RecurringPayItemFormData) {
  return {
    ...data,
    amount: Number(data.amount),
    effectiveTo: data.effectiveTo || null,
    taxable: data.type === 'EARNING' && data.taxable,
  }
}

export const recurringPayItemService = {
  list: (employeeId: number, token: string) =>
    request<RecurringPayItem[]>(`/employees/${employeeId}/recurring-pay-items`, {}, token),
  create: (employeeId: number, data: RecurringPayItemFormData, token: string) =>
    request<RecurringPayItem>(`/employees/${employeeId}/recurring-pay-items`, {
      method: 'POST', body: JSON.stringify(recurringPayItemPayload(data)),
    }, token),
  update: (employeeId: number, payItemId: number, data: RecurringPayItemFormData, token: string) =>
    request<RecurringPayItem>(`/employees/${employeeId}/recurring-pay-items/${payItemId}`, {
      method: 'PUT', body: JSON.stringify(recurringPayItemPayload(data)),
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
  preview: (id: number, token: string) =>
    request<Payslip[]>(`/payroll-runs/${id}/preview`, {}, token),
  payslips: (id: number, token: string) =>
    request<Payslip[]>(`/payroll-runs/${id}/payslips`, {}, token),
  mine: (token: string) => request<Payslip[]>('/payslips/me', {}, token),
  downloadPayslip: (id: number, token: string) =>
    requestBlob(`/payslips/${id}/pdf`, token),
}

export const payrollAdjustmentService = {
  list: (payrollRunId: number, token: string) =>
    request<PayrollAdjustment[]>(`/payroll-runs/${payrollRunId}/adjustments`, {}, token),
  create: (payrollRunId: number, data: PayrollAdjustmentFormData, token: string) =>
    request<PayrollAdjustment>(`/payroll-runs/${payrollRunId}/adjustments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),
  remove: (payrollRunId: number, adjustmentId: number, token: string) =>
    request<void>(`/payroll-runs/${payrollRunId}/adjustments/${adjustmentId}`, {
      method: 'DELETE',
    }, token),
}

export const userService = {
  list: (token: string) => request<User[]>('/users', {}, token),
  updateRole: (id: number, role: User['role'], token: string) =>
    request<User>(`/users/${id}/role`, {
      method: 'PATCH', body: JSON.stringify({ role }),
    }, token),
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

function payePayload(data: PayeTaxTableFormData) {
  return {
    version: data.version,
    currency: data.currency,
    effectiveFrom: data.effectiveFrom,
    effectiveTo: data.effectiveTo || null,
    aidsLevyRate: Number(data.aidsLevyPercent) / 100,
    active: data.active,
    bands: data.bands.map(band => ({
      lowerBound: Number(band.lowerBound),
      upperBound: band.upperBound === '' ? null : Number(band.upperBound),
      rate: Number(band.ratePercent) / 100,
    })),
  }
}

export const payeTaxTableService = {
  list: (token: string) => request<PayeTaxTable[]>('/paye-tax-tables', {}, token),
  create: (data: PayeTaxTableFormData, token: string) =>
    request<PayeTaxTable>('/paye-tax-tables', {
      method: 'POST', body: JSON.stringify(payePayload(data)),
    }, token),
  update: (id: number, data: PayeTaxTableFormData, token: string) =>
    request<PayeTaxTable>(`/paye-tax-tables/${id}`, {
      method: 'PUT', body: JSON.stringify(payePayload(data)),
    }, token),
}
