export type RememberedPlayer = { id: string; name: string }
export const PLAYER_KEY = 'tracker-player'
export function parsePlayer(raw: string | null): RememberedPlayer | null {
  try {
    const value = JSON.parse(raw || 'null')
    return value && typeof value.id === 'string' && /^\d{1,10}$/.test(value.id) && Number(value.id) <= 2147483647 && typeof value.name === 'string' && value.name.trim() ? { id: value.id, name: value.name } : null
  } catch { return null }
}
export function readPlayer(): RememberedPlayer | null {
  try { return parsePlayer(localStorage.getItem(PLAYER_KEY)) } catch { return null }
}
export function sharedPlayer(search: string): string | null {
  const id = new URLSearchParams(search).get('player')
  return id && /^\d{1,10}$/.test(id) && Number(id) <= 2147483647 ? id : null
}
