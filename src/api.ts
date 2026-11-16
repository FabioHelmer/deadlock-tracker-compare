export type Match = { match_id: number; hero_id: number; start_time: number; player_team: number; match_result: number; player_kills: number; player_deaths: number; player_assists: number; match_duration_s: number; net_worth: number; last_hits?: number; game_mode?: number }
type Hero = { id: number; name: string; images?: { icon_hero_card?: string; icon_image_large?: string; icon_image?: string; icon_image_small?: string } }
type Profile = { personaname: string; avatarfull?: string }
export type PlayerData = { matches: Match[]; heroes: Hero[]; profile?: Profile; partial: boolean }
const API = import.meta.env.VITE_API_URL || 'https://api.deadlock-api.com'
async function get<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API}${path}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(25000)]) })
  if (!response.ok) throw new Error(response.status === 429 ? 'Limite de consultas atingido. Aguarde antes de tentar novamente.' : `Não foi possível consultar a API (HTTP ${response.status}).`)
  return response.json()
}
export async function loadPlayer(id: string, signal: AbortSignal): Promise<PlayerData> {
  const results = await Promise.allSettled([
    get<Match[]>(`/v1/players/${id}/match-history`, signal),
    get<Hero[]>('/v1/assets/heroes', signal),
    get<Profile[]>(`/v1/players/steam?account_ids=${id}`, signal),
  ])
  if (results[0].status === 'rejected') throw new Error(results[0].reason?.name === 'TimeoutError' ? 'A consulta demorou demais. Tente novamente.' : results[0].reason?.message || 'Não foi possível conectar à Deadlock API.')
  return { matches: results[0].value.sort((a, b) => b.start_time - a.start_time), heroes: results[1].status === 'fulfilled' ? results[1].value : [], profile: results[2].status === 'fulfilled' ? results[2].value[0] : undefined, partial: results.slice(1).some(r => r.status === 'rejected') }
}



export type SteamSearchResult = { accountId: string; personaname: string; avatarfull?: string }
export async function searchPlayers(query: string, signal: AbortSignal): Promise<SteamSearchResult[]> {
  const response = await fetch(`${API}/v1/players/steam-search?${new URLSearchParams({ search_query: query, limit: '10', min_matches_played_last_30d: '0' })}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) })
  if (response.status === 404) return []
  if (!response.ok) throw new Error(response.status === 429 ? 'Muitas buscas. Aguarde um pouco e tente novamente.' : `Falha na busca (HTTP ${response.status}).`)
  const profiles: { account_id?: number; steam_id3?: number; personaname: string; avatarfull?: string }[] = await response.json()
  return profiles.flatMap(profile => {
    const id = profile.account_id ?? profile.steam_id3
    return Number.isInteger(id) && id! >= 0 && id! <= 2147483647 ? [{ accountId: String(id), personaname: profile.personaname, avatarfull: profile.avatarfull }] : []
  })
}
