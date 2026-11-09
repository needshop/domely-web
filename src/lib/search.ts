/** Normalise un texte pour une recherche insensible à la casse et aux accents. */
export const normalizeSearch = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
