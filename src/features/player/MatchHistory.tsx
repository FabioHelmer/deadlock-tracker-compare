import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { groupHeroes } from '../../domain/heroes.ts'
import type { Match, Hero } from '../../domain/models.ts'
export default function MatchHistory({
  matches,
  heroes,
  loading,
  error,
}: {
  matches: Match[]
  heroes: Hero[]
  loading: boolean
  error: string
}) {
  const [filter, setFilter] = useState('all'),
    [limit, setLimit] = useState(10)
  const groups = groupHeroes(matches)
  const name = (id: number) => heroes.find((h) => h.id === id)?.name ?? 'Herói ' + id
  const filtered = matches.filter(
    (m) =>
      filter === 'all' ||
      (filter === 'wins' ? m.player_team === m.match_result : m.player_team !== m.match_result),
  )
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Histórico de partidas</h2>
          <select
            aria-label="Filtrar resultados"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setLimit(10)
            }}
            className="rounded-lg border border-white/10 bg-[#191d18] px-3 py-2 text-xs"
          >
            <option value="all">Todos os resultados</option>
            <option value="wins">Vitórias</option>
            <option value="losses">Derrotas</option>
          </select>
        </div>
        {loading ? (
          <div role="status" className="empty">
            <RefreshCw className="mx-auto mb-4 animate-spin text-lime-300" />
            Buscando suas partidas…
          </div>
        ) : !filtered.length ? (
          <div className="empty">
            {error
              ? 'As partidas aparecerão aqui quando a conexão for restabelecida.'
              : 'Nenhuma partida encontrada.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, limit).map((m) => {
              const win = m.player_team === m.match_result
              return (
                <a
                  key={m.match_id}
                  href={`https://tracklock.gg/matches/${m.match_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-4 rounded-lg border border-white/5 border-l-2 bg-[#191d18] p-4 hover:bg-[#22271f] ${win ? 'border-l-lime-300' : 'border-l-red-300/60'}`}
                >
                  <div className="w-16">
                    <p className={`text-xs font-bold ${win ? 'text-lime-300' : 'text-red-300'}`}>
                      {win ? 'VITÓRIA' : 'DERROTA'}
                    </p>
                    <p className="mt-1 text-[11px] text-stone-500">
                      {new Date(m.start_time * 1000).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{name(m.hero_id)}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {Math.floor(m.match_duration_s / 60)}min · #{m.match_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">
                      {m.player_kills} / {m.player_deaths} / {m.player_assists}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {m.net_worth.toLocaleString('pt-BR')} almas
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        )}
        {limit < filtered.length && (
          <button
            onClick={() => setLimit((n) => n + 10)}
            className="mt-4 w-full rounded-lg border border-white/10 py-3 text-sm"
          >
            Carregar mais partidas
          </button>
        )}
      </section>
      <aside>
        <h2 className="mb-5 text-xl font-semibold">Heróis mais jogados</h2>
        <div className="rounded-xl border border-white/10 bg-[#191d18] p-5">
          {groups.slice(0, 6).map((h, index) => (
            <div
              key={h.id}
              className="border-b border-white/5 py-4 first:pt-0 last:border-0 last:pb-0"
            >
              <div className="mb-2 flex gap-3">
                <span className="text-xs text-stone-600">0{index + 1}</span>
                <span className="flex-1 text-sm font-semibold">{name(h.id)}</span>
                <span className="text-xs text-lime-200">
                  {Math.round((h.wins / h.count) * 100)}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-lime-300/70"
                  style={{ width: `${(h.count / groups[0].count) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-stone-500">
                {h.count} partidas · {h.wins} vitórias
              </p>
            </div>
          ))}
          {!groups.length && (
            <p className="py-6 text-sm text-stone-500">
              {loading ? 'Carregando heróis…' : 'Sem dados disponíveis.'}
            </p>
          )}
        </div>
        <div className="mt-5 rounded-xl border border-lime-200/10 bg-lime-200/5 p-5">
          <p className="mb-2 text-sm font-semibold text-lime-200">Cada partida conta.</p>
          <p className="text-xs leading-6 text-stone-400">
            Os números refletem apenas as partidas registradas pela Deadlock API. Seu histórico pode
            estar incompleto.
          </p>
        </div>
      </aside>
    </div>
  )
}
