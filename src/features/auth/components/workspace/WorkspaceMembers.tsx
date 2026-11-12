import { Avatar, Button, Dropdown, Label } from '@heroui/react'
import { CircleCheck, CircleOff, Ellipsis, MailX, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { initials } from '@/lib/initials'
import { useFormatters } from '@/lib/format'
import type { WorkspaceMember } from '../../api'
import { sortRoles } from '../../permissions'
import { roles } from '../../types'
import { type MemberStatus, MemberStatusChip } from './MemberStatusChip'

export type MemberAction = 'resend' | 'revoke' | 'disable' | 'enable'

/** Membres du workspace : comptes (actifs, désactivés) puis invitations en attente. */
export function WorkspaceMembers({
  members,
  currentAccountId,
  onAction,
}: {
  members: WorkspaceMember[]
  currentAccountId: string
  onAction: (member: WorkspaceMember, action: MemberAction) => void
}) {
  const { t } = useTranslation()
  const f = useFormatters()
  const date = (iso: string) =>
    f.dayMonthYear(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso))

  return (
    <ul className="divide-y divide-separator">
      {members.map((member) => {
        const person = member.type === 'account' ? member.account : member.invitation
        const name = `${person.firstName} ${person.lastName}`
        const status: MemberStatus =
          member.type === 'invitation'
            ? member.expired
              ? 'expired'
              : 'invited'
            : member.account.status
        const isSelf = member.type === 'account' && member.account.id === currentAccountId
        const actions: MemberAction[] =
          member.type === 'invitation'
            ? ['resend', 'revoke']
            : member.isOwner || isSelf
              ? []
              : [member.account.status === 'active' ? 'disable' : 'enable']
        const memberRoles =
          member.type === 'account' ? member.account.roles : ['property_manager' as const]

        return (
          <li
            key={member.type === 'account' ? member.account.id : member.invitation.id}
            className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 py-3.5"
          >
            <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
              <Avatar size="sm" className="shrink-0">
                <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {name}
                  {isSelf && <span className="text-muted"> {t('workspace.members.you')}</span>}
                </p>
                <p className="truncate text-xs text-muted">{person.email}</p>
              </div>
            </div>
            <p className="w-40 text-sm">
              {sortRoles(memberRoles, roles)
                .map((role) => t(`auth.roles.${role}`))
                .join(' · ')}
              {member.type === 'account' && member.isOwner && (
                <span className="block text-xs text-muted">{t('workspace.members.owner')}</span>
              )}
            </p>
            <div className="w-36">
              <MemberStatusChip status={status} />
              <p className="mt-1 text-xs text-muted">
                {member.type === 'invitation'
                  ? t(
                      member.expired
                        ? 'workspace.members.expiredOn'
                        : 'workspace.members.expiresOn',
                      {
                        date: date(member.invitation.expiresAt),
                      },
                    )
                  : t('workspace.members.since', { date: date(member.account.createdAt) })}
              </p>
            </div>
            <div className="ml-auto flex w-9 justify-end">
              {actions.length > 0 && (
                <Dropdown>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={t('workspace.members.actions', { name })}
                  >
                    <Ellipsis className="size-4" aria-hidden />
                  </Button>
                  <Dropdown.Popover placement="bottom end" className="min-w-56">
                    <Dropdown.Menu
                      aria-label={t('workspace.members.actions', { name })}
                      onAction={(key) => onAction(member, key as MemberAction)}
                    >
                      {actions.map((action) => (
                        <Dropdown.Item
                          key={action}
                          id={action}
                          textValue={t(`workspace.actions.${action}`)}
                          variant={
                            action === 'disable' || action === 'revoke' ? 'danger' : undefined
                          }
                        >
                          <ActionIcon action={action} />
                          <Label>{t(`workspace.actions.${action}`)}</Label>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function ActionIcon({ action }: { action: MemberAction }) {
  const Icon = { resend: Send, revoke: MailX, disable: CircleOff, enable: CircleCheck }[action]
  return <Icon className="size-4" aria-hidden />
}
