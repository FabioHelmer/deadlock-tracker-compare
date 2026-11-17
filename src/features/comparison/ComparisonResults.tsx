import { useState } from 'react'
import Radar from './Radar.tsx'
import { attributes } from '../../domain/comparison.ts'
import type { PlayerMetrics } from '../../domain/models.ts'
export default function ComparisonResults({
  a,
  b,
  n,
  names,
}: {
  a: PlayerMetrics
  b: PlayerMetrics
  n: number
  names: string[]
}) {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <>
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
        <span className="text-lime-300">● {names[0]}</span>
        <span className="text-cyan-200">● {names[1]}</span>
      </div>
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div>
          <Radar a={a} b={b} names={names} />
          <p className="text-center text-xs text-stone-500">
            Escala relativa 0–100 · 50 = empate · maior área = vantagem nos atributos
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="pb-4 text-left text-stone-400">
              Mesma amostra: {n} partidas recentes por jogador
            </caption>
            <thead>
              <tr className="border-b border-white/10 text-xs text-stone-400">
                <th className="py-3">Atributo</th>
                <th className="px-2 text-lime-300">Jogador 1</th>
                <th className="px-2 text-cyan-200">Jogador 2</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, i) => (
                <tr key={attr.label} className="border-b border-white/5">
                  <th className="py-4 font-normal">
                    <button
                      className="text-left hover:text-lime-200"
                      onClick={() => setSelected(selected === i ? null : i)}
                    >
                      {attr.label} ⓘ
                      <span className="block text-[10px] text-stone-500">
                        {attr.unit}
                        {attr.lower ? ' · menor é melhor' : ''}
                      </span>
                    </button>
                  </th>
                  {[a[attr.key], b[attr.key]].map((v, j) => (
                    <td key={j} className="px-2 font-mono">
                      {v === null ? 'N/D' : v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {selected !== null && (
            <p role="status" className="mt-3 text-xs leading-5 text-stone-400">
              {attributes[selected].label}: {attributes[selected].description}
            </p>
          )}
        </div>
      </div>
      <p className={`mt-5 text-sm ${n < 20 ? 'text-amber-200' : 'text-stone-400'}`}>
        {n < 20
          ? 'Amostra pequena: resultado exploratório.'
          : 'Comparação descritiva do histórico disponível.'}{' '}
        Não ajusta por rank, adversários, função ou mudanças de patch.
      </p>
    </>
  )
}
