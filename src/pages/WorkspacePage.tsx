import { Button, Card, toast } from '@heroui/react'
import { CircleOff, Clock, UserPlus, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatTile } from '@/components/StatTile'
import {
  resendInvitation,
  revokeInvitation,
  setMemberStatus,
  useSession,
  useWorkspace,
  type WorkspaceMember,
} from '@/features/auth/api'
import { ConfirmModal } from '@/features/auth/components/workspace/ConfirmModal'
import { InvitationLinkModal } from '@/features/auth/components/workspace/InvitationLinkModal'
import { InviteMemberModal } from '@/features/auth/components/workspace/InviteMemberModal'
import {
  type MemberAction,
  WorkspaceMembers,
} from '@/features/auth/components/workspace/WorkspaceMembers'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'
import { useFormatters } from '@/lib/format'

type Pending = { member: WorkspaceMember; action: 'revoke' | 'disable' }

/** Workspace de l'agence (admins) : informations et gestionnaires (invitations, accès). */
export function WorkspacePage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const errorMessage = useAuthErrorMessage()
  const session = useSession()
  const data = useWorkspace()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [sent, setSent] = useState<{ link: string; name: string; email: string } | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  if (!data || !session) return null
  const { workspace, members } = data
  const accounts = members.filter((m) => m.type === 'account')
  const active = accounts.filter((m) => m.account.status === 'active').length
  const disabled = accounts.length - active
  const invitations = members.filter((m) => m.type === 'invitation').length
  const owner = accounts.find((m) => m.isOwner)
  const nameOf = (m: WorkspaceMember) => {
    const p = m.type === 'account' ? m.account : m.invitation
    return `${p.firstName} ${p.lastName}`
  }

  const run = async (member: WorkspaceMember, action: MemberAction) => {
    const name = nameOf(member)
    try {
      if (member.type === 'invitation') {
        if (action === 'resend') {
          const link = await resendInvitation(member.invitation.id)
          setSent({ link, name, email: member.invitation.email })
        } else {
          await revokeInvitation(member.invitation.id)
          toast.success(t('workspace.toast.revoked', { name }))
        }
      } else {
        const status = action === 'disable' ? 'disabled' : 'active'
        await setMemberStatus(member.account.id, status)
        toast.success(
          t(action === 'disable' ? 'workspace.toast.disabled' : 'workspace.toast.enabled', {
            name,
          }),
        )
      }
    } catch (e) {
      toast.danger(errorMessage(e))
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">{t('workspace.title')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('workspace.subtitle', { name: workspace.name })}
          </p>
        </div>
        <Button variant="primary" onPress={() => setInviteOpen(true)}>
          <UserPlus className="size-4" aria-hidden />
          {t('workspace.invite.open')}
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3 [&>*]:min-w-0">
        <StatTile
          label={t('workspace.stats.active')}
          value={f.number(active)}
          icon={UsersRound}
          tone="green"
          delta={t('workspace.stats.activeHint')}
        />
        <StatTile
          label={t('workspace.stats.invited')}
          value={f.number(invitations)}
          icon={Clock}
          tone="yellow"
          delta={t('workspace.stats.invitedHint')}
        />
        <StatTile
          label={t('workspace.stats.disabled')}
          value={f.number(disabled)}
          icon={CircleOff}
          tone="night"
          delta={t('workspace.stats.disabledHint')}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start [&>*]:min-w-0">
        <Card className="gap-2 p-5 xl:col-span-2">
          <Card.Header>
            <Card.Title className="font-display text-base">
              {t('workspace.members.title')}
              <span className="ml-1.5 text-xs text-muted tabular-nums">{members.length}</span>
            </Card.Title>
            <Card.Description>{t('workspace.members.description')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <WorkspaceMembers
              members={members}
              currentAccountId={session.accountId}
              onAction={(member, action) =>
                action === 'revoke' || action === 'disable'
                  ? setPending({ member, action })
                  : void run(member, action)
              }
            />
          </Card.Content>
        </Card>

        <Card className="gap-1 p-5">
          <Card.Header>
            <Card.Title className="font-display text-base">
              {t('workspace.agency.title')}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <dl className="divide-y divide-separator">
              <div className="flex flex-col gap-0.5 py-3">
                <dt className="text-xs text-muted">{t('workspace.agency.name')}</dt>
                <dd className="text-sm">{workspace.name}</dd>
              </div>
              <div className="flex flex-col gap-0.5 py-3">
                <dt className="text-xs text-muted">{t('auth.fields.registrationNumber')}</dt>
                <dd className="text-sm">{workspace.registrationNumber ?? '—'}</dd>
              </div>
              <div className="flex flex-col gap-0.5 py-3">
                <dt className="text-xs text-muted">{t('workspace.agency.owner')}</dt>
                <dd className="text-sm">{owner ? nameOf(owner) : '—'}</dd>
              </div>
              <div className="flex flex-col gap-0.5 py-3">
                <dt className="text-xs text-muted">{t('workspace.agency.createdAt')}</dt>
                <dd className="text-sm">
                  {f.dayMonthYear(new Date(`${workspace.createdAt}T12:00:00`))}
                </dd>
              </div>
            </dl>
          </Card.Content>
        </Card>
      </div>

      <InviteMemberModal
        isOpen={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={(link, values) => {
          setInviteOpen(false)
          setSent({ link, name: `${values.firstName} ${values.lastName}`, email: values.email })
        }}
      />
      <InvitationLinkModal invitation={sent} onClose={() => setSent(null)} />
      <ConfirmModal
        isOpen={pending !== null}
        title={
          pending
            ? t(`workspace.confirm.${pending.action}.title`, { name: nameOf(pending.member) })
            : ''
        }
        description={pending ? t(`workspace.confirm.${pending.action}.description`) : ''}
        confirmLabel={pending ? t(`workspace.actions.${pending.action}`) : ''}
        cancelLabel={t('form.actions.cancel')}
        isPending={isConfirming}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return
          setIsConfirming(true)
          await run(pending.member, pending.action)
          setIsConfirming(false)
          setPending(null)
        }}
      />
    </div>
  )
}
