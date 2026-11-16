import { useState } from 'react'
import { Crosshair } from 'lucide-react'
import type { PlayerData } from './api'

function favorite(data: PlayerData) {
  const counts = new Map<number, number>()
  for (const match of data.matches) counts.set(match.hero_id, (counts.get(match.hero_id) ?? 0) + 1)
  // Em empate, prioriza o herói da partida mais recente (ordem do histórico).
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (!top) return null
  return { hero: data.heroes.find(h => h.id === top[0]), id: top[0], count: top[1] }
}
function Portrait({ data, player, side }: { data: PlayerData; player: string; side: 'left' | 'right' }) {
  const top = favorite(data)
  const images = top?.hero?.images
  const candidates = [...new Set([images?.icon_hero_card, images?.icon_image_large, images?.icon_image, images?.icon_image_small].filter((url): url is string => !!url))]
  const [failed, setFailed] = useState<string[]>([])
  const src = candidates.find(url => !failed.includes(url))
  const color = side === 'left' ? 'text-lime-300' : 'text-cyan-200'
  return <article className={`relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#101310] ${side === 'right' ? 'text-right' : ''}`}>
    <div className={`absolute inset-0 ${side === 'left' ? 'bg-gradient-to-br from-lime-300/15' : 'bg-gradient-to-bl from-cyan-200/15'} to-transparent`}/>
    <div className="relative flex h-44 items-center justify-center overflow-hidden sm:h-64">
      {src ? <img src={src} alt={top?.hero?.name ?? `Herói ${top?.id}`} className="h-full w-full object-contain object-bottom" onError={() => setFailed(urls => [...urls, src])}/> : <div className="flex flex-col items-center gap-3 p-3 text-center text-xs text-stone-500"><Crosshair size={48} className={color}/>{top ? 'Retrato indisponível' : 'Sem partidas registradas'}</div>}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#101310] to-transparent"/>
    </div>
    <div className="relative px-4 pb-5 sm:px-6"><p className={`truncate text-xs font-semibold ${color}`} title={player}>{player}</p><h3 className="mt-1 text-xl font-bold sm:text-2xl">{top ? top.hero?.name ?? `Herói ${top.id}` : 'Sem herói'}</h3><p className="mt-2 text-xs text-stone-400">{top ? `${top.count} partidas · mais jogado` : 'Histórico indisponível'}</p></div>
  </article>
}
function ClashLightning() {
  return <div className="clash-lightning" aria-hidden="true"><div className="clash-aura"/><svg className="clash-bolts" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none"><g className="clash-bolt clash-bolt-lime"><path d="M92 0 70 64 104 91 64 155 100 194 76 249 98 272 66 340 88 400"/><path className="clash-branch" d="M104 91 145 62 132 29 M64 155 25 183 38 218 M76 249 30 277 43 310"/></g><g className="clash-bolt clash-bolt-cyan"><path d="M116 0 139 53 106 104 143 149 101 197 132 232 103 290 141 339 113 400"/><path className="clash-branch" d="M139 53 177 87 163 119 M143 149 182 171 168 207 M103 290 67 316 79 352"/></g><path className="clash-core" d="m100 130-12 38 19 20-20 40 14 43"/></svg></div>
}
export default function HeroVersus({ left, right, names }: { left: PlayerData; right: PlayerData; names: string[] }) {
  return <div className="mt-7"><div className="clash-arena relative isolate grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-5"><Portrait data={left} player={names[0]} side="left"/><ClashLightning/><div className="clash-badge relative z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#101310]/95 text-sm font-black italic text-white sm:h-14 sm:w-14 sm:text-xl">VS</div><Portrait data={right} player={names[1]} side="right"/></div><p className="mt-3 text-center text-xs text-stone-500">Herói mais jogado no histórico completo disponível de cada perfil, independente dos filtros do radar.</p></div>
}
