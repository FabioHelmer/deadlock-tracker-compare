import type { Match, Hero } from './models.ts'
export function groupHeroes(matches: Match[]) {
  const groups = new Map<number, { id: number; count: number; wins: number; latest: number }>()
  for (const match of matches) {
    const group = groups.get(match.hero_id) ?? { id: match.hero_id, count: 0, wins: 0, latest: 0 }
    group.count++
    group.wins += Number(match.player_team === match.match_result)
    group.latest = Math.max(group.latest, match.start_time)
    groups.set(match.hero_id, group)
  }
  return [...groups.values()].sort(
    (a, b) => b.count - a.count || b.latest - a.latest || a.id - b.id,
  )
}
export function mostPlayedHero(matches: Match[], heroes: Hero[]) {
  const top = groupHeroes(matches)[0]
  return top ? { ...top, hero: heroes.find((hero) => hero.id === top.id) } : null
}
