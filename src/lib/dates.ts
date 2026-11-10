const DAY = 24 * 60 * 60 * 1000

/** Date locale du jour au format ISO « AAAA-MM-JJ ». */
export const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Jours de `from` jusqu'à une date ISO (négatif si passée). */
export function daysUntil(iso: string, from = todayIso()) {
  return Math.round((Date.parse(iso) - Date.parse(from)) / DAY)
}

/** Date ISO décalée de n mois (fin de mois si le jour n'existe pas). */
export function addMonths(iso: string, months: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return target.toISOString().slice(0, 10)
}

/** Date ISO décalée de n jours. */
export function addDays(iso: string, days: number) {
  return new Date(Date.parse(iso) + days * DAY).toISOString().slice(0, 10)
}

/** Durée en mois entiers d'une période dont la date de fin est incluse (ex. 01/12 → 30/11 = 12). */
export function durationInMonths(start: string, endInclusive: string) {
  const [y1, m1, d1] = start.split('-').map(Number)
  const [y2, m2, d2] = addDays(endInclusive, 1).split('-').map(Number)
  return (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0)
}
