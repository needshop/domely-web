/**
 * Export CSV compatible Excel (version française) : séparateur « ; », BOM UTF-8
 * pour les accents, valeurs entre guillemets si nécessaire.
 */
type Cell = string | number | null | undefined

const escape = (value: Cell) => {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export const toCsv = (rows: Cell[][]) => rows.map((r) => r.map(escape).join(';')).join('\r\n')

/** Déclenche le téléchargement d'un fichier CSV. */
export function downloadCsv(filename: string, rows: Cell[][]) {
  const blob = new Blob([`﻿${toCsv(rows)}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
