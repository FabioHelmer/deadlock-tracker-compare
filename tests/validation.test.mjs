import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMatchHistory, parseHeroes } from '../src/services/deadlock/validation.ts'
const validateResponse = (path, value) =>
  path.includes('assets') ? parseHeroes(value) : parseMatchHistory(value)
import { sample } from '../src/domain/comparison.ts'
import { readComparison, comparisonUrl } from '../src/features/comparison/share.ts'
const match = {
  match_id: 1,
  hero_id: 1,
  start_time: 100,
  player_team: 0,
  match_result: 0,
  player_kills: 1,
  player_deaths: 1,
  player_assists: 2,
  net_worth: 100,
  match_duration_s: 100,
}
test('API validation rejects malformed envelopes and impossible numeric values', () => {
  assert.throws(() => validateResponse('match-history', { error: 'oops' }))
  for (const value of [-1, NaN, Infinity, '2'])
    assert.throws(() => validateResponse('match-history', [{ ...match, player_kills: value }]))
  assert.throws(() => validateResponse('match-history', [{ ...match, player_team: 16 }]))
  assert.doesNotThrow(() => validateResponse('match-history', [{ ...match, last_hits: null }]))
  assert.doesNotThrow(() => validateResponse('/assets/heroes', [{ id: 1, name: 'Haze' }]))
  assert.throws(() =>
    validateResponse('/assets/heroes', [
      { id: 1, name: 'Haze', images: { icon_image: 'javascript:bad' } },
    ]),
  )
})
test('ranked and casual filters exclude unknown match types and survive sharing', () => {
  const matches = [match, { ...match, match_mode: 4 }, { ...match, match_mode: 1 }]
  assert.equal(sample(matches, 'all', 'all', 10, { matchMode: '4' }).length, 1)
  assert.equal(sample(matches, 'all', 'all', 10, { matchMode: '1' }).length, 1)
  const state = { player: '123', mode: 'all', hero: 'all', count: 20, matchMode: '4' }
  assert.equal(
    readComparison(new URL(comparisonUrl('https://example.com', state)).search).matchMode,
    '4',
  )
})
