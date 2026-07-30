export type Role = 'ADMIN' | 'HR' | 'EMPLOYEE'
export type View = 'dashboard' | 'employees' | 'payroll' | 'nssaRules' | 'users' | 'profile'
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED'
export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'CANCELLED'
export type CurrencyCode = 'USD' | 'ZWG'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: Role
  enabled?: boolean
  employeeId?: number | null
}

export interface Employee {
  id: number
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  basicSalary: number
  salaryCurrency: CurrencyCode
  hireDate: string
  status: EmployeeStatus
  userId?: number | null
  accountLinked: boolean
}

export interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  basicSalary: string
  salaryCurrency: CurrencyCode
  hireDate: string
  status: EmployeeStatus
}

export interface PayrollRun {
  id: number
  month: number
  year: number
  status: PayrollStatus
  currency: CurrencyCode
  createdAt: string
  processedAt: string | null
}

export interface Payslip {
  id: number
  employeeNumber: string
  employeeName: string
  payrollRunId: number
  month: number
  year: number
  currency: CurrencyCode
  basicSalary: number
  grossSalary: number
  pensionableEarnings: number
  employeeNssaContribution: number
  employerNssaContribution: number
  nssaRuleVersion: string
  payeDeduction: number
  totalDeductions: number
  netSalary: number
  createdAt: string
}

export interface AuthResponse { token: string; user: User }
export interface RegisterRequest { firstName: string; lastName: string; email: string; password: string }
export interface NssaRule {
  id: number
  version: string
  currency: CurrencyCode
  effectiveFrom: string
  effectiveTo: string | null
  employeeRate: number
  employerRate: number
  pensionableEarningsCeiling: number
  active: boolean
}

export interface NssaRuleFormData {
  version: string
  currency: CurrencyCode
  effectiveFrom: string
  effectiveTo: string
  employeeRatePercent: string
  employerRatePercent: string
  pensionableEarningsCeiling: string
  active: boolean
}