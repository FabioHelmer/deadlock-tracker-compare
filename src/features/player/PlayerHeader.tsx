import { Crosshair, RefreshCw, ArrowUpRight } from 'lucide-react'
import type { PlayerData } from '../../domain/models.ts'
export default function PlayerHeader({
  data,
  id,
  loading,
  refresh,
}: {
  data?: PlayerData
  id: string
  loading: boolean
  refresh: () => void
}) {
  return (
    <section className="profile-panel mb-6 flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 p-8">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-lime-200/10">
        {data?.profile?.avatarfull ? (
          <img
            className="h-full w-full object-cover"
            src={data.profile.avatarfull}
            alt="Avatar do jogador"
          />
        ) : (
          <Crosshair size={40} className="text-lime-200" />
        )}
      </div>
      <div className="flex-1">
        <p className="mb-1 text-xs uppercase tracking-widest text-stone-400">Perfil Deadlock</p>
        <h2 className="text-2xl font-bold">{data?.profile?.personaname ?? `Jogador #${id}`}</h2>
        <p className="mt-2 text-sm text-stone-500">
          Account ID <span className="font-mono text-stone-300">{id}</span>
        </p>
      </div>
      <button
        disabled={loading}
        onClick={refresh}
        className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm disabled:opacity-40"
      >
        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        Atualizar
      </button>
      <a
        className="flex items-center gap-1 text-sm text-lime-200"
        href={`https://tracklock.gg/players/${id}`}
        target="_blank"
        rel="noreferrer"
      >
        Tracklock
        <ArrowUpRight size={16} />
      </a>
    </section>
  )
}
