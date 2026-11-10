import { Breadcrumbs, Button, buttonVariants, Card, toast } from '@heroui/react'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleSlash,
  Pencil,
  Phone,
  Play,
  RotateCcw,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { updateIntervention, useInterventionRow } from '@/features/maintenance/api'
import { MaintenanceStatusChip, PriorityBadge } from '@/features/maintenance/components/Badges'
import { MaintenanceHistory } from '@/features/maintenance/components/MaintenanceHistory'
import {
  type ModalAction,
  StatusActionModal,
} from '@/features/maintenance/components/StatusActionModal'
import {
  type MaintenanceAction,
  isOverdue,
  transitions,
  withStatus,
} from '@/features/maintenance/utils'
import { categoryIcon } from '@/features/maintenance/visual'
import { useFormatters } from '@/lib/format'

function Item({
  label,
  stacked,
  children,
}: {
  label: string
  /** Libellé au-dessus de la valeur (cartes étroites) */
  stacked?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={
        stacked ? 'flex flex-col gap-0.5 py-3' : 'flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-6'
      }
    >
      <dt className={stacked ? 'text-xs text-muted' : 'text-sm text-muted sm:w-44 sm:shrink-0'}>
        {label}
      </dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  )
}

const actionIcon: Record<MaintenanceAction, typeof Play> = {
  schedule: CalendarClock,
  start: Play,
  complete: CheckCircle2,
  cancel: CircleSlash,
  reopen: RotateCcw,
}

export function InterventionDetailPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { id } = useParams()
  const row = useInterventionRow(id)
  const [modal, setModal] = useState<ModalAction | null>(null)

  if (!row) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('maintenance.detail.notFound')}</p>
        <Link to="/maintenance" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('maintenance.detail.back')}
        </Link>
      </div>
    )
  }

  const { intervention: i, property, unit, tenant } = row
  const Icon = categoryIcon[i.category]
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))
  const none = <span className="text-muted">—</span>

  const runAction = async (action: MaintenanceAction) => {
    if (action === 'schedule' || action === 'complete' || action === 'cancel') {
      setModal(action)
      return
    }
    // Démarrer / rouvrir : changement immédiat
    const status =
      action === 'start' ? 'inProgress' : i.status === 'cancelled' ? 'new' : 'inProgress'
    await updateIntervention(
      withStatus(i, status, action === 'reopen' ? { completedAt: undefined } : {}),
    )
    toast.success(t(`maintenance.actions.toast.${action}`), { description: i.title })
  }

  const actionLabel = (a: MaintenanceAction) =>
    a === 'schedule' && i.status === 'scheduled'
      ? t('maintenance.actions.reschedule')
      : t(`maintenance.actions.${a}`)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/maintenance">{t('nav.maintenance')}</Breadcrumbs.Item>
        <Breadcrumbs.Item>{i.reference}</Breadcrumbs.Item>
      </Breadcrumbs>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-default text-default-foreground">
            <Icon className="size-7" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl">{i.title}</h1>
              <MaintenanceStatusChip status={i.status} />
              <PriorityBadge priority={i.priority} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {i.reference} · {t(`maintenance.category.${i.category}`)} · {property?.name ?? '—'} ·{' '}
              {unit?.label ?? t('maintenance.commonAreas')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {transitions[i.status].map((a) => {
            const ActionIcon = actionIcon[a]
            const primary = a === transitions[i.status][0]
            return (
              <Button
                key={a}
                variant={a === 'cancel' ? 'danger-soft' : primary ? 'primary' : 'secondary'}
                onPress={() => void runAction(a)}
              >
                <ActionIcon className="size-4" aria-hidden />
                {actionLabel(a)}
              </Button>
            )
          })}
          <Link
            to={`/maintenance/${i.id}/edit`}
            className={buttonVariants({ variant: 'tertiary' })}
          >
            <Pencil className="size-4" aria-hidden />
            {t('maintenance.detail.edit')}
          </Link>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        <Card className="gap-2 p-5 xl:col-span-2">
          <Card.Header>
            <Card.Title className="font-display text-base">
              {t('maintenance.detail.details')}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <dl className="divide-y divide-separator">
              <Item label={t('maintenance.fields.description')}>
                {i.description ?? (
                  <span className="text-muted">{t('maintenance.detail.noDescription')}</span>
                )}
              </Item>
              <Item label={t('maintenance.fields.location')}>
                {property ? (
                  <Link
                    to={`/properties/${property.id}`}
                    className="inline-flex items-center gap-1 font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {property.name}
                    <ChevronRight className="size-3.5 text-muted" aria-hidden />
                  </Link>
                ) : (
                  none
                )}
                <span className="block text-muted">
                  {unit?.label ?? t('maintenance.commonAreas')}
                </span>
              </Item>
              <Item label={t('maintenance.fields.reportedBy')}>
                {i.reportedBy === 'tenant' && tenant ? (
                  <Link
                    to={`/tenants/${tenant.id}`}
                    className="font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {tenant.name}
                  </Link>
                ) : (
                  t(`maintenance.reporter.${i.reportedBy}`)
                )}
                <span className="block text-muted">
                  {t('maintenance.detail.reportedOn', { date: date(i.reportedAt) })}
                </span>
              </Item>
              <Item label={t('maintenance.fields.chargedTo')}>
                {t(`maintenance.bearer.${i.chargedTo}`)}
              </Item>
            </dl>
          </Card.Content>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="gap-2 p-5">
            <Card.Header>
              <Card.Title className="font-display text-base">
                {t('maintenance.detail.planning')}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <dl className="divide-y divide-separator">
                <Item stacked label={t('maintenance.fields.scheduledAt')}>
                  {i.scheduledAt ? date(i.scheduledAt) : none}
                  {isOverdue(i) && (
                    <span className="block text-xs text-warning-soft-foreground">
                      {t('maintenance.overdue')}
                    </span>
                  )}
                </Item>
                {i.completedAt && (
                  <Item stacked label={t('maintenance.fields.completedAt')}>
                    {date(i.completedAt)}
                  </Item>
                )}
                <Item stacked label={t('maintenance.fields.provider')}>
                  {i.provider ? (
                    <>
                      {i.provider.name}
                      {i.provider.phone && (
                        <a
                          href={`tel:${i.provider.phone.replace(/\s+/g, '')}`}
                          className="mt-0.5 flex items-center gap-1 text-xs text-muted tabular-nums outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                        >
                          <Phone className="size-3" aria-hidden />
                          {i.provider.phone}
                        </a>
                      )}
                    </>
                  ) : (
                    none
                  )}
                </Item>
                <Item stacked label={t('maintenance.fields.estimatedCost')}>
                  {i.estimatedCost !== undefined ? (
                    <span className="tabular-nums">{f.money(i.estimatedCost)}</span>
                  ) : (
                    none
                  )}
                </Item>
                <Item stacked label={t('maintenance.fields.actualCost')}>
                  {i.actualCost !== undefined ? (
                    <span className="font-semibold tabular-nums">{f.money(i.actualCost)}</span>
                  ) : (
                    none
                  )}
                </Item>
              </dl>
            </Card.Content>
          </Card>

          <Card className="gap-3 p-5">
            <Card.Header>
              <Card.Title className="font-display text-base">
                {t('maintenance.detail.history')}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <MaintenanceHistory events={i.history} />
            </Card.Content>
          </Card>
        </div>
      </div>

      <StatusActionModal intervention={i} action={modal} onClose={() => setModal(null)} />
    </div>
  )
}
