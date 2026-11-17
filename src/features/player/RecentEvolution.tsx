import ProgressChart from './ProgressChart.tsx'
import type { PlayerData, SampleFilters } from '../../domain/models.ts'
import { attributes } from '../../domain/comparison.ts'
import { evolution } from '../../domain/insights.ts'
const num = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
export default function RecentEvolution({
  data,
  name,
  mode,
  hero,
  period = {},
}: {
  data: PlayerData
  name: string
  mode: string
  hero: string
  period?: SampleFilters
}) {
  const result = evolution(data.matches, mode, hero, period)
  return (
    <article className="rounded-xl border border-white/10 bg-[#191d18] p-5 shadow-lg sm:p-6">
      <h4 className="mb-3 text-lg font-semibold text-stone-100">{name}</h4>
      <ProgressChart matches={data.matches} mode={mode} hero={hero} period={period} />
      {!result ? (
        <p className="text-sm text-stone-500">
          São necessárias 20 partidas com estes filtros para comparar as últimas 10 com as 10
          anteriores.
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs text-stone-500">Últimas 10 partidas × 10 anteriores</p>
          <div className="space-y-2">
            {attributes.map((attr) => {
              const current = result.current[attr.key],
                previous = result.previous[attr.key]
              const delta = current !== null && previous !== null ? current - previous : null
              const better = delta !== null && (attr.lower ? delta < 0 : delta > 0)
              return (
                <div
                  key={attr.label}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-white/5 bg-[#101310] px-3 py-4 text-xs sm:gap-6 sm:px-4"
                >
                  <span>
                    {attr.label}
                    <span className="block text-[10px] text-stone-500">{attr.unit}</span>
                  </span>
                  <span className="font-mono text-stone-300">
                    {previous === null ? 'N/D' : num(previous)} →{' '}
                    {current === null ? 'N/D' : num(current)}
                  </span>
                  <span
                    className={
                      'min-w-16 rounded-md px-2 py-1.5 text-center font-mono font-semibold ' +
                      (delta === null || delta === 0
                        ? 'bg-[#252b24] text-stone-400'
                        : better
                          ? 'bg-[#26351c] text-lime-300'
                          : 'bg-[#38221f] text-red-300')
                    }
                  >
                    {delta === null ? 'N/D' : `${delta > 0 ? '+' : ''}${num(delta)}`}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-[11px] text-stone-500">
            Variação descritiva; amostra pequena e sem ajuste de dificuldade.
          </p>
        </>
      )}
    </article>
  )
}
