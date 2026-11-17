import test from 'node:test'
import assert from 'node:assert/strict'
import { loadPlayer } from '../src/services/deadlock/api.ts'
import { parseMatchHistory, parseHeroes } from '../src/services/deadlock/validation.ts'
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
const response = (value) =>
  new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } })
test('parsers normalize absent fields and ignore unrelated image metadata', () => {
  const [parsed] = parseMatchHistory([match])
  assert.equal(parsed.last_hits, null)
  assert.equal(parsed.match_mode, null)
  assert.equal(parsed.game_mode, null)
  assert.deepEqual(
    parseHeroes([{ id: 1, name: 'Haze', images: { unrelated: { metadata: true } } }])[0].images,
    {
      icon_hero_card: undefined,
      icon_image_large: undefined,
      icon_image: undefined,
      icon_image_small: undefined,
    },
  )
})
test('manual refresh bypasses cache once and later loads reuse the refreshed result', async (t) => {
  const original = globalThis.fetch
  t.after(() => {
    globalThis.fetch = original
  })
  let histories = 0
  globalThis.fetch = async (input) => {
    const url = String(input)
    if (url.includes('match-history')) {
      histories++
      return response([{ ...match, player_kills: histories }])
    }
    return response(
      url.includes('/assets/') ? [{ id: 1, name: 'Haze' }] : [{ personaname: 'User' }],
    )
  }
  const signal = new AbortController().signal
  await loadPlayer('1001', signal)
  await loadPlayer('1001', signal, true)
  const cached = await loadPlayer('1001', signal)
  assert.equal(histories, 2)
  assert.equal(cached.matches[0].player_kills, 2)
})
test('partial failures preserve valid history, malformed history never enters cache', async (t) => {
  const original = globalThis.fetch
  t.after(() => {
    globalThis.fetch = original
  })
  let broken = true,
    count = 0
  globalThis.fetch = async (input) => {
    if (String(input).includes('match-history')) {
      count++
      return response(broken ? [{ ...match, player_kills: 'bad' }] : [match])
    }
    return new Response('', { status: 503 })
  }
  const signal = new AbortController().signal
  await assert.rejects(loadPlayer('1002', signal), /inválidos/)
  broken = false
  const value = await loadPlayer('1002', signal)
  assert.equal(count, 2)
  assert.equal(value.partial, true)
  assert.equal(value.matches.length, 1)
  assert.equal(value.profile, undefined)
})
test('cancelled responses are rejected even if the transport delivers them later', async (t) => {
  const original = globalThis.fetch
  t.after(() => {
    globalThis.fetch = original
  })
  let finish
  const gate = new Promise((resolve) => {
    finish = resolve
  })
  globalThis.fetch = async (input) => {
    if (String(input).includes('match-history')) {
      await gate
      return response([match])
    }
    return response([{ personaname: 'User' }])
  }
  const controller = new AbortController()
  const pending = loadPlayer('1003', controller.signal)
  controller.abort()
  finish()
  await assert.rejects(pending, { name: 'AbortError' })
})
