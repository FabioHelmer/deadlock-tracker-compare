import { useCallback, useEffect, useRef, useState } from 'react'
import { loadPlayer } from '../../services/deadlock/api.ts'
import type { PlayerData } from '../../domain/models.ts'
export type PlayerState =
  | { account: string; status: 'idle' | 'loading' }
  | { account: string; status: 'success'; data: PlayerData }
  | { account: string; status: 'error'; error: string }
export function usePlayer(account: string) {
  const [state, setState] = useState<PlayerState>({ account, status: account ? 'loading' : 'idle' })
  const request = useRef<AbortController | null>(null)
  const run = useCallback(
    async (force = false) => {
      request.current?.abort()
      if (!account) return
      const controller = new AbortController()
      request.current = controller
      setState({ account, status: 'loading' })
      try {
        const data = await loadPlayer(account, controller.signal, force)
        if (!controller.signal.aborted) setState({ account, status: 'success', data })
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            account,
            status: 'error',
            error: error instanceof Error ? error.message : 'Não foi possível carregar o jogador.',
          })
      }
    },
    [account],
  )
  useEffect(() => {
    let disposed = false
    void Promise.resolve().then(() => {
      if (!disposed) void run()
    })
    return () => {
      disposed = true
      request.current?.abort()
    }
  }, [run])
  const current: PlayerState =
    state.account === account ? state : { account, status: account ? 'loading' : 'idle' }
  return {
    state: current,
    data: current.status === 'success' ? current.data : undefined,
    loading: current.status === 'loading',
    error: current.status === 'error' ? current.error : '',
    refetch: () => {
      void run(true)
    },
  }
}
