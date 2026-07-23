export type Role = 'ADMIN' | 'HR' | 'EMPLOYEE'
export type View = 'dashboard' | 'employees' | 'payroll' | 'users' | 'profile'
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED'
export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'CANCELLED'

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
  hireDate: string
  status: EmployeeStatus
}

export interface PayrollRun {
  id: number
  month: number
  year: number
  status: PayrollStatus
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
  basicSalary: number
  grossSalary: number
  nssaDeduction: number
  payeDeduction: number
  totalDeductions: number
  netSalary: number
  createdAt: string
}

export interface AuthResponse { token: string; user: User }
export interface RegisterRequest { firstName: string; lastName: string; email: string; password: string }