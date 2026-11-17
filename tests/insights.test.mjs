import test from 'node:test'
import assert from 'node:assert/strict'
import { commonMatches, evolution, advantages } from '../src/domain/insights.ts'
import { readComparison, comparisonUrl } from '../src/features/comparison/share.ts'
const match = (i, overrides = {}) => ({
  match_id: i,
  hero_id: 1,
  start_time: i,
  player_team: 0,
  match_result: 0,
  player_kills: i,
  player_deaths: 2,
  player_assists: 3,
  match_duration_s: 600,
  net_worth: 10000,
  last_hits: 100,
  game_mode: 1,
  ...overrides,
})
test('common matches distinguish teammates and opponents by ID, ordered by date', () => {
  const result = commonMatches(
    [match(1), match(2), match(3)],
    [match(1), match(3, { player_team: 1 }), match(4)],
  )
  assert.deepEqual(
    result.map((m) => [m.a.match_id, m.together]),
    [
      [3, false],
      [1, true],
    ],
  )
})
test('evolution requires twenty matching matches and uses disjoint ordered windows', () => {
  assert.equal(
    evolution(
      Array.from({ length: 19 }, (_, i) => match(i)),
      'all',
      'all',
    ),
    null,
  )
  const result = evolution(
    Array.from({ length: 20 }, (_, i) => match(i + 1)),
    '1',
    '1',
  )
  assert.equal(result.current.killsPerMinute, 1.55)
  assert.equal(result.previous.killsPerMinute, 0.55)
  assert.equal(evolution([match(1)], '2', 'all'), null)
})
test('summary preserves absent metrics and rewards fewer deaths', () => {
  const result = advantages(
    {
      killsPerMinute: 1,
      assistsPerMinute: 2,
      deathsPerMinute: 1,
      netWorthPerMinute: 3,
      lastHitsPerMinute: null,
    },
    {
      killsPerMinute: 1,
      assistsPerMinute: 3,
      deathsPerMinute: 2,
      netWorthPerMinute: 2,
      lastHitsPerMinute: 5,
    },
  )
  assert.deepEqual(
    result.map((r) => r.winner),
    ['tie', 'right', 'left', 'left', null],
  )
})
test('shared URLs round trip players and all comparison filters', () => {
  const state = { player: '1013623044', opponent: '123', mode: '1', hero: '5', count: 50 }
  assert.deepEqual(
    readComparison(new URL(comparisonUrl('https://example.com/', state)).search),
    state,
  )
  assert.equal(readComparison('?player=bad&count=3&hero=oops').count, 20)
  assert.equal(readComparison('?player=bad').player, null)
  assert.equal(
    new URL(
      comparisonUrl('https://example.com/?opponent=2', { ...state, opponent: undefined }),
    ).searchParams.has('opponent'),
    false,
  )
})
