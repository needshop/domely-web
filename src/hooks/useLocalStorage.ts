import { useCallback, useState } from 'react'

/** État React persisté dans localStorage (tolère un stockage indisponible). */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored === null ? initialValue : (JSON.parse(stored) as T)
    } catch {
      return initialValue
    }
  })

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* stockage indisponible : on garde l'état en mémoire */
        }
        return resolved
      })
    },
    [key],
  )

  return [value, update] as const
}
