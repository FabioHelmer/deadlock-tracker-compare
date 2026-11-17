import { parseHeroes, parseMatchHistory, parseProfiles, parseSearchResults } from './validation.ts'
import { readCache, writeCache, PROFILE_TTL, ASSETS_TTL } from '../cache.ts'
import { API_BASE, ApiError, getJson } from './http.ts'
import type { PlayerData, SteamSearchResult } from '../../domain/models.ts'
import { normalizeAccountId } from '../../domain/accountId.ts'
async function query<T>(
  path: string,
  parse: (value: unknown) => T,
  ttl: number,
  signal: AbortSignal,
  force = false,
) {
  signal.throwIfAborted()
  const cached = !force && readCache<T>(API_BASE + path, ttl)
  if (cached) return { data: cached.value, queriedAt: cached.time }
  const data = parse(await getJson(path, signal))
  const queriedAt = Date.now()
  signal.throwIfAborted()
  writeCache(API_BASE + path, data, queriedAt)
  return { data, queriedAt }
}
export async function loadPlayer(
  id: string,
  signal: AbortSignal,
  force = false,
): Promise<PlayerData> {
  const account = normalizeAccountId(id)
  if (!account) throw new Error('Informe um Account ID válido.')
  const [history, heroes, profiles] = await Promise.allSettled([
    query(`/v1/players/${account}/match-history`, parseMatchHistory, PROFILE_TTL, signal, force),
    query('/v1/assets/heroes', parseHeroes, ASSETS_TTL, signal),
    query(`/v1/players/steam?account_ids=${account}`, parseProfiles, PROFILE_TTL, signal, force),
  ])
  signal.throwIfAborted()
  if (history.status === 'rejected') {
    if (history.reason?.name === 'TimeoutError')
      throw new Error('A consulta demorou demais. Tente novamente.')
    throw history.reason
  }
  return {
    matches: history.value.data,
    queriedAt: history.value.queriedAt,
    heroes: heroes.status === 'fulfilled' ? heroes.value.data : [],
    profile: profiles.status === 'fulfilled' ? profiles.value.data[0] : undefined,
    partial: heroes.status === 'rejected' || profiles.status === 'rejected',
  }
}
export async function searchPlayers(
  search: string,
  signal: AbortSignal,
): Promise<SteamSearchResult[]> {
  const params = new URLSearchParams({
    search_query: search,
    limit: '10',
    min_matches_played_last_30d: '0',
  })
  try {
    return parseSearchResults(await getJson(`/v1/players/steam-search?${params}`, signal))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return []
    throw error
  }
}
