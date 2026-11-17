import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { groupHeroes } from '../src/domain/heroes.ts'
import { buildComparison } from '../src/domain/buildComparison.ts'
import { defaultFilters, comparisonLocation } from '../src/features/comparison/share.ts'
import { parseFavorites } from '../src/features/favorites/favoritesStorage.ts'
const match = (id, hero = 1) => ({
  match_id: id,
  hero_id: hero,
  start_time: id * 100,
  player_team: 0,
  match_result: 0,
  player_kills: 1,
  player_deaths: 1,
  player_assists: 1,
  match_duration_s: 60,
  net_worth: 100,
  last_hits: null,
  game_mode: 1,
  match_mode: 4,
})
const player = (matches) => ({
  matches,
  heroes: [{ id: 1, name: 'Haze', images: {} }],
  partial: false,
  queriedAt: 100,
})
test('domain depends only on domain modules and has no browser or network access', () => {
  for (const file of readdirSync(new URL('../src/domain/', import.meta.url))) {
    const source = readFileSync(new URL(`../src/domain/${file}`, import.meta.url), 'utf8')
    for (const [, dependency] of source.matchAll(/from\s+['"]([^'"]+)['"]/g))
      assert.ok(dependency.startsWith('./'), `${file} imports ${dependency}`)
    assert.doesNotMatch(source, /\b(window|document|localStorage|fetch)\s*[.(]/)
  }
})
test('hero ranking is shared and tie-breaking is independent of input order', () => {
  const input = [match(1, 1), match(3, 2), match(2, 1), match(4, 2)]
  assert.deepEqual(
    groupHeroes(input).map((h) => h.id),
    [2, 1],
  )
  assert.deepEqual(
    groupHeroes(input.reverse()).map((h) => h.id),
    [2, 1],
  )
})
test('comparison equalizes samples without silently substituting an unavailable hero', () => {
  const left = player([match(1), match(2), match(3)])
  const right = player([match(4)])
  const result = buildComparison(left, right, defaultFilters)
  assert.equal(result.size, 1)
  assert.equal(result.a.killsPerMinute, 1)
  const empty = buildComparison(left, right, { ...defaultFilters, commonOnly: true, hero: '99' })
  assert.equal(empty.activeHero, null)
  assert.equal(empty.a, null)
  const reversed = buildComparison(left, right, {
    ...defaultFilters,
    from: '2026-11-17',
    to: '2026-11-01',
  })
  assert.equal(reversed.size, 0)
})
test('location defaults have no personal identity and favorites are validated and deduplicated', () => {
  assert.equal(comparisonLocation('').opponent, '')
  assert.deepEqual(comparisonLocation('').filters, defaultFilters)
  assert.deepEqual(
    parseFavorites(
      JSON.stringify([
        { id: '123', name: 'Old' },
        { id: '123', name: 'New' },
        { id: 'oops', name: 'Bad' },
      ]),
    ),
    [{ id: '123', name: 'New' }],
  )
})
