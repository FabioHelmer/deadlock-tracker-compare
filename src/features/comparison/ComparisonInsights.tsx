import RecentEvolution from '../player/RecentEvolution.tsx'
import { useState } from 'react'
import type { PlayerData, PlayerMetrics, SampleFilters } from '../../domain/models.ts'

import { advantages, commonMatches } from '../../domain/insights.ts'

export default function ComparisonInsights({
  left,
  right,
  names,
  a,
  b,
  mode,
  hero,
  period = {},
  sampleAvailable = true,
}: {
  left: PlayerData
  right: PlayerData
  names: string[]
  a: PlayerMetrics | null
  b: PlayerMetrics | null
  mode: string
  hero: string
  period?: SampleFilters
  sampleAvailable?: boolean
}) {
  const [limit, setLimit] = useState(5)
  const shared = commonMatches(left.matches, right.matches)
  const together = shared.filter((m) => m.together)
  const opposing = shared.filter((m) => !m.together)
  const togetherWins = together.filter((m) => m.a.player_team === m.a.match_result).length
  const opposingWins = opposing.filter((m) => m.a.player_team === m.a.match_result).length
  return (
    <div className="mt-8 space-y-8">
      <section>
        <h3 className="mb-4 text-lg font-semibold">Resumo do confronto</h3>
        {a && b ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {advantages(a, b).map((item) => (
              <div key={item.label} className="rounded-lg bg-black/20 p-4 text-sm">
                <span className="text-stone-400">{item.label}: </span>
                <span
                  className={
                    item.winner === 'left'
                      ? 'text-lime-300'
                      : item.winner === 'right'
                        ? 'text-cyan-200'
                        : 'text-stone-400'
                  }
                >
                  {item.winner === null
                    ? 'dados insuficientes'
                    : item.winner === 'tie'
                      ? 'empate'
                      : `${names[item.winner === 'left' ? 0 : 1]} tem ${item.lower ? 'menos mortes/min' : `mais ${item.unit}`}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">Sem amostra comparável para os filtros atuais.</p>
        )}
        <p className="mt-3 text-xs text-stone-500">
          Usa a mesma amostra do radar. Assistências/min indicam apoio; participação percentual em
          abates exige dados da equipe e não é estimada aqui.
        </p>
      </section>
      <section>
        <h3 className="mb-4 text-lg font-semibold">Evolução recente</h3>
        {!sampleAvailable ? (
          <p className="text-sm text-stone-500">
            Selecione um herói em comum e um período válido para exibir a evolução.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <RecentEvolution data={left} name={names[0]} mode={mode} hero={hero} period={period} />
            <RecentEvolution data={right} name={names[1]} mode={mode} hero={hero} period={period} />
          </div>
        )}
      </section>
      <section>
        <h3 className="mb-2 text-lg font-semibold">Partidas em comum</h3>
        <p className="mb-4 text-xs text-stone-500">
          Todo o histórico disponível, independente dos filtros. Apenas partidas presentes nos dois
          perfis.
        </p>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-black/20 p-4 text-sm">
            <p className="text-stone-400">Juntos: {together.length}</p>
            <p className="mt-1">
              {togetherWins} vitórias · {together.length - togetherWins} derrotas
            </p>
          </div>
          <div className="rounded-lg bg-black/20 p-4 text-sm">
            <p className="text-stone-400">Adversários: {opposing.length}</p>
            <p className="mt-1 text-lime-300">
              {names[0]}: {opposingWins} vitórias
            </p>
            <p className="text-cyan-200">
              {names[1]}: {opposing.length - opposingWins} vitórias
            </p>
          </div>
        </div>
        {!shared.length ? (
          <p className="text-sm text-stone-500">
            Nenhuma partida em comum encontrada no histórico disponível.
          </p>
        ) : (
          <div className="space-y-2">
            {shared.slice(0, limit).map(({ a: match, together: same }) => (
              <a
                key={match.match_id}
                href={`https://tracklock.gg/matches/${match.match_id}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-wrap justify-between gap-2 rounded-lg border border-white/10 p-3 text-xs hover:bg-white/5"
              >
                <span>
                  #{match.match_id} ·{' '}
                  {new Date(match.start_time * 1000).toLocaleDateString('pt-BR')}
                </span>
                <span className={same ? 'text-lime-300' : 'text-cyan-200'}>
                  {same ? 'Mesmo time' : 'Times opostos'}
                </span>
                <span>
                  {same
                    ? match.player_team === match.match_result
                      ? 'Vitória juntos'
                      : 'Derrota juntos'
                    : `Vitória: ${names[match.player_team === match.match_result ? 0 : 1]}`}{' '}
                  ↗
                </span>
              </a>
            ))}
            {shared.length > limit && (
              <button
                onClick={() => setLimit((v) => v + 10)}
                className="mt-2 text-xs text-lime-300"
              >
                Mostrar mais partidas
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
