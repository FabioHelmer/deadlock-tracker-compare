import { useEffect, useRef, useState } from 'react'
import { Search, UserRound } from 'lucide-react'
import { searchPlayers, type SteamSearchResult } from './api'

export default function PlayerSearch({ onSelect, initialValue = '', disabled = false, label = 'Buscar jogador', action = 'Buscar', inlineResults = false }: { onSelect: (id: string, name?: string) => void; inlineResults?: boolean; initialValue?: string; disabled?: boolean; label?: string; action?: string }) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<SteamSearchResult[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const active = useRef<AbortController | null>(null)
  useEffect(() => () => active.current?.abort(), [])
  function cancel() { active.current?.abort(); active.current = null; setBusy(false); setResults([]); setSearched(false); setError('') }
  async function search() {
    cancel()
    const value = query.trim()
    if (!value) { setError('Digite um nome da Steam ou Account ID.'); return }
    if (/^\d{1,10}$/.test(value) && Number(value) <= 2147483647) { onSelect(value); return }
    const controller = new AbortController()
    active.current = controller; setBusy(true)
    try { const found = await searchPlayers(value, controller.signal); if (!controller.signal.aborted) { setResults(found); setSearched(true) } }
    catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Não foi possível buscar jogadores.') }
    finally { if (!controller.signal.aborted) setBusy(false) }
  }
  return <div className="relative w-full sm:w-auto sm:min-w-80"><form onSubmit={e => { e.preventDefault(); void search() }} className="flex gap-2"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3"><Search size={16} className="shrink-0 text-stone-500"/><input aria-label={label} placeholder="Nome da Steam ou ID" value={query} onChange={e => { cancel(); setQuery(e.target.value) }} className="min-w-0 w-full bg-transparent py-3 text-sm"/></label><button disabled={disabled || busy} className="rounded-lg bg-lime-300 px-4 py-3 text-sm font-bold text-stone-950 disabled:opacity-50">{busy ? 'Buscando…' : action}</button></form>
    {busy && <p role="status" className="mt-2 text-xs text-stone-400">Procurando perfis na Deadlock API…</p>}
    {error && <p role="alert" className="mt-2 text-xs text-red-200">{error}</p>}
    {searched && <div className={`${inlineResults ? 'relative' : 'absolute'} z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-white/15 bg-[#20251f] p-2 shadow-2xl`}><div className="mb-2 flex items-center justify-between gap-3 px-2 py-1 text-xs text-stone-400"><span>{results.length ? 'Escolha o perfil correto' : 'Nenhum perfil encontrado'}</span><button type="button" aria-label="Fechar resultados" onClick={cancel} className="p-1">✕</button></div>{results.map(profile => <button key={profile.accountId} type="button" disabled={disabled} onClick={() => { cancel(); setQuery(profile.personaname); onSelect(profile.accountId, profile.personaname) }} className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-white/5 disabled:opacity-50">{profile.avatarfull ? <img src={profile.avatarfull} alt="" className="h-10 w-10 rounded-lg"/> : <UserRound className="h-10 w-10 rounded-lg bg-white/5 p-2 text-stone-500"/>}<span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{profile.personaname}</span><span className="block text-xs text-stone-400">ID: {profile.accountId}</span></span><span className="text-xs text-lime-300">Selecionar</span></button>)}<p className="px-2 py-2 text-[11px] leading-5 text-stone-500">Busca limitada aos perfis conhecidos pela API. Nomes podem se repetir; confira o avatar e o ID.</p></div>}
  </div>
}

