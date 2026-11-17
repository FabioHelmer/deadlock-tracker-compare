import type { PlayerMetrics } from '../../domain/models.ts'
import { useState } from 'react'
import { attributes, relativeScore } from '../../domain/comparison.ts'

type Props = { a: PlayerMetrics; b: PlayerMetrics; names: string[] }
export default function Radar({ a, b, names }: Props) {
  const [selected, setSelected] = useState(0)
  const point = (i: number, score: number, radius = 125) => {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
    return [
      220 + (Math.cos(angle) * radius * score) / 100,
      185 + (Math.sin(angle) * radius * score) / 100,
    ]
  }
  const polygon = (values: number[]) => values.map((v, i) => point(i, v).join(',')).join(' ')
  const scores = attributes.map((attr) => {
    const left = a[attr.key],
      right = b[attr.key]
    return left === null || right === null ? null : relativeScore(left, right, attr.lower)
  })
  const complete = scores.every((v) => v !== null)
  const value = (v: number | null) =>
    v === null ? 'Não disponível' : v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return (
    <div>
      <svg
        viewBox="0 0 440 370"
        className="mx-auto w-full max-w-lg"
        role="group"
        aria-label="Radar interativo de atributos"
      >
        <title>
          Selecione um atributo para ver os valores. Eixos sem dados não têm ponto nem área
          preenchida.
        </title>
        {[25, 50, 75, 100].map((level) => (
          <polygon
            key={level}
            points={polygon(Array(5).fill(level))}
            fill="none"
            stroke="#ffffff18"
          />
        ))}
        {attributes.map((attr, i) => {
          const [x, y] = point(i, 100, 165)
          const end = point(i, 100)
          return (
            <g key={attr.label}>
              <line
                x1="220"
                y1="185"
                x2={end[0]}
                y2={end[1]}
                stroke={scores[i] === null ? '#fbbf24' : '#ffffff25'}
                strokeDasharray={scores[i] === null ? '4 5' : undefined}
              />
              <g
                role="button"
                tabIndex={0}
                aria-label={`Ver atributo ${attr.label}`}
                aria-pressed={selected === i}
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
                <rect
                  x={x - 57}
                  y={y - 21}
                  width="114"
                  height="42"
                  rx="6"
                  fill={selected === i ? '#293122' : 'transparent'}
                />
                <text
                  x={x}
                  y={y}
                  fill={scores[i] === null ? '#fbbf24' : selected === i ? '#bef264' : '#d6d3d1'}
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {attr.label}
                  {scores[i] === null ? ' (N/D)' : ''}
                </text>
              </g>
            </g>
          )
        })}
        {[0, 1].map((player) => {
          const values = scores.map((v) => (v === null ? null : player ? 100 - v : v))
          const color = player ? '#67e8f9' : '#bef264'
          return (
            <g key={player}>
              {complete ? (
                <polygon
                  points={polygon(values as number[])}
                  fill={`${color}25`}
                  stroke={color}
                  strokeWidth="2.5"
                />
              ) : (
                values.map((v, i) => {
                  const next = values[(i + 1) % 5]
                  if (v === null || next === null) return null
                  const start = point(i, v),
                    end = point((i + 1) % 5, next)
                  return (
                    <line
                      key={i}
                      x1={start[0]}
                      y1={start[1]}
                      x2={end[0]}
                      y2={end[1]}
                      stroke={color}
                      strokeWidth="2.5"
                    />
                  )
                })
              )}
              {values.map((v, i) =>
                v === null ? null : (
                  <circle key={i} cx={point(i, v)[0]} cy={point(i, v)[1]} r="4" fill={color} />
                ),
              )}
            </g>
          )
        })}
      </svg>
      <div
        aria-live="polite"
        className="mb-3 rounded-lg border border-white/10 bg-[#101310] p-3 text-xs"
      >
        <p className="mb-2 font-semibold">
          {attributes[selected].label} · {attributes[selected].unit}
          {attributes[selected].lower ? ' · menor é melhor' : ''}
        </p>
        <p className="text-lime-300">
          {names[0]}: {value(a[attributes[selected].key])}
        </p>
        <p className="text-cyan-200">
          {names[1]}: {value(b[attributes[selected].key])}
        </p>
        {!complete && (
          <p className="mt-2 text-amber-200">
            Eixos sem dados estão tracejados e sem pontos. A área não é preenchida para não sugerir
            empate.
          </p>
        )}
      </div>
    </div>
  )
}
