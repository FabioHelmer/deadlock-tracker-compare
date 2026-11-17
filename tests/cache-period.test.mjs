import test from 'node:test'
import assert from 'node:assert/strict'
import { readCache, writeCache } from '../src/services/cache.ts'
import { sample, validDate } from '../src/domain/comparison.ts'
import { readComparison, comparisonUrl } from '../src/features/comparison/share.ts'
test('cache expires at TTL and isolates consumer mutations', () => {
  writeCache('test', [1, 2], 100)
  const first = readCache('test', 50, 149)
  first.value.push(3)
  assert.deepEqual(readCache('test', 50, 149).value, [1, 2])
  assert.equal(readCache('test', 50, 150), null)
})
test('period includes entire final UTC day and filters before window size', () => {
  const match = (date) => ({
    start_time: Date.parse(date) / 1000,
    match_duration_s: 60,
    hero_id: 1,
    game_mode: 1,
  })
  const matches = [
    match('2026-11-18T00:00:00Z'),
    match('2026-11-17T23:59:59Z'),
    match('2026-11-17T00:00:00Z'),
    match('2026-11-16T23:59:59Z'),
  ]
  assert.equal(
    sample(matches, 'all', 'all', 20, { from: '2026-11-17', to: '2026-11-17' }).length,
    2,
  )
  assert.equal(
    sample(matches, 'all', 'all', 20, { from: '2026-11-18', to: '2026-11-17' }).length,
    0,
  )
  assert.equal(validDate('2026-02-30'), undefined)
})
test('period survives shared URL and invalid dates are discarded', () => {
  const state = {
    player: '123',
    opponent: '456',
    mode: 'all',
    hero: 'all',
    count: 20,
    from: '2026-11-01',
    to: '2026-11-17',
  }
  assert.deepEqual(
    readComparison(new URL(comparisonUrl('https://example.com/', state)).search),
    state,
  )
  assert.equal(readComparison('?from=invalid').from, undefined)
})
