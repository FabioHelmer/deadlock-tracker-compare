import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parsePlayer,
  sharedPlayer,
  readPlayer,
  PLAYER_KEY,
} from '../src/features/player/rememberedPlayer.ts'

test('first visit and invalid saved values do not select a default player', () => {
  for (const raw of [
    null,
    '',
    'broken',
    '{}',
    '[]',
    '{"id":"bad","name":"User"}',
    '{"id":"9999999999","name":"User"}',
    '{"id":"123","name":""}',
  ])
    assert.equal(parsePlayer(raw), null)
})
test('saved identity retains the selected name and stable account ID', () => {
  const player = { id: '1013623044', name: 'Meu nick Steam' }
  assert.deepEqual(parsePlayer(JSON.stringify(player)), player)
})
test('shared comparison overrides saved player only for this visit', () => {
  const saved = { id: '123', name: 'Salvo' }
  assert.equal(sharedPlayer('?player=456') ?? saved.id, '456')
  assert.equal(sharedPlayer('?player=invalid') ?? saved.id, '123')
  assert.equal(sharedPlayer(''), null)
  assert.equal(saved.id, '123')
})
test('storage failures gracefully produce the home screen', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem() {
        throw new Error('blocked')
      },
    },
  })
  assert.equal(readPlayer(), null)
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem(key) {
        assert.equal(key, PLAYER_KEY)
        return JSON.stringify({ id: '123', name: 'Salvo' })
      },
    },
  })
  assert.deepEqual(readPlayer(), { id: '123', name: 'Salvo' })
  delete globalThis.localStorage
})
