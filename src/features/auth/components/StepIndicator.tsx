import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

/** Progression d'un parcours en plusieurs étapes. */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('auth.signup.progress')} className="mb-6">
      <p className="mb-2 text-xs font-medium text-muted">
        {t('auth.signup.stepOf', { current: current + 1, total: steps.length })}
        <span aria-hidden> · </span>
        <span className="text-foreground">{steps[current]}</span>
      </p>
      <ol className="flex gap-1.5">
        {steps.map((label, index) => (
          <li key={label} aria-current={index === current ? 'step' : undefined} className="flex-1">
            <span className="sr-only">
              {label}
              {index < current && ` (${t('auth.signup.stepDone')})`}
            </span>
            <span
              aria-hidden
              className={cn(
                'flex h-1.5 rounded-full transition-colors',
                index < current && 'bg-night-900 dark:bg-night-200',
                index === current && 'bg-accent',
                index > current && 'bg-default',
              )}
            />
          </li>
        ))}
      </ol>
    </nav>
  )
}
