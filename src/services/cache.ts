type Entry = { value: unknown; time: number }
const entries = new Map<string, Entry>()
export const PROFILE_TTL = 5 * 60 * 1000
export const ASSETS_TTL = 60 * 60 * 1000
export function readCache<T>(
  key: string,
  ttl: number,
  now = Date.now(),
): { value: T; time: number } | null {
  const entry = entries.get(key)
  if (!entry || now - entry.time >= ttl) {
    entries.delete(key)
    return null
  }
  return { value: structuredClone(entry.value) as T, time: entry.time }
}
export function writeCache(key: string, value: unknown, time = Date.now()) {
  if (!entries.has(key) && entries.size >= 100) {
    const oldest = entries.keys().next().value
    if (oldest !== undefined) entries.delete(oldest)
  }
  entries.set(key, { value: structuredClone(value), time })
}
