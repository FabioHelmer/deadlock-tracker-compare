import type { PlayerData, ComparisonFilters } from './models.ts'
import { sample, summarize } from './comparison.ts'
export function buildComparison(
  player: PlayerData | undefined,
  opponent: PlayerData | undefined,
  filters: ComparisonFilters,
) {
  const heroes = player?.heroes.length ? player.heroes : (opponent?.heroes ?? [])
  const commonHeroes = heroes.filter(
    (hero) =>
      player?.matches.some((match) => match.hero_id === hero.id) &&
      opponent?.matches.some((match) => match.hero_id === hero.id),
  )
  const activeHero =
    filters.commonOnly && !commonHeroes.some((hero) => String(hero.id) === filters.hero)
      ? null
      : filters.hero
  const invalidPeriod = !!filters.from && !!filters.to && filters.from > filters.to
  const left =
    activeHero === null
      ? []
      : sample(player?.matches ?? [], filters.mode, activeHero, filters.count, filters)
  const right =
    activeHero === null
      ? []
      : sample(opponent?.matches ?? [], filters.mode, activeHero, filters.count, filters)
  const size = invalidPeriod ? 0 : Math.min(left.length, right.length)
  return {
    heroes,
    commonHeroes,
    activeHero,
    invalidPeriod,
    left,
    right,
    size,
    a: summarize(left.slice(0, size)),
    b: summarize(right.slice(0, size)),
    options: [
      ...new Set(
        [...(player?.matches ?? []), ...(opponent?.matches ?? [])].map((match) => match.game_mode),
      ),
    ].filter((mode): mode is number => mode !== null),
  }
}
