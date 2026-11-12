import { Chip } from '@heroui/react'
import { CircleCheck, CircleOff, Clock, MailWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type MemberStatus = 'active' | 'disabled' | 'invited' | 'expired'

const visual = {
  active: { color: 'success', icon: CircleCheck },
  disabled: { color: 'default', icon: CircleOff },
  invited: { color: 'warning', icon: Clock },
  expired: { color: 'danger', icon: MailWarning },
} as const

/** Statut d'un membre du workspace, toujours avec une icône et un libellé. */
export function MemberStatusChip({ status }: { status: MemberStatus }) {
  const { t } = useTranslation()
  const { color, icon: Icon } = visual[status]
  return (
    <Chip size="sm" variant="soft" color={color}>
      <Icon className="size-3.5" aria-hidden />
      {t(`workspace.status.${status}`)}
    </Chip>
  )
}
