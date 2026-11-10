import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { MaintenanceStatusChip } from '@/features/maintenance/components/Badges'
import { useLocationLabel } from '@/features/maintenance/hooks/useLocationLabel'
import type { InterventionRow } from '@/features/maintenance/types'
import { categoryIcon } from '@/features/maintenance/visual'
import { cn } from '@/lib/cn'
import { SectionCard } from './SectionCard'

/** Interventions à traiter, les plus urgentes d'abord. */
export function MaintenanceCard({ items }: { items: InterventionRow[] }) {
  const { t } = useTranslation()
  const location = useLocationLabel()

  return (
    <SectionCard title={t('dashboard.maintenance.title')} href="/maintenance">
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{t('dashboard.maintenance.empty')}</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((row, i) => {
            const m = row.intervention
            const Icon = categoryIcon[m.category]
            return (
              <li key={m.id} className={cn(i > 0 && 'border-t border-separator')}>
                <Link
                  to={`/maintenance/${m.id}`}
                  className="flex items-center gap-3 rounded-lg py-3 outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-default text-default-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {m.priority === 'urgent' && (
                        <AlertTriangle
                          className="size-3.5 shrink-0 text-danger"
                          aria-label={t('maintenance.priority.urgent')}
                        />
                      )}
                      <span className="truncate">{m.title}</span>
                    </p>
                    <p className="truncate text-xs text-muted">{location(row)}</p>
                  </div>
                  <span className="shrink-0">
                    <MaintenanceStatusChip status={m.status} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
