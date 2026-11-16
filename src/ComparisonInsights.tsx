import { useState } from 'react'
import type { PlayerData } from './api'
import { attributes } from './comparison'
import { advantages, commonMatches, evolution } from './insights'

const num = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
export function RecentEvolution({ data, name, mode, hero }: { data: PlayerData; name: string; mode: string; hero: string }) {
  const result = evolution(data.matches, mode, hero)
  return <article className="rounded-xl border border-white/10 bg-[#191d18] p-5 shadow-lg sm:p-6"><h4 className="mb-3 text-lg font-semibold text-stone-100">{name}</h4>{!result ? <p className="text-sm text-stone-500">São necessárias 20 partidas com estes filtros para comparar as últimas 10 com as 10 anteriores.</p> : <><p className="mb-4 text-xs text-stone-500">Últimas 10 partidas × 10 anteriores</p><div className="space-y-2">{attributes.map((attr, i) => {
    const current = result.current[i], previous = result.previous[i]
    const delta = current !== null && previous !== null ? current - previous : null
    const better = delta !== null && (attr.lower ? delta < 0 : delta > 0)
    return <div key={attr.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-white/5 bg-[#101310] px-3 py-4 text-xs sm:gap-6 sm:px-4"><span>{attr.label}<span className="block text-[10px] text-stone-500">{attr.unit}</span></span><span className="font-mono text-stone-300">{previous === null ? 'N/D' : num(previous)} → {current === null ? 'N/D' : num(current)}</span><span className={'min-w-16 rounded-md px-2 py-1.5 text-center font-mono font-semibold ' + (delta === null || delta === 0 ? 'bg-[#252b24] text-stone-400' : better ? 'bg-[#26351c] text-lime-300' : 'bg-[#38221f] text-red-300')}>{delta === null ? 'N/D' : `${delta > 0 ? '+' : ''}${num(delta)}`}</span></div>
  })}</div><p className="mt-4 text-[11px] text-stone-500">Variação descritiva; amostra pequena e sem ajuste de dificuldade.</p></>}</article>
}
export default function ComparisonInsights({ left, right, names, a, b, mode, hero }: { left: PlayerData; right: PlayerData; names: string[]; a: (number | null)[] | null; b: (number | null)[] | null; mode: string; hero: string }) {
  const [limit, setLimit] = useState(5)
  const shared = commonMatches(left.matches, right.matches)
  const together = shared.filter(m => m.together)
  const opposing = shared.filter(m => !m.together)
  const togetherWins = together.filter(m => m.a.player_team === m.a.match_result).length
  const opposingWins = opposing.filter(m => m.a.player_team === m.a.match_result).length
  return <div className="mt-8 space-y-8">
    <section><h3 className="mb-4 text-lg font-semibold">Resumo do confronto</h3>{a && b ? <div className="grid gap-2 sm:grid-cols-2">{advantages(a, b).map(item => <div key={item.label} className="rounded-lg bg-black/20 p-4 text-sm"><span className="text-stone-400">{item.label}: </span><span className={item.winner === 'left' ? 'text-lime-300' : item.winner === 'right' ? 'text-cyan-200' : 'text-stone-400'}>{item.winner === null ? 'dados insuficientes' : item.winner === 'tie' ? 'empate' : `${names[item.winner === 'left' ? 0 : 1]} tem ${item.lower ? 'menos mortes/min' : `mais ${item.unit}`}`}</span></div>)}</div> : <p className="text-sm text-stone-500">Sem amostra comparável para os filtros atuais.</p>}<p className="mt-3 text-xs text-stone-500">Usa a mesma amostra do radar. Assistências/min indicam apoio; participação percentual em abates exige dados da equipe e não é estimada aqui.</p></section>
    <section><h3 className="mb-4 text-lg font-semibold">Evolução recente</h3><div className="grid gap-4 md:grid-cols-2"><RecentEvolution data={left} name={names[0]} mode={mode} hero={hero}/><RecentEvolution data={right} name={names[1]} mode={mode} hero={hero}/></div></section>
    <section><h3 className="mb-2 text-lg font-semibold">Partidas em comum</h3><p className="mb-4 text-xs text-stone-500">Todo o histórico disponível, independente dos filtros. Apenas partidas presentes nos dois perfis.</p><div className="mb-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-black/20 p-4 text-sm"><p className="text-stone-400">Juntos: {together.length}</p><p className="mt-1">{togetherWins} vitórias · {together.length - togetherWins} derrotas</p></div><div className="rounded-lg bg-black/20 p-4 text-sm"><p className="text-stone-400">Adversários: {opposing.length}</p><p className="mt-1 text-lime-300">{names[0]}: {opposingWins} vitórias</p><p className="text-cyan-200">{names[1]}: {opposing.length - opposingWins} vitórias</p></div></div>{!shared.length ? <p className="text-sm text-stone-500">Nenhuma partida em comum encontrada no histórico disponível.</p> : <div className="space-y-2">{shared.slice(0, limit).map(({ a: match, together: same }) => <a key={match.match_id} href={`https://tracklock.gg/matches/${match.match_id}`} target="_blank" rel="noreferrer" className="flex flex-wrap justify-between gap-2 rounded-lg border border-white/10 p-3 text-xs hover:bg-white/5"><span>#{match.match_id} · {new Date(match.start_time * 1000).toLocaleDateString('pt-BR')}</span><span className={same ? 'text-lime-300' : 'text-cyan-200'}>{same ? 'Mesmo time' : 'Times opostos'}</span><span>{same ? (match.player_team === match.match_result ? 'Vitória juntos' : 'Derrota juntos') : `Vitória: ${names[match.player_team === match.match_result ? 0 : 1]}`} ↗</span></a>)}{shared.length > limit && <button onClick={() => setLimit(v => v + 10)} className="mt-2 text-xs text-lime-300">Mostrar mais partidas</button>}</div>}</section>
  </div>
}


