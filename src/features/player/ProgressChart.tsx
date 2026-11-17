import { useState } from 'react'
import type { Match } from '../../domain/models.ts'
import { sample, summarize, attributes } from '../../domain/comparison.ts'
import type { SampleFilters } from '../../domain/models.ts'

export default function ProgressChart({
  matches,
  mode,
  hero,
  period,
}: {
  matches: Match[]
  mode: string
  hero: string
  period: SampleFilters
}) {
  const [metric, setMetric] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const points = sample(matches, mode, hero, 30, period)
    .reverse()
    .map((match) => ({ match, value: summarize([match])?.[attributes[metric].key] ?? null }))
  const max = Math.max(0.01, ...points.map((p) => p.value ?? 0)) * 1.1
  const position = (i: number, value: number) => [
    48 + (i / Math.max(1, points.length - 1)) * 500,
    164 - (value / max) * 130,
  ]
  const active = points[selected ?? points.length - 1]
  return (
    <div className="mb-5 rounded-xl border border-white/10 bg-[#101310] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-sm font-semibold">Evolução por partida</h5>
        <select
          aria-label="Atributo da evolução"
          className="rounded border border-white/15 bg-[#191d18] p-2 text-xs"
          value={metric}
          onChange={(e) => {
            setMetric(Number(e.target.value))
            setSelected(null)
          }}
        >
          {attributes.map((a, i) => (
            <option key={a.label} value={i}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      {!points.length ? (
        <p className="py-6 text-xs text-stone-500">Nenhuma partida com estes filtros.</p>
      ) : (
        <>
          <svg
            viewBox="0 0 580 210"
            className="mt-2 w-full"
            role="group"
            aria-label={`Evolução de ${attributes[metric].label} nas últimas ${points.length} partidas`}
          >
            {[0, 0.5, 1].map((level) => (
              <g key={level}>
                <line
                  x1="48"
                  y1={164 - level * 130}
                  x2="548"
                  y2={164 - level * 130}
                  stroke="#ffffff15"
                />
                <text x="42" y={168 - level * 130} fill="#a8a29e" fontSize="10" textAnchor="end">
                  {(max * level).toFixed(metric === 3 ? 0 : 2)}
                </text>
              </g>
            ))}
            {points.map((p, i) => {
              const next = points[i + 1]
              if (p.value === null || !next || next.value === null) return null
              const a = position(i, p.value),
                b = position(i + 1, next.value)
              return (
                <line
                  key={i}
                  x1={a[0]}
                  y1={a[1]}
                  x2={b[0]}
                  y2={b[1]}
                  stroke="#bef264"
                  strokeWidth="2"
                />
              )
            })}
            {points.map((p, i) =>
              p.value === null ? null : (
                <g
                  key={p.match.match_id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Partida ${p.match.match_id}: ${p.value.toFixed(2)} ${attributes[metric].unit}`}
                  onClick={() => setSelected(i)}
                  onFocus={() => setSelected(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(i)
                    }
                  }}
                  className="radar-control"
                >
                  <circle
                    cx={position(i, p.value)[0]}
                    cy={position(i, p.value)[1]}
                    r="11"
                    fill="transparent"
                  />
                  <circle
                    cx={position(i, p.value)[0]}
                    cy={position(i, p.value)[1]}
                    r={selected === i ? 5 : 3}
                    fill="#bef264"
                  />
                </g>
              ),
            )}
            <text x="48" y="195" fill="#a8a29e" fontSize="11">
              Mais antiga
            </text>
            <text x="548" y="195" fill="#a8a29e" fontSize="11" textAnchor="end">
              Mais recente →
            </text>
          </svg>
          <p aria-live="polite" className="text-xs text-stone-300">
            {active && (
              <>
                #{active.match.match_id} ·{' '}
                {new Date(active.match.start_time * 1000).toLocaleDateString('pt-BR')} ·{' '}
                {active.value === null
                  ? 'N/D'
                  : active.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}{' '}
                {attributes[metric].unit}
              </>
            )}
          </p>
          <p className="mt-2 text-[10px] text-stone-500">
            Até 30 partidas, sem suavização.{' '}
            {attributes[metric].lower ? 'Menos mortes por minuto é melhor.' : 'Valores por minuto.'}{' '}
            Falhas de dados interrompem a linha.
          </p>
        </>
      )}
    </div>
  )
}
