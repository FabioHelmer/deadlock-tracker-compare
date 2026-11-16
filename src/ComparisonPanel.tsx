import { useEffect, useState } from 'react'
import ComparisonInsights from './ComparisonInsights'
import Favorites from './Favorites'
import { readComparison, comparisonUrl } from './share'
import HeroVersus from './HeroVersus'
import PlayerSearch from './PlayerSearch'
import { loadPlayer, type PlayerData } from './api'
import { attributes, relativeScore, sample, summarize } from './comparison'

function Radar({ a, b, names }: { a: (number | null)[]; b: (number | null)[]; names: string[] }) {
  const point = (i: number, score: number, radius = 130) => {
    const angle = i * Math.PI * 2 / 5 - Math.PI / 2
    return [220 + Math.cos(angle) * radius * score / 100, 185 + Math.sin(angle) * radius * score / 100]
  }
  const polygon = (values: number[]) => values.map((v, i) => point(i, v).join(',')).join(' ')
  const scores = a.map((v, i) => v === null || b[i] === null ? 50 : relativeScore(v, b[i]!, attributes[i].lower))
  return <svg viewBox="0 0 440 370" className="mx-auto w-full max-w-lg" role="img" aria-label={`Gráfico radar de ${names[0]} e ${names[1]}. Valores detalhados na tabela abaixo.`}>
    <title>Comparação relativa de cinco atributos</title>
    {[25, 50, 75, 100].map(level => <polygon key={level} points={polygon(Array(5).fill(level))} fill="none" stroke="#ffffff18"/>)}
    {attributes.map((attribute, i) => { const [x, y] = point(i, 100, 165); const end = point(i, 100); return <g key={attribute.label}><line x1="220" y1="185" x2={end[0]} y2={end[1]} stroke="#ffffff18"/><text x={x} y={y} fill="#a8a29e" fontSize="12" textAnchor="middle" dominantBaseline="middle">{attribute.label}{a[i] === null || b[i] === null ? ' *' : ''}</text></g> })}
    <polygon points={polygon(scores)} fill="#bef26425" stroke="#bef264" strokeWidth="2.5"/>
    <polygon points={polygon(scores.map(s => 100 - s))} fill="#67e8f925" stroke="#67e8f9" strokeWidth="2.5"/>
  </svg>
}
export default function Comparison({ player, account }: { player?: PlayerData; account: string }) {
  const [other, setOther] = useState<{ id: string; data: PlayerData }>()
  const [loading, setLoading] = useState(() => !!readComparison(window.location.search).opponent)
  const [error, setError] = useState('')
  const [initial] = useState(() => readComparison(window.location.search))
  const [target, setTarget] = useState(initial.opponent ?? '')
  const [shareMessage, setShareMessage] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [commonOnly, setCommonOnly] = useState(initial.hero !== 'all')
  const [attempt, setAttempt] = useState(0)
  const [mode, setMode] = useState(initial.mode)
  const [hero, setHero] = useState(initial.hero)
  const [count, setCount] = useState(initial.count)
  const [selected, setSelected] = useState<number | null>(null)
  const options = [...new Set([...(player?.matches ?? []), ...(other?.data.matches ?? [])].map(m => m.game_mode))].filter(v => v !== undefined)
  const heroes = player?.heroes ?? other?.data.heroes ?? []
  const commonHeroes = heroes.filter(h => player?.matches.some(m => m.hero_id === h.id) && other?.data.matches.some(m => m.hero_id === h.id))
  const activeHero = commonOnly ? (commonHeroes.some(h => String(h.id) === hero) ? hero : String(commonHeroes[0]?.id ?? -1)) : hero
  const left = sample(player?.matches ?? [], mode, activeHero, count)
  const right = sample(other?.data.matches ?? [], mode, activeHero, count)
  const n = Math.min(left.length, right.length)
  const a = summarize(left.slice(0, n))
  const b = summarize(right.slice(0, n))
  const names = [player?.profile?.personaname ?? `#${account}`, other?.data.profile?.personaname ?? `#${other?.id}`]
  useEffect(() => {
    if (!target) return
    if (target === account) { Promise.resolve().then(() => { setError('Escolha um jogador diferente para comparar.'); setLoading(false) }); return }
    const controller = new AbortController()
    loadPlayer(target, controller.signal).then(data => { if (!controller.signal.aborted) setOther({ id: target, data }) }).catch(e => { if (!controller.signal.aborted) setError(e.message) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [target, account, attempt])
  useEffect(() => {
    const url = comparisonUrl(window.location.href, { player: account, opponent: target || undefined, mode, hero: Number(activeHero) >= 0 ? activeHero : hero, count })
    window.history.replaceState(null, '', url)
  }, [account, target, mode, hero, activeHero, count])
  function compare(input: string) {
    if (Number(input) === Number(account)) { setError('Escolha um jogador diferente para comparar.'); return }
    if (input === target) { setLoading(true); setError(''); setAttempt(v => v + 1); return }
    setLoading(true); setError(''); setOther(undefined); setTarget(input)
  }
  async function share() {
    const url = comparisonUrl(window.location.href, { player: account, opponent: target || undefined, mode, hero: Number(activeHero) >= 0 ? activeHero : hero, count })
    setShareLink(url)
    try { await navigator.clipboard.writeText(url); setShareMessage('Link copiado!') } catch { setShareMessage('Copie o link abaixo para compartilhar.') }
  }
  return <section className="mb-10 rounded-2xl border border-white/10 bg-[#191d18] p-5 md:p-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-2 text-xs tracking-[.2em] text-lime-300">FRENTE A FRENTE</p><h2 className="text-2xl font-semibold">Compare seu estilo de jogo</h2><p className="mt-2 text-sm text-stone-400">Cinco atributos. A mesma régua para os dois jogadores.</p></div><PlayerSearch label="Buscar segundo jogador por nome da Steam ou ID" action="Comparar" disabled={loading} onSelect={value => { void compare(value) }}/></div>
    <div className="flex flex-wrap gap-3 text-sm"><label>Janela <select className="ml-2 rounded border border-white/15 bg-[#101310] p-2" value={count} onChange={e => setCount(Number(e.target.value))}>{[10, 20, 50, 100].map(v => <option key={v} value={v}>Últimas {v}</option>)}</select></label><label>Modo <select className="ml-2 rounded border border-white/15 bg-[#101310] p-2" value={mode} onChange={e => setMode(e.target.value)}><option value="all">Todos</option>{options.map(v => <option key={v} value={v}>Modo {v}</option>)}</select></label><label>Herói <select className="ml-2 rounded border border-white/15 bg-[#101310] p-2" value={activeHero} onChange={e => setHero(e.target.value)}>{!commonOnly && <option value="all">Todos</option>}{commonOnly && !commonHeroes.length && <option value="-1">Sem heróis em comum</option>}{(commonOnly ? commonHeroes : heroes).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></label></div>
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs"><label className="flex items-center gap-2"><input type="checkbox" disabled={!player || !other} checked={commonOnly} onChange={e => { setCommonOnly(e.target.checked); if (e.target.checked && !commonHeroes.some(h => String(h.id) === hero)) setHero(String(commonHeroes[0]?.id ?? 'all')) }}/>Comparar com o mesmo herói (somente heróis em comum)</label><button onClick={() => void share()} className="rounded border border-white/15 px-3 py-2 text-lime-200">Compartilhar comparação ↗</button></div>
    {commonOnly && <p className="mt-2 text-xs text-stone-400">{commonHeroes.length ? 'Escolha um herói em comum no filtro acima. A seleção vale para os dois jogadores.' : 'Não há heróis em comum disponíveis nos dois históricos.'}</p>}
    {shareLink && <div className="mt-3"><p role="status" className="mb-2 text-xs text-lime-200">{shareMessage}</p><input aria-label="Link compartilhável" readOnly value={shareLink} onFocus={e => e.target.select()} className="w-full rounded border border-white/10 bg-black/20 p-2 text-xs"/></div>}
    <Favorites current={other ? { id: other.id, name: names[1] } : undefined} onSelect={compare}/>
    {!loading && player && other && <HeroVersus left={player} right={other.data} names={names}/>}
    {error && <p role="alert" className="mt-5 text-sm text-red-200">{error}</p>}
    {loading && <p role="status" className="empty mt-5">Carregando o segundo perfil…</p>}
    {!loading && (!player || !other) && <div className="empty mt-5">{!player ? 'Aguarde o carregamento do seu perfil para comparar.' : 'Busque o nome da Steam ou informe o ID de outro jogador para gerar o radar.'}</div>}
    {!loading && player && other && (!a || !b) && <div className="empty mt-5">Não há partidas suficientes para os filtros selecionados.</div>}
    {!loading && a && b && other && <><div className="mt-6 flex flex-wrap justify-center gap-6 text-sm"><span className="text-lime-300">● {names[0]}</span><span className="text-cyan-200">● {names[1]}</span></div><div className="grid items-center gap-6 lg:grid-cols-2"><div><Radar a={a} b={b} names={names}/><p className="text-center text-xs text-stone-500">Escala relativa 0–100 · 50 = empate · maior área = vantagem nos atributos</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="pb-4 text-left text-stone-400">Mesma amostra: {n} partidas recentes por jogador</caption><thead><tr className="border-b border-white/10 text-xs text-stone-400"><th className="py-3">Atributo</th><th className="px-2 text-lime-300">Jogador 1</th><th className="px-2 text-cyan-200">Jogador 2</th></tr></thead><tbody>{attributes.map((attr, i) => <tr key={attr.label} className="border-b border-white/5"><th className="py-4 font-normal"><button className="text-left hover:text-lime-200" onClick={() => setSelected(selected === i ? null : i)}>{attr.label} ⓘ<span className="block text-[10px] text-stone-500">{attr.unit}{attr.lower ? ' · menor é melhor' : ''}</span></button></th>{[a[i], b[i]].map((v, j) => <td key={j} className="px-2 font-mono">{v === null ? 'N/D' : v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</td>)}</tr>)}</tbody></table>{selected !== null && <p role="status" className="mt-3 text-xs leading-5 text-stone-400">{attributes[selected].label}: {selected === 3 ? 'patrimônio final dividido pelo tempo de partida; não representa todas as almas coletadas ou gastas.' : selected === 4 ? 'last hits divididos pelo tempo de partida. Ausência de dados aparece como N/D e posição neutra no radar.' : `total de ${attributes[selected].unit.split('/')[0]} dividido pelo total de minutos.`}</p>}</div></div><p className={`mt-5 text-sm ${n < 20 ? 'text-amber-200' : 'text-stone-400'}`}>{n < 20 ? 'Amostra pequena: resultado exploratório.' : 'Comparação descritiva do histórico disponível.'} Não ajusta por rank, adversários, função ou mudanças de patch.</p></>}
    {player && other && !loading && <ComparisonInsights left={player} right={other.data} names={names} a={a} b={b} mode={mode} hero={activeHero}/>} 
    <details className="mt-6 border-t border-white/10 pt-5 text-sm text-stone-400"><summary className="cursor-pointer text-stone-200">Como funciona a metodologia?</summary><div className="mt-4 space-y-3 leading-6"><p>1. Aplicamos os mesmos filtros de modo e herói. Usamos até a janela escolhida de partidas recentes e reduzimos ambos ao menor número disponível. Partidas sem duração válida são excluídas. As datas podem diferir entre os jogadores.</p><p>2. Somamos cada atributo e dividimos pela soma dos minutos. Isso reduz a influência de partidas mais longas e evita comparar apenas totais. Farm usa last hits; economia usa patrimônio final por minuto.</p><p>3. Radar relativo: 100 × A / (A + B). Para mortes por minuto, invertemos: 100 × B / (A + B). O segundo jogador recebe o complemento. Empate ou dois valores zero = 50. Dados ausentes ficam neutros no radar e N/D na tabela.</p><p>4. Os pontos não são percentis, rank ou uma nota absoluta de habilidade. Não usamos uma nota geral: apoio, combate e sobrevivência descrevem estilos diferentes. Vitória depende da equipe e não compõe o radar. O histórico da API pode estar incompleto.</p></div></details>
  </section>
}






