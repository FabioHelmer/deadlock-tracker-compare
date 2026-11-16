import { useEffect, useState } from 'react'
export type Favorite = { id: string; name: string }
function read(): Favorite[] {
  try { const items: unknown = JSON.parse(localStorage.getItem('tracker-favorites') || '[]'); return Array.isArray(items) ? items.filter((v): v is Favorite => !!v && typeof v.id === 'string' && /^\d{1,10}$/.test(v.id) && Number(v.id) <= 2147483647 && typeof v.name === 'string') : [] } catch { return [] }
}
export default function Favorites({ current, onSelect }: { current?: Favorite; onSelect: (id: string) => void }) {
  const [items, setItems] = useState(read)
  const [error, setError] = useState('')
  useEffect(() => {
    const sync = () => setItems(read())
    window.addEventListener('tracker-favorites-change', sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('tracker-favorites-change', sync); window.removeEventListener('storage', sync) }
  }, [])
  function save(next: Favorite[]) {
    try { localStorage.setItem('tracker-favorites', JSON.stringify(next)); setItems(next); setError(''); window.dispatchEvent(new Event('tracker-favorites-change')) } catch { setError('Não foi possível salvar favoritos neste navegador.') }
  }
  const exists = current && items.some(v => v.id === current.id)
  return <div className="my-4 text-xs"><div className="flex flex-wrap items-center gap-2"><span className="text-stone-500">Favoritos:</span>{current && <button className="rounded border border-lime-300/20 px-3 py-2 text-lime-200" onClick={() => save(exists ? items.filter(v => v.id !== current.id) : [...items.filter(v => v.id !== current.id), current])}>{exists ? '★ Remover perfil atual' : '☆ Salvar perfil atual'}</button>}{items.map(item => <span key={item.id} className="inline-flex items-center rounded border border-white/10"><button className="max-w-40 truncate px-3 py-2 hover:text-lime-300" onClick={() => onSelect(item.id)} title={`${item.name} · ${item.id}`}>{item.name}</button><button aria-label={`Remover ${item.name} dos favoritos`} onClick={() => save(items.filter(v => v.id !== item.id))} className="px-2 py-2 text-stone-500">×</button></span>)}{!items.length && <span className="text-stone-600">Salve perfis para acessar depois.</span>}</div>{error && <p role="alert" className="mt-2 text-red-200">{error}</p>}</div>
}

