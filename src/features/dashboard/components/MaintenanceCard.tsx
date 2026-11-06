import { Chip } from '@heroui/react'
import { AlertTriangle, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import type { MaintenanceRequest, MaintenanceStatus } from '../types'
import { SectionCard } from './SectionCard'

// « Nouvelle » demande à être traitée (attention) ; « Planifiée » est neutre ; « En cours » avance bien
const statusColor: Record<MaintenanceStatus, 'default' | 'warning' | 'success'> = {
  new: 'warning',
  scheduled: 'default',
  inProgress: 'success',
}

export function MaintenanceCard({ items }: { items: MaintenanceRequest[] }) {
  const { t } = useTranslation()

  return (
    <SectionCard title={t('dashboard.maintenance.title')} href="/maintenance">
      <ul className="flex flex-col">
        {items.map((m, i) => (
          <li
            key={m.id}
            className={cn('flex items-center gap-3 py-3', i > 0 && 'border-t border-separator')}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-default text-default-foreground">
              <Wrench className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                {m.priority === 'urgent' && (
                  <AlertTriangle
                    className="size-3.5 shrink-0 text-danger"
                    aria-label={t('dashboard.maintenance.priority.urgent')}
                  />
                )}
                {m.title}
              </p>
              <p className="truncate text-xs text-muted">{m.property}</p>
            </div>
            <Chip size="sm" variant="soft" color={statusColor[m.status]} className="shrink-0">
              {t(`dashboard.maintenance.status.${m.status}`)}
            </Chip>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
