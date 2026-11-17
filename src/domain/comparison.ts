import type { Match, PlayerMetrics, MetricKey, SampleFilters } from './models.ts'
export type Attribute = {
  key: MetricKey
  label: string
  unit: string
  lower: boolean
  description: string
}
export const attributes: Attribute[] = [
  {
    key: 'killsPerMinute',
    label: 'Combate',
    unit: 'abates/min',
    lower: false,
    description: 'Total de abates dividido pelo total de minutos.',
  },
  {
    key: 'assistsPerMinute',
    label: 'Apoio',
    unit: 'assistências/min',
    lower: false,
    description: 'Total de assistências dividido pelo total de minutos.',
  },
  {
    key: 'deathsPerMinute',
    label: 'Sobrevivência',
    unit: 'mortes/min',
    lower: true,
    description: 'Total de mortes dividido pelo total de minutos. Menor é melhor.',
  },
  {
    key: 'netWorthPerMinute',
    label: 'Economia',
    unit: 'almas finais/min',
    lower: false,
    description:
      'Patrimônio final dividido pelo tempo de partida; não representa todas as almas coletadas ou gastas.',
  },
  {
    key: 'lastHitsPerMinute',
    label: 'Farm',
    unit: 'last hits/min',
    lower: false,
    description:
      'Last hits divididos pelo tempo de partida. Dados ausentes aparecem como N/D e sem ponto no radar.',
  },
]
export function summarize(matches: Match[]): PlayerMetrics | null {
  const minutes = matches.reduce((sum, match) => sum + match.match_duration_s / 60, 0)
  if (!matches.length || minutes <= 0) return null
  const rate = (
    key: 'player_kills' | 'player_assists' | 'player_deaths' | 'net_worth' | 'last_hits',
  ) => matches.reduce((sum, match) => sum + (match[key] ?? 0), 0) / minutes
  return {
    killsPerMinute: rate('player_kills'),
    assistsPerMinute: rate('player_assists'),
    deathsPerMinute: rate('player_deaths'),
    netWorthPerMinute: rate('net_worth'),
    lastHitsPerMinute: matches.every((match) => Number.isFinite(match.last_hits))
      ? rate('last_hits')
      : null,
  }
}
export function relativeScore(a: number, b: number, lower = false) {
  return a + b === 0 ? 50 : (100 * (lower ? b : a)) / (a + b)
}
export function sample(
  matches: Match[],
  mode: string,
  hero: string,
  count: number,
  filters: SampleFilters = {},
) {
  return matches
    .filter(
      (match) =>
        match.match_duration_s > 0 &&
        inPeriod(match.start_time, filters) &&
        (!filters.matchMode ||
          filters.matchMode === 'all' ||
          String(match.match_mode) === filters.matchMode) &&
        (mode === 'all' || String(match.game_mode) === mode) &&
        (hero === 'all' || String(match.hero_id) === hero),
    )
    .sort((a, b) => b.start_time - a.start_time)
    .slice(0, count)
}
export function validDate(value: string | null): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const time = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value
    ? value
    : undefined
}
export function inPeriod(timestamp: number, period: SampleFilters = {}) {
  const from = validDate(period.from ?? null),
    to = validDate(period.to ?? null)
  return (
    (!from || timestamp >= Date.parse(`${from}T00:00:00Z`) / 1000) &&
    (!to || timestamp < Date.parse(`${to}T00:00:00Z`) / 1000 + 86400)
  )
}
