const DAY = 24 * 60 * 60 * 1000

/** Nombre de jours entiers de `from` à `to` (positif si `to` est après `from`). */
export function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / DAY)
}

/** Initiales d'un nom (« Awa Diallo » → « AD »). */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
