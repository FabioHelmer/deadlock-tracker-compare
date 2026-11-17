import { useEffect, useState } from 'react'
import { comparisonLocation, comparisonUrl } from './share.ts'
import type { ComparisonFilters } from '../../domain/models.ts'
export function useComparisonLocation(account: string) {
  const [location, setLocation] = useState(() => comparisonLocation(window.location.search))
  useEffect(() => {
    const sync = () => setLocation(comparisonLocation(window.location.search))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  function urlFor(next: typeof location) {
    return comparisonUrl(window.location.href, {
      ...next.filters,
      player: account,
      opponent: next.opponent || undefined,
      matchMode: next.filters.matchMode === 'all' ? undefined : next.filters.matchMode,
    })
  }
  const url = urlFor(location)
  useEffect(() => {
    window.history.replaceState(null, '', url)
  }, [url])
  function update(next: typeof location) {
    window.history.pushState(null, '', urlFor(next))
    setLocation(next)
  }
  return {
    ...location,
    url,
    setOpponent: (opponent: string) => update({ ...location, opponent }),
    setFilters: (patch: Partial<ComparisonFilters>) =>
      update({ ...location, filters: { ...location.filters, ...patch } }),
  }
}
