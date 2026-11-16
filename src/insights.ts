import type { Match } from './api'
import { sample, summarize, attributes } from './comparison.ts'

export function commonMatches(left: Match[], right: Match[]) {
  const indexed = new Map(right.map(m => [m.match_id, m]))
  return left.flatMap(a => { const b = indexed.get(a.match_id); return b ? [{ a, b, together: a.player_team === b.player_team }] : [] }).sort((x, y) => y.a.start_time - x.a.start_time)
}
export function evolution(matches: Match[], mode: string, hero: string) {
  const recent = sample(matches, mode, hero, 20)
  return recent.length < 20 ? null : { current: summarize(recent.slice(0, 10))!, previous: summarize(recent.slice(10, 20))!, recent }
}
export function advantages(a: (number | null)[], b: (number | null)[]) {
  return attributes.map((attribute, i) => {
    const left = a[i], right = b[i]
    return { ...attribute, winner: left === null || right === null ? null : left === right ? 'tie' : (attribute.lower ? left < right : left > right) ? 'left' : 'right' }
  })
}

