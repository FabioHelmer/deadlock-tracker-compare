import type { Match } from './api'

export const attributes = [
  { label: 'Combate', unit: 'abates/min', lower: false },
  { label: 'Apoio', unit: 'assistências/min', lower: false },
  { label: 'Sobrevivência', unit: 'mortes/min', lower: true },
  { label: 'Economia', unit: 'almas finais/min', lower: false },
  { label: 'Farm', unit: 'last hits/min', lower: false },
]
export function summarize(matches: Match[]) {
  const minutes = matches.reduce((sum, m) => sum + m.match_duration_s / 60, 0)
  if (!matches.length || minutes <= 0) return null
  const sum = (key: 'player_kills' | 'player_assists' | 'player_deaths' | 'net_worth' | 'last_hits') => matches.reduce((total, m) => total + (m[key] ?? 0), 0) / minutes
  return [sum('player_kills'), sum('player_assists'), sum('player_deaths'), sum('net_worth'), matches.every(m => Number.isFinite(m.last_hits)) ? sum('last_hits') : null]
}
export function relativeScore(a: number, b: number, lower = false) {
  if (a + b === 0) return 50
  return 100 * (lower ? b : a) / (a + b)
}
export function sample(matches: Match[], mode: string, hero: string, count: number) {
  return matches.filter(m => m.match_duration_s > 0 && (mode === 'all' || String(m.game_mode) === mode) && (hero === 'all' || String(m.hero_id) === hero)).sort((a, b) => b.start_time - a.start_time).slice(0, count)
}
