import { Chip } from '@heroui/react'
import { AlertTriangle, CalendarClock, CheckCircle2, CircleSlash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LeaseStatus } from '../types'

const config = {
  active: { color: 'success', icon: CheckCircle2 },
  upcoming: { color: 'default', icon: CalendarClock },
  expired: { color: 'warning', icon: AlertTriangle },
  terminated: { color: 'default', icon: CircleSlash },
} as const

/** Situation du contrat : toujours une icône et un libellé, jamais la couleur seule. */
export function LeaseStatusChip({ status }: { status: LeaseStatus }) {
  const { t } = useTranslation()
  const { color, icon: Icon } = config[status]
  return (
    <Chip size="sm" variant="soft" color={color}>
      <Icon className="size-3.5" aria-hidden />
      {t(`contracts.status.${status}`)}
    </Chip>
  )
}
