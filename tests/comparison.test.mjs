import test from 'node:test'
import assert from 'node:assert/strict'
import { relativeScore, summarize, sample } from '../src/comparison.ts'
const match = (overrides = {}) => ({ match_id: 1, hero_id: 1, start_time: 100, player_team: 0, match_result: 0, player_kills: 10, player_deaths: 2, player_assists: 20, match_duration_s: 1200, net_worth: 12000, last_hits: 100, game_mode: 1, ...overrides })
test('relative scores handle ties, zero and inverted survival', () => {
  assert.equal(relativeScore(0, 0), 50)
  assert.equal(relativeScore(2, 2), 50)
  assert.equal(relativeScore(3, 1), 75)
  assert.equal(relativeScore(1, 3, true), 75)
  assert.equal(relativeScore(0, 3, true), 100)
  assert.equal(relativeScore(3, 1) + relativeScore(1, 3), 100)
})
test('rates use total duration rather than mean of match rates', () => {
  const result = summarize([match(), match({ match_duration_s: 600, player_kills: 20 })])
  assert.equal(result[0], 1)
  assert.equal(result[3], 800)
  assert.equal(summarize([]), null)
  assert.equal(summarize([match({ last_hits: undefined })])[4], null)
})
test('sample filters before selecting recent matches and excludes invalid duration', () => {
  const matches = [match({ start_time: 1 }), match({ start_time: 3, hero_id: 2 }), match({ start_time: 4, match_duration_s: 0 }), match({ start_time: 2 })]
  assert.deepEqual(sample(matches, '1', '1', 1).map(m => m.start_time), [2])
  assert.equal(matches[0].start_time, 1)
})
