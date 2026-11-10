import { cn } from '@/lib/cn'

export interface BarItem {
  id: string
  label: string
  /** Valeur numérique (longueur de la barre) */
  value: number
  /** Valeur affichée (montant formaté…) */
  display: string
  /** Précision sous le libellé (ex. « 3 interventions ») */
  hint?: string
}

/**
 * Barres horizontales d'une seule série, libellées directement (pas de légende) :
 * une seule teinte, la valeur en texte ; la barre est décorative pour les lecteurs d'écran.
 */
export function HorizontalBars({ items, className }: { items: BarItem[]; className?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => (
        <li key={item.id}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              {item.label}
              {item.hint && <span className="ml-1.5 text-xs text-muted">{item.hint}</span>}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{item.display}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-default" aria-hidden>
            <div
              className="h-full rounded-full bg-night-700 dark:bg-night-200"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
