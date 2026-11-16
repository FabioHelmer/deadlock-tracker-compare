export function readComparison(search: string) {
  const query = new URLSearchParams(search)
  const id = (value: string | null) => value && /^\d{1,10}$/.test(value) && Number(value) <= 2147483647 ? value : null
  const filter = (value: string | null) => value && /^\d+$/.test(value) ? value : 'all'
  const count = Number(query.get('count'))
  return { player: id(query.get('player')) ?? '1013623044', opponent: id(query.get('opponent')), mode: filter(query.get('mode')), hero: filter(query.get('hero')), count: [10, 20, 50, 100].includes(count) ? count : 20 }
}
export function comparisonUrl(href: string, state: { player: string; opponent?: string; mode: string; hero: string; count: number }) {
  const url = new URL(href)
  for (const [key, value] of Object.entries(state)) { if (value === undefined) url.searchParams.delete(key); else url.searchParams.set(key, String(value)) }
  return url.toString()
}
