import { groupHeroes } from '../../domain/heroes.ts'
import type { Match } from '../../domain/models.ts'
export default function PlayerStats({ matches, loading }: { matches: Match[]; loading: boolean }) {
  const wins = matches.filter((m) => m.player_team === m.match_result).length
  const totals = matches.reduce(
    (a, m) => ({ k: a.k + m.player_kills, d: a.d + m.player_deaths, a: a.a + m.player_assists }),
    { k: 0, d: 0, a: 0 },
  )
  const groups = groupHeroes(matches)
  return (
    <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        [
          'PARTIDAS REGISTRADAS',
          matches.length.toLocaleString('pt-BR'),
          'Histórico disponível na API',
        ],
        [
          'TAXA DE VITÓRIA',
          matches.length ? `${((wins / matches.length) * 100).toFixed(1)}%` : '—',
          `${wins} vitórias · ${matches.length - wins} derrotas`,
        ],
        [
          'KDA GERAL',
          matches.length
            ? totals.d
              ? ((totals.k + totals.a) / totals.d).toFixed(2)
              : 'Perfeito'
            : '—',
          'Abates + assistências / mortes',
        ],
        ['HERÓIS JOGADOS', groups.length, 'No histórico registrado'],
      ].map(([label, value, detail]) => (
        <div key={label} className="rounded-xl border border-white/10 bg-[#191d18] p-5">
          <p className="mb-6 text-[10px] tracking-widest text-stone-400">{label}</p>
          <p className="text-3xl font-semibold">{loading ? '···' : value}</p>
          <p className="mt-2 text-xs text-stone-500">{detail}</p>
        </div>
      ))}
    </div>
  )
}
