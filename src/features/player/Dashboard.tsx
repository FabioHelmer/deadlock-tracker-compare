import PlayerHeader from './PlayerHeader.tsx'
import PlayerStats from './PlayerStats.tsx'
import MatchHistory from './MatchHistory.tsx'
import { usePlayer } from './usePlayer.ts'

import { Crosshair } from 'lucide-react'

import Comparison from '../comparison/ComparisonPanel.tsx'
import Favorites from '../favorites/Favorites.tsx'

import RecentEvolution from './RecentEvolution.tsx'
import PlayerSearch from './PlayerSearch.tsx'

export default function Dashboard({
  initialAccount,
  onChangePlayer,
  onSelectPlayer,
}: {
  initialAccount: string
  onChangePlayer: () => void
  onSelectPlayer: (id: string) => void
}) {
  const id = initialAccount
  const { data, loading, error, refetch } = usePlayer(id)
  const matches = data?.matches ?? []
  const refresh = refetch
  function selectPlayer(value: string) {
    if (value === id) refetch()
    else onSelectPlayer(value)
  }
  return (
    <div className="site-shell min-h-screen text-[#e6e9df]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10">
          <a href={import.meta.env.BASE_URL} className="flex items-center gap-3 text-lg font-black">
            <Crosshair className="text-lime-300" />
            TRACKER<span className="font-light text-stone-500">/ COMPARE</span>
          </a>
          <button
            onClick={onChangePlayer}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-lime-200 hover:bg-white/5"
          >
            Trocar meu perfil
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs tracking-[.25em] text-lime-300">SEU JOGO, EM PERSPECTIVA</p>
            <h1 className="text-4xl font-bold tracking-tight">
              Visão do jogador<span className="text-lime-300">.</span>
            </h1>
          </div>
          <PlayerSearch
            initialValue={id}
            label="Buscar seu perfil por nome da Steam ou ID"
            onSelect={selectPlayer}
          />
        </div>
        <Favorites
          current={data ? { id, name: data.profile?.personaname ?? `#${id}` } : undefined}
          onSelect={selectPlayer}
        />
        <PlayerHeader data={data} id={id} loading={loading} refresh={refresh} />
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-300/20 bg-red-300/5 p-5 text-sm text-red-200"
          >
            {error}{' '}
            <button onClick={refresh} className="ml-2 underline">
              Tentar novamente
            </button>
          </div>
        )}
        {data?.partial && (
          <p role="status" className="mb-5 text-sm text-amber-200">
            Alguns detalhes do perfil ou dos heróis estão indisponíveis.
          </p>
        )}
        <PlayerStats matches={matches} loading={loading} />
        {data && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Seu progresso</h2>
            <RecentEvolution
              data={data}
              name={data.profile?.personaname ?? `#${id}`}
              mode="all"
              hero="all"
            />
          </div>
        )}
        <Comparison player={data} account={id} />
        <MatchHistory
          matches={matches}
          heroes={data?.heroes ?? []}
          loading={loading}
          error={error}
        />
        <footer className="mt-14 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5 text-xs text-stone-500">
          <span>TRACKER / COMPARE · Projeto da comunidade</span>
          <a href="https://api.deadlock-api.com/docs" target="_blank" rel="noreferrer">
            Dados da Deadlock API ↗
          </a>
        </footer>
      </main>
    </div>
  )
}
