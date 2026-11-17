import { isAccountId } from '../../domain/accountId.ts'
export type Favorite = { id: string; name: string }
export const FAVORITES_KEY = 'tracker-favorites'
export const FAVORITES_EVENT = 'tracker-favorites-change'
export function parseFavorites(raw: string | null): Favorite[] {
  try {
    const values: unknown = JSON.parse(raw || '[]')
    if (!Array.isArray(values)) return []
    const unique = new Map<string, Favorite>()
    for (const value of values) {
      if (value && isAccountId(value.id) && typeof value.name === 'string' && value.name.trim())
        unique.set(value.id, { id: value.id, name: value.name })
    }
    return [...unique.values()]
  } catch {
    return []
  }
}
export function readFavoritesRaw() {
  try {
    return localStorage.getItem(FAVORITES_KEY)
  } catch {
    return null
  }
}
export function writeFavorites(values: Favorite[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(values))
  window.dispatchEvent(new Event(FAVORITES_EVENT))
}
export function subscribeFavorites(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_KEY || event.key === null) listener()
  }
  window.addEventListener(FAVORITES_EVENT, listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(FAVORITES_EVENT, listener)
    window.removeEventListener('storage', onStorage)
  }
}
