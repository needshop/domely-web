const DAY = 24 * 60 * 60 * 1000

/** Nombre de jours entiers de `from` à `to` (positif si `to` est après `from`). */
export function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / DAY)
}
