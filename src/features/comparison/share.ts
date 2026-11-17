import { validDate } from '../../domain/comparison.ts'
import { normalizeAccountId } from '../../domain/accountId.ts'
import type { ComparisonFilters } from '../../domain/models.ts'
export const defaultFilters: ComparisonFilters = {
  mode: 'all',
  hero: 'all',
  count: 20,
  matchMode: 'all',
  from: '',
  to: '',
  commonOnly: false,
}
export function readComparison(search: string) {
  const query = new URLSearchParams(search)
  const filter = (value: string | null) => (value && /^\d+$/.test(value) ? value : 'all')
  const count = Number(query.get('count'))
  return {
    player: normalizeAccountId(query.get('player')),
    opponent: normalizeAccountId(query.get('opponent')),
    mode: filter(query.get('mode')),
    hero: filter(query.get('hero')),
    count: [10, 20, 50, 100].includes(count) ? count : 20,
    ...(['1', '4'].includes(query.get('matchMode') ?? '')
      ? { matchMode: query.get('matchMode') as '1' | '4' }
      : {}),
    ...(validDate(query.get('from')) ? { from: validDate(query.get('from')) } : {}),
    ...(validDate(query.get('to')) ? { to: validDate(query.get('to')) } : {}),
    ...(query.has('commonOnly') ? { commonOnly: query.get('commonOnly') === 'true' } : {}),
  }
}
export function comparisonUrl(
  href: string,
  state: {
    player: string
    opponent?: string
    mode: string
    hero: string
    count: number
    from?: string
    to?: string
    matchMode?: string
    commonOnly?: boolean
  },
) {
  const url = new URL(href)
  for (const [key, value] of Object.entries(state)) {
    if (value === undefined || value === '') url.searchParams.delete(key)
    else url.searchParams.set(key, String(value))
  }
  return url.toString()
}
export function comparisonLocation(search: string) {
  const parsed = readComparison(search)
  return {
    opponent: parsed.opponent ?? '',
    filters: {
      ...defaultFilters,
      mode: parsed.mode,
      hero: parsed.hero,
      count: parsed.count,
      from: parsed.from ?? '',
      to: parsed.to ?? '',
      matchMode: parsed.matchMode ?? 'all',
      commonOnly: parsed.commonOnly ?? false,
    } satisfies ComparisonFilters,
  }
}
