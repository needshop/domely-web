import type { Lease } from '@/features/contracts/types'
import type { Property, Unit } from '@/features/properties/types'
import type { Tenant } from '@/features/tenants/types'

/** Moyens de paiement courants en Afrique de l'Ouest. */
export const paymentMethods = ['mobileMoney', 'cash', 'bankTransfer', 'check'] as const
export type PaymentMethod = (typeof paymentMethods)[number]

/** Encaissement (total ou partiel) d'une échéance de loyer. */
export interface Payment {
  id: string
  leaseId: string
  /** Mois de l'échéance réglée (AAAA-MM) */
  period: string
  /** Date de l'encaissement (ISO) */
  date: string
  /** Montant encaissé (XOF) */
  amount: number
  method: PaymentMethod
  /** Référence de la transaction (n° Mobile Money, chèque, virement…) */
  reference?: string
  note?: string
}

/** Canaux de relance (ouverts sur l'appareil de l'utilisateur). */
export const reminderChannels = ['whatsapp', 'sms', 'email'] as const
export type ReminderChannel = (typeof reminderChannels)[number]

/** Relance d'un locataire pour une échéance impayée. */
export interface Reminder {
  id: string
  leaseId: string
  /** Mois de l'échéance relancée (AAAA-MM) */
  period: string
  /** Date de la relance (ISO) */
  date: string
  channel: ReminderChannel
}

/**
 * Situation d'une échéance :
 * - paid : réglée intégralement
 * - due : à échoir (date d'échéance non dépassée), rien ou partie réglée
 * - partial : échéance dépassée, partiellement réglée
 * - late : échéance dépassée, rien réglé
 */
export type RentStatus = 'paid' | 'due' | 'partial' | 'late'

/** Échéance mensuelle d'un contrat (loyer + charges), calculée à partir des contrats. */
export interface RentDue {
  /** `${leaseId}:${period}` */
  id: string
  leaseId: string
  /** Mois concerné (AAAA-MM) */
  period: string
  /** Date d'échéance (ISO) */
  dueDate: string
  /** Montant dû : loyer + charges (XOF) */
  amount: number
  paid: number
  remaining: number
  status: RentStatus
  /** Jours de retard (0 si à jour ou à échoir) */
  daysLate: number
  payments: Payment[]
}

/** Échéance enrichie du contrat, du locataire et du logement. */
export interface RentDueRow {
  due: RentDue
  lease: Lease
  tenant?: Tenant
  property?: Property
  unit?: Unit
  /** Dernière relance envoyée pour cette échéance */
  lastReminder?: Reminder
}
