import { useEffect, useState } from 'react'
import { Crosshair, RefreshCw, ArrowUpRight } from 'lucide-react'
import { loadPlayer, type PlayerData } from './api'
import Comparison from './ComparisonPanel'
import Favorites from './Favorites'
import Home from './Home'
import { PLAYER_KEY, readPlayer, sharedPlayer, type RememberedPlayer } from './rememberedPlayer'
import { RecentEvolution } from './ComparisonInsights'
import PlayerSearch from './PlayerSearch'

function Dashboard({ initialAccount, onChangePlayer }: { initialAccount: string; onChangePlayer: () => void }) {
  const [id, setId] = useState(initialAccount)
  const [version, setVersion] = useState(0)
  const [data, setData] = useState<PlayerData>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [limit, setLimit] = useState(10)
  useEffect(() => {
    const controller = new AbortController()
    loadPlayer(id, controller.signal).then(result => { if (!controller.signal.aborted) setData(result) }).catch(e => {
      if (!controller.signal.aborted) setError(e.message)
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, version])
  const matches = data?.matches ?? []
  const wins = matches.filter(m => m.player_team === m.match_result).length
  const totals = matches.reduce((a, m) => ({ k: a.k + m.player_kills, d: a.d + m.player_deaths, a: a.a + m.player_assists }), { k: 0, d: 0, a: 0 })
  const groups = [...new Set(matches.map(m => m.hero_id))].map(heroId => {
    const played = matches.filter(m => m.hero_id === heroId)
    return { id: heroId, count: played.length, wins: played.filter(m => m.player_team === m.match_result).length }
  }).sort((a, b) => b.count - a.count)
  const name = (heroId: number) => data?.heroes.find(h => h.id === heroId)?.name ?? `Herói ${heroId}`
  const filtered = matches.filter(m => filter === 'all' || (filter === 'wins' ? m.player_team === m.match_result : m.player_team !== m.match_result))
  const refresh = () => { setLoading(true); setError(''); setData(undefined); setLimit(10); setVersion(v => v + 1) }
  return <div className="site-shell min-h-screen text-[#e6e9df]">
    <header className="border-b border-white/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10"><a href={import.meta.env.BASE_URL} className="flex items-center gap-3 text-lg font-black"><Crosshair className="text-lime-300"/>TRACKER<span className="font-light text-stone-500">/ COMPARE</span></a><button onClick={onChangePlayer} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-lime-200 hover:bg-white/5">Trocar meu perfil</button></div></header>
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6"><div><p className="mb-3 text-xs tracking-[.25em] text-lime-300">SEU JOGO, EM PERSPECTIVA</p><h1 className="text-4xl font-bold tracking-tight">Visão do jogador<span className="text-lime-300">.</span></h1></div><PlayerSearch initialValue={id} label="Buscar seu perfil por nome da Steam ou ID" onSelect={value => { setId(value); refresh() }}/></div>
      <Favorites current={data ? { id, name: data.profile?.personaname ?? `#${id}` } : undefined} onSelect={value => { setId(value); refresh() }}/>
      <section className="profile-panel mb-6 flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 p-8"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-lime-200/10">{data?.profile?.avatarfull ? <img className="h-full w-full object-cover" src={data.profile.avatarfull} alt="Avatar do jogador"/> : <Crosshair size={40} className="text-lime-200"/>}</div><div className="flex-1"><p className="mb-1 text-xs uppercase tracking-widest text-stone-400">Perfil Deadlock</p><h2 className="text-2xl font-bold">{data?.profile?.personaname ?? `Jogador #${id}`}</h2><p className="mt-2 text-sm text-stone-500">Account ID <span className="font-mono text-stone-300">{id}</span></p></div><button disabled={loading} onClick={refresh} className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm disabled:opacity-40"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>Atualizar</button><a className="flex items-center gap-1 text-sm text-lime-200" href={`https://tracklock.gg/players/${id}`} target="_blank" rel="noreferrer">Tracklock<ArrowUpRight size={16}/></a></section>
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-300/20 bg-red-300/5 p-5 text-sm text-red-200">{error} <button onClick={refresh} className="ml-2 underline">Tentar novamente</button></div>}
      {data?.partial && <p role="status" className="mb-5 text-sm text-amber-200">Alguns detalhes do perfil ou dos heróis estão indisponíveis.</p>}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">{[
        ['PARTIDAS REGISTRADAS', matches.length.toLocaleString('pt-BR'), 'Histórico disponível na API'],
        ['TAXA DE VITÓRIA', matches.length ? `${(wins / matches.length * 100).toFixed(1)}%` : '—', `${wins} vitórias · ${matches.length - wins} derrotas`],
        ['KDA GERAL', matches.length ? (totals.d ? ((totals.k + totals.a) / totals.d).toFixed(2) : 'Perfeito') : '—', 'Abates + assistências / mortes'],
        ['HERÓIS JOGADOS', groups.length, 'No histórico registrado'],
      ].map(([label, value, detail]) => <div key={label} className="rounded-xl border border-white/10 bg-[#191d18] p-5"><p className="mb-6 text-[10px] tracking-widest text-stone-400">{label}</p><p className="text-3xl font-semibold">{loading ? '···' : value}</p><p className="mt-2 text-xs text-stone-500">{detail}</p></div>)}</div>
      {data && <div className="mb-8"><h2 className="mb-4 text-xl font-semibold">Seu progresso</h2><RecentEvolution data={data} name={data.profile?.personaname ?? `#${id}`} mode="all" hero="all"/></div>}
      <Comparison key={id} player={data} account={id}/>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]"><section><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Histórico de partidas</h2><select aria-label="Filtrar resultados" value={filter} onChange={e => { setFilter(e.target.value); setLimit(10) }} className="rounded-lg border border-white/10 bg-[#191d18] px-3 py-2 text-xs"><option value="all">Todos os resultados</option><option value="wins">Vitórias</option><option value="losses">Derrotas</option></select></div>
      {loading ? <div role="status" className="empty"><RefreshCw className="mx-auto mb-4 animate-spin text-lime-300"/>Buscando suas partidas…</div> : !filtered.length ? <div className="empty">{error ? 'As partidas aparecerão aqui quando a conexão for restabelecida.' : 'Nenhuma partida encontrada.'}</div> : <div className="space-y-2">{filtered.slice(0, limit).map(m => {
        const win = m.player_team === m.match_result
        return <a key={m.match_id} href={`https://tracklock.gg/matches/${m.match_id}`} target="_blank" rel="noreferrer" className={`flex items-center gap-4 rounded-lg border border-white/5 border-l-2 bg-[#191d18] p-4 hover:bg-[#22271f] ${win ? 'border-l-lime-300' : 'border-l-red-300/60'}`}><div className="w-16"><p className={`text-xs font-bold ${win ? 'text-lime-300' : 'text-red-300'}`}>{win ? 'VITÓRIA' : 'DERROTA'}</p><p className="mt-1 text-[11px] text-stone-500">{new Date(m.start_time * 1000).toLocaleDateString('pt-BR')}</p></div><div className="flex-1"><p className="text-sm font-semibold">{name(m.hero_id)}</p><p className="mt-1 text-xs text-stone-500">{Math.floor(m.match_duration_s / 60)}min · #{m.match_id}</p></div><div className="text-right"><p className="font-mono text-sm">{m.player_kills} / {m.player_deaths} / {m.player_assists}</p><p className="mt-1 text-xs text-stone-500">{m.net_worth.toLocaleString('pt-BR')} almas</p></div></a>
      })}</div>}{limit < filtered.length && <button onClick={() => setLimit(n => n + 10)} className="mt-4 w-full rounded-lg border border-white/10 py-3 text-sm">Carregar mais partidas</button>}</section>
      <aside><h2 className="mb-5 text-xl font-semibold">Heróis mais jogados</h2><div className="rounded-xl border border-white/10 bg-[#191d18] p-5">{groups.slice(0, 6).map((h, index) => <div key={h.id} className="border-b border-white/5 py-4 first:pt-0 last:border-0 last:pb-0"><div className="mb-2 flex gap-3"><span className="text-xs text-stone-600">0{index + 1}</span><span className="flex-1 text-sm font-semibold">{name(h.id)}</span><span className="text-xs text-lime-200">{Math.round(h.wins / h.count * 100)}%</span></div><div className="h-1 rounded-full bg-white/5"><div className="h-full rounded-full bg-lime-300/70" style={{ width: `${h.count / groups[0].count * 100}%` }}/></div><p className="mt-2 text-xs text-stone-500">{h.count} partidas · {h.wins} vitórias</p></div>)}{!groups.length && <p className="py-6 text-sm text-stone-500">{loading ? 'Carregando heróis…' : 'Sem dados disponíveis.'}</p>}</div><div className="mt-5 rounded-xl border border-lime-200/10 bg-lime-200/5 p-5"><p className="mb-2 text-sm font-semibold text-lime-200">Cada partida conta.</p><p className="text-xs leading-6 text-stone-400">Os números refletem apenas as partidas registradas pela Deadlock API. Seu histórico pode estar incompleto.</p></div></aside></div>
      <footer className="mt-14 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5 text-xs text-stone-500"><span>TRACKER / COMPARE · Projeto da comunidade</span><a href="https://api.deadlock-api.com/docs" target="_blank" rel="noreferrer">Dados da Deadlock API ↗</a></footer>
    </main></div>
}







export default function App() {
  const [saved, setSaved] = useState(readPlayer)
  const [active, setActive] = useState(() => sharedPlayer(window.location.search) ?? readPlayer()?.id ?? null)
  const [storageError, setStorageError] = useState('')
  function choose(player: RememberedPlayer) {
    try { localStorage.setItem(PLAYER_KEY, JSON.stringify(player)); setSaved(player); setStorageError('') }
    catch { setStorageError('Seu navegador não permitiu salvar o perfil. Você pode continuar, mas precisará selecioná-lo no próximo acesso.') }
    window.history.replaceState(null, '', window.location.pathname)
    setActive(player.id)
  }
  function changePlayer() {
    window.history.replaceState(null, '', window.location.pathname)
    setActive(null)
  }
  return <>{storageError && <div role="alert" className="border-b border-amber-200/20 bg-[#292518] px-5 py-3 text-sm text-amber-200">{storageError}</div>}{active ? <Dashboard key={active} initialAccount={active} onChangePlayer={changePlayer}/> : <Home saved={saved} onSelect={choose} onContinue={() => { if (saved) setActive(saved.id) }}/>}</>
}

