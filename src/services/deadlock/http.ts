export const API_BASE = import.meta.env?.VITE_API_URL || 'https://api.deadlock-api.com'
export class ApiError extends Error {
  readonly status: number
  constructor(status: number) {
    super(
      status === 429
        ? 'Limite de consultas atingido. Aguarde antes de tentar novamente.'
        : `Não foi possível consultar a API (HTTP ${status}).`,
    )
    this.status = status
  }
}
export async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
  signal.throwIfAborted()
  const response = await fetch(`${API_BASE}${path}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(25000)]),
  })
  if (!response.ok) throw new ApiError(response.status)
  const value: unknown = await response.json()
  signal.throwIfAborted()
  return value
}
