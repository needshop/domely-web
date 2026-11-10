import {
  AlertCircle,
  BrickWall,
  CalendarClock,
  CheckCircle2,
  CircleSlash,
  Droplets,
  KeyRound,
  type LucideIcon,
  PaintRoller,
  Refrigerator,
  Snowflake,
  SprayCan,
  Wrench,
  Zap,
} from 'lucide-react'
import type { MaintenanceCategory, MaintenanceStatus } from './types'

export const categoryIcon: Record<MaintenanceCategory, LucideIcon> = {
  plumbing: Droplets,
  electricity: Zap,
  airConditioning: Snowflake,
  locksmith: KeyRound,
  painting: PaintRoller,
  masonry: BrickWall,
  appliances: Refrigerator,
  cleaning: SprayCan,
  other: Wrench,
}

/** Statuts : la nouvelle demande attire l'attention ; les autres restent sobres (icône + libellé). */
export const statusVisual: Record<
  MaintenanceStatus,
  { color: 'warning' | 'default' | 'success'; icon: LucideIcon }
> = {
  new: { color: 'warning', icon: AlertCircle },
  scheduled: { color: 'default', icon: CalendarClock },
  inProgress: { color: 'default', icon: Wrench },
  done: { color: 'success', icon: CheckCircle2 },
  cancelled: { color: 'default', icon: CircleSlash },
}
