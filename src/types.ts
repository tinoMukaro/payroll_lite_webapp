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
}

export interface EmployeeFormData {
  employeeNumber: string
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
  basicSalary: number
  totalDeductions: number
  netSalary: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}