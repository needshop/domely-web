import { Chip } from '@heroui/react'
import { AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TenantStatus } from '../types'

const config = {
  active: { color: 'success', icon: CheckCircle2 },
  late: { color: 'danger', icon: AlertTriangle },
  inactive: { color: 'default', icon: MinusCircle },
} as const

/** Situation du locataire : toujours une icône et un libellé, jamais la couleur seule. */
export function TenantStatusChip({ status }: { status: TenantStatus }) {
  const { t } = useTranslation()
  const { color, icon: Icon } = config[status]
  return (
    <Chip size="sm" variant="soft" color={color}>
      <Icon className="size-3.5" aria-hidden />
      {t(`tenants.status.${status}`)}
    </Chip>
  )
}
