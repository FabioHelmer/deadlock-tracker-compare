import type { Match, PlayerMetrics, SampleFilters } from './models.ts'
import { sample, summarize, attributes } from './comparison.ts'
export function commonMatches(left: Match[], right: Match[]) {
  const indexed = new Map(right.map((match) => [match.match_id, match]))
  return left
    .flatMap((a) => {
      const b = indexed.get(a.match_id)
      return b ? [{ a, b, together: a.player_team === b.player_team }] : []
    })
    .sort((x, y) => y.a.start_time - x.a.start_time)
}
export function evolution(
  matches: Match[],
  mode: string,
  hero: string,
  period: SampleFilters = {},
) {
  const recent = sample(matches, mode, hero, 20, period)
  const current = summarize(recent.slice(0, 10)),
    previous = summarize(recent.slice(10, 20))
  return recent.length < 20 || !current || !previous ? null : { current, previous, recent }
}
export function advantages(a: PlayerMetrics, b: PlayerMetrics) {
  return attributes.map((attribute) => {
    const left = a[attribute.key],
      right = b[attribute.key]
    const winner =
      left === null || right === null
        ? null
        : left === right
          ? 'tie'
          : (attribute.lower ? left < right : left > right)
            ? 'left'
            : 'right'
    return { ...attribute, winner }
  })
}
