/**
 * Indicateurs propres au tableau de bord (biens, occupation, loyers et impayés viennent
 * des modules Biens, Contrats et Loyers).
 */
export interface DashboardKpis {
  properties: { addedThisMonth: number }
  tenants: { newThisMonth: number }
}

export interface Occupancy {
  rented: number
  vacant: number
  underWorks: number
}

export type { MonthlyCollection } from '@/components/charts/RentCollectionChart'

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

export interface DashboardData {
  kpis: DashboardKpis
  deadlines: Deadline[]
}
