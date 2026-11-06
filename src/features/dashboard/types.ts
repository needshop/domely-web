export interface DashboardKpis {
  properties: { total: number; addedThisMonth: number }
  tenants: { active: number; newThisMonth: number }
  occupancy: { rate: number; previousRate: number }
  collected: { amount: number; previousAmount: number }
}

export interface MonthlyCollection {
  /** Premier jour du mois (ISO) */
  month: string
  collected: number
  expected: number
}

export interface Occupancy {
  rented: number
  vacant: number
  underWorks: number
}

export interface LateRent {
  id: string
  tenant: string
  property: string
  amount: number
  /** Date d'échéance (ISO) */
  dueDate: string
}

export type DeadlineKind = 'leaseEnd' | 'insurance' | 'rentReview' | 'inspection'

export interface Deadline {
  id: string
  kind: DeadlineKind
  property: string
  date: string
}

export type MaintenanceStatus = 'new' | 'scheduled' | 'inProgress'
export type MaintenancePriority = 'low' | 'normal' | 'urgent'

export interface MaintenanceRequest {
  id: string
  title: string
  property: string
  status: MaintenanceStatus
  priority: MaintenancePriority
  openedAt: string
}

export type PropertyType = 'residence' | 'house' | 'building'

export interface RecentProperty {
  id: string
  name: string
  city: string
  type: PropertyType
  units: number
  occupiedUnits: number
}

export interface DashboardData {
  kpis: DashboardKpis
  collections: MonthlyCollection[]
  occupancy: Occupancy
  lateRents: LateRent[]
  deadlines: Deadline[]
  maintenance: MaintenanceRequest[]
  recentProperties: RecentProperty[]
}
