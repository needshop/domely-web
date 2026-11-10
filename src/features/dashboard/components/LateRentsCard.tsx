import { Avatar, Button, Chip } from '@heroui/react'
import { Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '@/lib/format'
import { initials } from '@/lib/initials'
import { daysBetween } from '../utils'
import type { LateRent } from '../types'
import { SectionCard } from './SectionCard'

interface LateRentsCardProps {
  /** Impayés les plus anciens à afficher */
  items: LateRent[]
  /** Montant total des impayés (y compris ceux non affichés) */
  total: number
  today: Date
}

export function LateRentsCard({ items, total, today }: LateRentsCardProps) {
  const { t } = useTranslation()
  const f = useFormatters()

  return (
    <SectionCard
      title={t('dashboard.lateRents.title')}
      subtitle={t('dashboard.lateRents.subtitle', { amount: f.money(total) })}
      href="/rents"
    >
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{t('dashboard.lateRents.empty')}</p>
      ) : (
        <div className="relative -mx-2 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-2 pb-2 font-normal">{t('dashboard.lateRents.tenant')}</th>
                <th className="px-2 pb-2 text-right font-normal">
                  {t('dashboard.lateRents.amount')}
                </th>
                <th className="px-2 pb-2 font-normal">{t('dashboard.lateRents.delay')}</th>
                <th className="px-2 pb-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const days = daysBetween(new Date(`${r.dueDate}T12:00:00`), today)
                return (
                  <tr key={r.id} className="border-t border-separator">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <Avatar.Fallback>{initials(r.tenant)}</Avatar.Fallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{r.tenant}</p>
                          <p className="truncate text-xs text-muted">{r.property}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right font-semibold tabular-nums">
                      {f.money(r.amount)}
                    </td>
                    <td className="px-2 py-3">
                      <Chip size="sm" variant="soft" color={days > 15 ? 'danger' : 'warning'}>
                        {t('dashboard.lateRents.days', { count: days })}
                      </Chip>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Button
                        size="sm"
                        variant="tertiary"
                        aria-label={t('dashboard.lateRents.remindLabel', { tenant: r.tenant })}
                      >
                        <Send className="size-3.5" aria-hidden />
                        {t('dashboard.lateRents.remind')}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}
