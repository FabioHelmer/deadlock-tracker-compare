import { useFavorites } from './useFavorites.ts'
import type { Favorite } from './favoritesStorage.ts'
export default function Favorites({
  current,
  onSelect,
}: {
  current?: Favorite
  onSelect: (id: string) => void
}) {
  const { items, error, remove, toggle } = useFavorites()
  const exists = current && items.some((v) => v.id === current.id)
  return (
    <div className="my-4 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-stone-500">Favoritos:</span>
        {current && (
          <button
            className="rounded border border-lime-300/20 px-3 py-2 text-lime-200"
            onClick={() => toggle(current)}
          >
            {exists ? '★ Remover perfil atual' : '☆ Salvar perfil atual'}
          </button>
        )}
        {items.map((item) => (
          <span key={item.id} className="inline-flex items-center rounded border border-white/10">
            <button
              className="max-w-40 truncate px-3 py-2 hover:text-lime-300"
              onClick={() => onSelect(item.id)}
              title={`${item.name} · ${item.id}`}
            >
              {item.name}
            </button>
            <button
              aria-label={`Remover ${item.name} dos favoritos`}
              onClick={() => remove(item.id)}
              className="px-2 py-2 text-stone-500"
            >
              ×
            </button>
          </span>
        ))}
        {!items.length && <span className="text-stone-600">Salve perfis para acessar depois.</span>}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-red-200">
          {error}
        </p>
      )}
    </div>
  )
}
