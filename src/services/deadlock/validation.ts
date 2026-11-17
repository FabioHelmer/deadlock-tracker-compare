import type { Hero, Match, Profile, SteamSearchResult } from '../../domain/models.ts'
import { normalizeAccountId } from '../../domain/accountId.ts'
const error = () =>
  new Error('A API retornou campos inválidos. Não calculamos estatísticas com esses dados.')
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw error()
  return value as Record<string, unknown>
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value))
    throw new Error('A API retornou um formato de dados inválido. Tente atualizar.')
  return value
}
function integer(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw error()
  return value
}
function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw error()
  return value
}
function image(value: unknown): string | undefined {
  if (value == null) return undefined
  const url = text(value)
  try {
    if (['https:', 'http:'].includes(new URL(url).protocol)) return url
  } catch {
    /* Reporta erro de contrato abaixo. */
  }
  throw error()
}
export function parseMatchHistory(value: unknown): Match[] {
  const ids = new Set<number>()
  return list(value)
    .map((item): Match => {
      const row = record(item)
      const team = integer(row.player_team),
        result = integer(row.match_result)
      if ((team !== 0 && team !== 1) || (result !== 0 && result !== 1)) throw error()
      const matchId = integer(row.match_id)
      if (ids.has(matchId)) throw error()
      ids.add(matchId)
      return {
        match_id: matchId,
        hero_id: integer(row.hero_id),
        start_time: integer(row.start_time),
        player_team: team,
        match_result: result,
        player_kills: integer(row.player_kills),
        player_deaths: integer(row.player_deaths),
        player_assists: integer(row.player_assists),
        match_duration_s: integer(row.match_duration_s),
        net_worth: integer(row.net_worth),
        last_hits: row.last_hits == null ? null : integer(row.last_hits),
        game_mode: row.game_mode == null ? null : integer(row.game_mode),
        match_mode: row.match_mode == null ? null : integer(row.match_mode),
      }
    })
    .sort((a, b) => b.start_time - a.start_time)
}
export function parseHeroes(value: unknown): Hero[] {
  return list(value).map((item): Hero => {
    const row = record(item)
    const images = row.images == null ? {} : record(row.images)
    return {
      id: integer(row.id),
      name: text(row.name),
      images: {
        icon_hero_card: image(images.icon_hero_card),
        icon_image_large: image(images.icon_image_large),
        icon_image: image(images.icon_image),
        icon_image_small: image(images.icon_image_small),
      },
    }
  })
}
function parseProfile(item: unknown): Profile {
  const row = record(item)
  return { personaname: text(row.personaname), avatarfull: image(row.avatarfull) }
}
export function parseProfiles(value: unknown): Profile[] {
  return list(value).map(parseProfile)
}
export function parseSearchResults(value: unknown): SteamSearchResult[] {
  return list(value).map((item): SteamSearchResult => {
    const row = record(item)
    const accountId = normalizeAccountId(String(integer(row.account_id ?? row.steam_id3)))
    if (!accountId) throw error()
    return { ...parseProfile(row), accountId }
  })
}
