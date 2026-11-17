import { isAccountId, normalizeAccountId } from '../../domain/accountId.ts'
export type RememberedPlayer = { id: string; name: string }
export const PLAYER_KEY = 'tracker-player'
export function parsePlayer(raw: string | null): RememberedPlayer | null {
  try {
    const value = JSON.parse(raw || 'null')
    return value && isAccountId(value.id) && typeof value.name === 'string' && value.name.trim()
      ? { id: value.id, name: value.name }
      : null
  } catch {
    return null
  }
}
export function readPlayer(): RememberedPlayer | null {
  try {
    return parsePlayer(localStorage.getItem(PLAYER_KEY))
  } catch {
    return null
  }
}
export function sharedPlayer(search: string): string | null {
  const id = new URLSearchParams(search).get('player')
  return normalizeAccountId(id)
}

export function writePlayer(player: RememberedPlayer) {
  const parsed = parsePlayer(JSON.stringify(player))
  if (!parsed) throw new Error('Perfil inválido.')
  localStorage.setItem(PLAYER_KEY, JSON.stringify(parsed))
}
