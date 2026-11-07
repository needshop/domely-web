import {
  Briefcase,
  Building,
  Building2,
  DoorOpen,
  House,
  type LucideIcon,
  Store,
} from 'lucide-react'
import type { PropertyType } from './types'

/** Icône et dégradé de marque par type de bien (visuel en attendant les photos). */
export const propertyVisual: Record<PropertyType, { icon: LucideIcon; gradient: string }> = {
  residence: { icon: Building2, gradient: 'from-brand-red-500/20 to-brand-red-500/5' },
  building: { icon: Building, gradient: 'from-brand-green-500/25 to-brand-green-500/5' },
  apartment: {
    icon: DoorOpen,
    gradient: 'from-brand-green-500/20 to-brand-yellow-500/10',
  },
  house: { icon: House, gradient: 'from-brand-yellow-500/30 to-brand-yellow-500/5' },
  commercial: { icon: Store, gradient: 'from-night-500/25 to-night-500/5' },
  office: {
    icon: Briefcase,
    gradient: 'from-brand-red-500/15 via-brand-yellow-500/10 to-brand-green-500/10',
  },
}
