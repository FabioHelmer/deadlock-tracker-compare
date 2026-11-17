import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  parseFavorites,
  readFavoritesRaw,
  subscribeFavorites,
  writeFavorites,
  type Favorite,
} from './favoritesStorage.ts'
export function useFavorites() {
  const raw = useSyncExternalStore(subscribeFavorites, readFavoritesRaw, () => null)
  const items = useMemo(() => parseFavorites(raw), [raw])
  const [error, setError] = useState('')
  function save(next: Favorite[]) {
    try {
      writeFavorites(next)
      setError('')
    } catch {
      setError('Não foi possível salvar favoritos neste navegador.')
    }
  }
  return {
    items,
    error,
    remove: (id: string) => save(items.filter((item) => item.id !== id)),
    toggle: (item: Favorite) =>
      save(
        items.some((value) => value.id === item.id)
          ? items.filter((value) => value.id !== item.id)
          : [...items, item],
      ),
  }
}
