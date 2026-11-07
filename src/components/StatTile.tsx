import { Card } from '@heroui/react'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'

type Tone = 'red' | 'yellow' | 'green' | 'night'

const toneClasses: Record<Tone, string> = {
  red: 'bg-brand-red-500/12 text-brand-red-600 dark:text-brand-red-500',
  yellow: 'bg-brand-yellow-500/20 text-night-900 dark:text-brand-yellow-500',
  green: 'bg-brand-green-500/18 text-night-900 dark:text-brand-green-500',
  night: 'bg-night-900/8 text-night-900 dark:bg-white/10 dark:text-white',
}

interface StatTileProps {
  label: string
  value: string
  icon: LucideIcon
  tone: Tone
  /** Texte de variation (ex. « +12 % vs mois dernier ») */
  delta?: string
  /** Sens de la variation ; « up » = favorable */
  trend?: 'up' | 'down'
}

export function StatTile({ label, value, icon: Icon, tone, delta, trend }: StatTileProps) {
  const TrendIcon = trend === 'down' ? TrendingDown : TrendingUp

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            toneClasses[tone],
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <p className="font-display text-sm text-muted">{label}</p>
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {delta && (
          <p
            className={cn(
              'mt-1 flex items-center gap-1 text-xs',
              trend === 'down' ? 'text-danger' : 'text-success-soft-foreground',
            )}
          >
            {trend && <TrendIcon className="size-3.5" aria-hidden />}
            <span className="text-muted">{delta}</span>
          </p>
        )}
      </div>
    </Card>
  )
}
