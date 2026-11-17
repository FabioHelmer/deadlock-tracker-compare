import { useEffect, useState } from 'react'
import Home from '../features/player/Home.tsx'
import Dashboard from '../features/player/Dashboard.tsx'
import {
  writePlayer,
  readPlayer,
  sharedPlayer,
  type RememberedPlayer,
} from '../features/player/rememberedPlayer.ts'
export default function App() {
  const [saved, setSaved] = useState(readPlayer)
  const [active, setActive] = useState(
    () => sharedPlayer(window.location.search) ?? readPlayer()?.id ?? null,
  )
  const [storageError, setStorageError] = useState('')
  useEffect(() => {
    const sync = () => setActive(sharedPlayer(window.location.search) ?? readPlayer()?.id ?? null)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  function choose(player: RememberedPlayer) {
    try {
      writePlayer(player)
      setSaved(player)
      setStorageError('')
    } catch {
      setStorageError(
        'Seu navegador não permitiu salvar o perfil. Você pode continuar, mas precisará selecioná-lo no próximo acesso.',
      )
    }
    window.history.replaceState(null, '', window.location.pathname)
    setActive(player.id)
  }
  function browse(id: string) {
    const url = new URL(window.location.href)
    url.searchParams.set('player', id)
    if (url.searchParams.get('opponent') === id) url.searchParams.delete('opponent')
    window.history.pushState(null, '', url)
    setActive(id)
  }
  function changePlayer() {
    window.history.replaceState(null, '', window.location.pathname)
    setActive(null)
  }
  return (
    <>
      {storageError && (
        <div
          role="alert"
          className="border-b border-amber-200/20 bg-[#292518] px-5 py-3 text-sm text-amber-200"
        >
          {storageError}
        </div>
      )}
      {active ? (
        <Dashboard
          key={active}
          initialAccount={active}
          onChangePlayer={changePlayer}
          onSelectPlayer={browse}
        />
      ) : (
        <Home
          saved={saved}
          onSelect={choose}
          onContinue={() => {
            if (saved) setActive(saved.id)
          }}
        />
      )}
    </>
  )
}
