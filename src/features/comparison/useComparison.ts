import { useState } from 'react'
import { usePlayer } from '../player/usePlayer.ts'
import { useComparisonLocation } from './useComparisonLocation.ts'
import { buildComparison } from '../../domain/buildComparison.ts'
import { normalizeAccountId } from '../../domain/accountId.ts'
import type { PlayerData } from '../../domain/models.ts'
export function useComparison(player: PlayerData | undefined, account: string) {
  const location = useComparisonLocation(account)
  const opponentId = location.opponent === account ? '' : location.opponent
  const resource = usePlayer(opponentId)
  const [selectionError, setSelectionError] = useState('')
  const comparison = buildComparison(player, resource.data, location.filters)
  function compare(input: string) {
    const id = normalizeAccountId(input)
    if (!id || id === account) {
      setSelectionError('Escolha um jogador diferente com Account ID válido.')
      return
    }
    setSelectionError('')
    if (id === location.opponent) resource.refetch()
    else location.setOpponent(id)
  }
  return {
    ...comparison,
    ...location,
    compare,
    loading: resource.loading,
    error:
      selectionError ||
      (location.opponent === account
        ? 'Escolha um jogador diferente para comparar.'
        : resource.error),
    other: resource.data ? { id: opponentId, data: resource.data } : undefined,
  }
}
