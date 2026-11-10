import { Button } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '@/lib/format'
import { shiftPeriod } from '../utils'

/** Navigation de mois en mois (sans dépasser le mois courant). */
export function PeriodNavigator({
  period,
  max,
  onChange,
}: {
  period: string
  max: string
  onChange: (period: string) => void
}) {
  const { t } = useTranslation()
  const f = useFormatters()
  const label = f.monthLong(new Date(`${period}-15T12:00:00`))

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('rents.period.label')}>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label={t('rents.period.previous')}
        onPress={() => onChange(shiftPeriod(period, -1))}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      <p className="min-w-36 text-center font-display capitalize" aria-live="polite">
        {label}
      </p>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label={t('rents.period.next')}
        isDisabled={period >= max}
        onPress={() => onChange(shiftPeriod(period, 1))}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>
      {period !== max && (
        <Button size="sm" variant="tertiary" onPress={() => onChange(max)}>
          {t('rents.period.current')}
        </Button>
      )}
    </div>
  )
}
