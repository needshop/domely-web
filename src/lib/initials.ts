/** Initiales d'un nom (« Awa Diallo » → « AD »). */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((part) => /\p{L}/u.test(part[0] ?? ''))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
