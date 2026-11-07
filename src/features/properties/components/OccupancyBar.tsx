import { cn } from '@/lib/cn'

/** Jauge d'occupation fine : une seule couleur (statut « bon »), piste dans la même teinte. */
export function OccupancyBar({
  rate,
  label,
  className,
}: {
  rate: number
  label: string
  className?: string
}) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(rate * 100)}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-brand-green-500/20', className)}
    >
      <div className="h-full rounded-full bg-brand-green-500" style={{ width: `${rate * 100}%` }} />
    </div>
  )
}
