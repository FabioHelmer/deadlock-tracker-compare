import type { ComparisonFilters as Filters, Hero } from '../../domain/models.ts'
export default function ComparisonFilters({
  filters,
  setFilters,
  options,
  heroes,
  commonHeroes,
  activeHero,
  invalidPeriod,
  ready,
}: {
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
  options: number[]
  heroes: Hero[]
  commonHeroes: Hero[]
  activeHero: string | null
  invalidPeriod: boolean
  ready: boolean
}) {
  const { mode, hero, count, matchMode, from, to, commonOnly } = filters
  return (
    <>
      {' '}
      <div className="flex flex-wrap gap-3 text-sm">
        <label>
          Janela{' '}
          <select
            className="ml-2 rounded border border-white/15 bg-[#101310] p-2"
            value={count}
            onChange={(e) => setFilters({ count: Number(e.target.value) })}
          >
            {[10, 20, 50, 100].map((v) => (
              <option key={v} value={v}>
                Últimas {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Modo{' '}
          <select
            className="ml-2 rounded border border-white/15 bg-[#101310] p-2"
            value={mode}
            onChange={(e) => setFilters({ mode: e.target.value })}
          >
            <option value="all">Todos</option>
            {options.map((v) => (
              <option key={v} value={v}>
                {v === 1 ? 'Normal' : v === 4 ? 'Street Brawl' : 'Modo ' + v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Herói{' '}
          <select
            className="ml-2 rounded border border-white/15 bg-[#101310] p-2"
            value={activeHero ?? ''}
            onChange={(e) => setFilters({ hero: e.target.value })}
          >
            {!commonOnly && <option value="all">Todos</option>}
            {commonOnly && !commonHeroes.length && <option value="">Sem heróis em comum</option>}
            {(commonOnly ? commonHeroes : heroes).map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <label>
          Tipo de partida{' '}
          <select
            aria-label="Tipo de partida"
            value={matchMode}
            onChange={(e) => setFilters({ matchMode: e.target.value as 'all' | '1' | '4' })}
            className="ml-2 rounded border border-white/15 bg-[#101310] p-2"
          >
            <option value="all">Todos os tipos</option>
            <option value="4">Ranqueadas</option>
            <option value="1">Casuais</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <label>
          De{' '}
          <input
            aria-label="Data inicial"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFilters({ from: e.target.value })}
            className="ml-2 rounded border border-white/15 bg-[#101310] p-2"
          />
        </label>
        <label>
          Até{' '}
          <input
            aria-label="Data final"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setFilters({ to: e.target.value })}
            className="ml-2 rounded border border-white/15 bg-[#101310] p-2"
          />
        </label>
        {(from || to) && (
          <button
            onClick={() => {
              setFilters({ from: '', to: '' })
            }}
            className="text-xs text-lime-200"
          >
            Limpar período
          </button>
        )}
        <span className="text-xs text-stone-500">Datas em UTC · limites inclusivos</span>
      </div>
      {invalidPeriod && (
        <p role="alert" className="mt-2 text-sm text-red-200">
          A data inicial deve ser anterior ou igual à data final.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            disabled={!ready}
            checked={commonOnly}
            onChange={(e) => {
              setFilters({
                commonOnly: e.target.checked,
                hero:
                  e.target.checked && !commonHeroes.some((h) => String(h.id) === hero)
                    ? String(commonHeroes[0]?.id ?? 'all')
                    : hero,
              })
            }}
          />
          Comparar com o mesmo herói (somente heróis em comum)
        </label>
      </div>
      {commonOnly && (
        <p className="mt-2 text-xs text-stone-400">
          {commonHeroes.length
            ? 'Escolha um herói em comum no filtro acima. A seleção vale para os dois jogadores.'
            : 'Não há heróis em comum disponíveis nos dois históricos.'}
        </p>
      )}
    </>
  )
}
