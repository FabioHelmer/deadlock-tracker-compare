export type Match = {
  match_id: number
  hero_id: number
  start_time: number
  player_team: 0 | 1
  match_result: 0 | 1
  player_kills: number
  player_deaths: number
  player_assists: number
  match_duration_s: number
  net_worth: number
  last_hits: number | null
  game_mode: number | null
  match_mode: number | null
}
export type Hero = {
  id: number
  name: string
  images: Partial<
    Record<'icon_hero_card' | 'icon_image_large' | 'icon_image' | 'icon_image_small', string>
  >
}
export type Profile = { personaname: string; avatarfull?: string }
export type PlayerData = {
  matches: Match[]
  heroes: Hero[]
  profile?: Profile
  partial: boolean
  queriedAt: number
}
export type SteamSearchResult = Profile & { accountId: string }
export type PlayerMetrics = {
  killsPerMinute: number
  assistsPerMinute: number
  deathsPerMinute: number
  netWorthPerMinute: number
  lastHitsPerMinute: number | null
}
export type MetricKey = keyof PlayerMetrics
export type DatePeriod = { from?: string; to?: string }
export type MatchType = 'all' | '1' | '4'
export type SampleFilters = DatePeriod & { matchMode?: MatchType }
export type ComparisonFilters = {
  mode: string
  hero: string
  count: number
  matchMode: MatchType
  from: string
  to: string
  commonOnly: boolean
}
