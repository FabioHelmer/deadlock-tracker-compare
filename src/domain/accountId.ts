export function isAccountId(value: unknown): value is string {
  return typeof value === 'string' && /^\d{1,10}$/.test(value) && Number(value) <= 2147483647
}
export function normalizeAccountId(value: unknown): string | null {
  return isAccountId(value) ? String(Number(value)) : null
}
