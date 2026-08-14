export type Role = 'ADMIN' | 'HR' | 'EMPLOYEE'
export type View = 'dashboard' | 'employees' | 'payroll' | 'statutory' | 'users' | 'audit' | 'profile'
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED'
export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'CANCELLED'
export type CurrencyCode = 'USD' | 'ZWG'
export type PayrollAdjustmentType = 'EARNING' | 'DEDUCTION'
export type PayItemSource = 'ONE_OFF' | 'RECURRING'
export type AuditAction =
  | 'ADMIN_BOOTSTRAPPED'
  | 'USER_REGISTERED'
  | 'INTERNAL_USER_CREATED'
  | 'USER_ROLE_CHANGED'
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_UPDATED'
  | 'EMPLOYEE_DELETED'
  | 'NSSA_RULE_CREATED'
  | 'NSSA_RULE_UPDATED'
  | 'PAYE_TABLE_CREATED'
  | 'PAYE_TABLE_UPDATED'
  | 'RECURRING_PAY_ITEM_CREATED'
  | 'RECURRING_PAY_ITEM_UPDATED'
  | 'PAYROLL_RUN_CREATED'
  | 'PAYROLL_RUN_PROCESSED'
  | 'PAYROLL_ADJUSTMENT_CREATED'
  | 'PAYROLL_ADJUSTMENT_DELETED'
  | 'PAYSLIP_DOWNLOADED'
export type AuditEntityType =
  | 'USER'
  | 'EMPLOYEE'
  | 'NSSA_RULE'
  | 'PAYE_TABLE'
  | 'RECURRING_PAY_ITEM'
  | 'PAYROLL_RUN'
  | 'PAYROLL_ADJUSTMENT'
  | 'PAYSLIP'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: Role
  enabled?: boolean
  employeeId?: number | null
}

export interface InternalUserFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'ADMIN' | 'HR'
}

export interface AuditEvent {
  id: number
  actorUserId: number | null
  actorEmail: string | null
  actorRole: Role | null
  action: AuditAction
  entityType: AuditEntityType
  entityId: number | null
  details: string | null
  occurredAt: string
}

export interface AuditEventPage {
  content: AuditEvent[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AuditEventFilters {
  action?: AuditAction
  entityType?: AuditEntityType
  actorEmail?: string
  from?: string
  to?: string
  page?: number
  size?: number
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
  id: number | null
  employeeId: number
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
  taxableIncome: number
  incomeTaxBeforeCredits: number
  taxCreditsApplied: number
  aidsLevy: number
  payeRuleVersion: string
  totalDeductions: number
  netSalary: number
  additionalEarnings: number
  otherDeductions: number
  lineItems: PayslipLineItem[]
  createdAt: string | null
}

export interface PayrollAdjustment {
  id: number
  payrollRunId: number
  employeeId: number
  employeeNumber: string
  employeeName: string
  type: PayrollAdjustmentType
  description: string
  amount: number
  taxable: boolean
  createdAt: string
}

export interface PayrollAdjustmentFormData {
  employeeId: number
  type: PayrollAdjustmentType
  description: string
  amount: number
  taxable: boolean
}

export interface PayslipLineItem {
  type: PayrollAdjustmentType
  description: string
  amount: number
  taxable: boolean
  source: PayItemSource
}

export interface RecurringPayItem {
  id: number
  employeeId: number
  employeeNumber: string
  employeeName: string
  currency: CurrencyCode
  type: PayrollAdjustmentType
  description: string
  amount: number
  taxable: boolean
  effectiveFrom: string
  effectiveTo: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface RecurringPayItemFormData {
  type: PayrollAdjustmentType
  description: string
  amount: string
  taxable: boolean
  effectiveFrom: string
  effectiveTo: string
  active: boolean
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

export interface PayeTaxBand {
  id: number
  lowerBound: number
  upperBound: number | null
  rate: number
}

export interface PayeTaxTable {
  id: number
  version: string
  currency: CurrencyCode
  effectiveFrom: string
  effectiveTo: string | null
  aidsLevyRate: number
  active: boolean
  bands: PayeTaxBand[]
}

export interface PayeTaxBandFormData {
  lowerBound: string
  upperBound: string
  ratePercent: string
}

export interface PayeTaxTableFormData {
  version: string
  currency: CurrencyCode
  effectiveFrom: string
  effectiveTo: string
  aidsLevyPercent: string
  active: boolean
  bands: PayeTaxBandFormData[]
}
