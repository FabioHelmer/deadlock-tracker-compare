import ComparisonFilters from './ComparisonFilters.tsx'
import ComparisonResults from './ComparisonResults.tsx'
import { useComparison } from './useComparison.ts'
import { useShareLink } from './useShareLink.ts'
import ComparisonInsights from './ComparisonInsights.tsx'
import Favorites from '../favorites/Favorites.tsx'

import HeroVersus from './HeroVersus.tsx'
import PlayerSearch from '../player/PlayerSearch.tsx'
import type { PlayerData } from '../../domain/models.ts'

export default function Comparison({ player, account }: { player?: PlayerData; account: string }) {
  const comparison = useComparison(player, account)
  const {
    other,
    loading,
    error,
    filters,
    setFilters,
    compare,
    commonHeroes,
    heroes,
    options,
    activeHero,
    invalidPeriod,
    left,
    right,
    a,
    b,
    url,
  } = comparison
  const { mode, matchMode, from, to } = filters
  const n = comparison.size
  const names = [
    player?.profile?.personaname ?? '#' + account,
    other?.data.profile?.personaname ?? '#' + (other?.id ?? ''),
  ]
  const { share, link: shareLink, message: shareMessage } = useShareLink(url)
  return (
    <section className="mb-10 rounded-2xl border border-white/10 bg-[#191d18] p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs tracking-[.2em] text-lime-300">FRENTE A FRENTE</p>
          <h2 className="text-2xl font-semibold">Compare seu estilo de jogo</h2>
          <p className="mt-2 text-sm text-stone-400">
            Cinco atributos. A mesma régua para os dois jogadores.
          </p>
        </div>
        <PlayerSearch
          label="Buscar segundo jogador por nome da Steam ou ID"
          action="Comparar"
          disabled={loading}
          onSelect={(value) => {
            void compare(value)
          }}
        />
      </div>
      <ComparisonFilters
        filters={filters}
        setFilters={setFilters}
        options={options}
        heroes={heroes}
        commonHeroes={commonHeroes}
        activeHero={activeHero}
        invalidPeriod={invalidPeriod}
        ready={!!player && !!other}
      />
      <button
        onClick={() => void share()}
        className="mt-4 rounded border border-white/15 px-3 py-2 text-xs text-lime-200"
      >
        Compartilhar comparação ↗
      </button>
      {shareLink && (
        <div className="mt-3">
          <p role="status" className="mb-2 text-xs text-lime-200">
            {shareMessage}
          </p>
          <input
            aria-label="Link compartilhável"
            readOnly
            value={shareLink}
            onFocus={(e) => e.target.select()}
            className="w-full rounded border border-white/10 bg-black/20 p-2 text-xs"
          />
        </div>
      )}
      <Favorites
        current={other ? { id: other.id, name: names[1] } : undefined}
        onSelect={compare}
      />
      {!loading && player && other && (
        <div className="mt-4 text-xs leading-6 text-stone-400">
          <p>
            Consultado: {names[0]} em {new Date(player.queriedAt).toLocaleString('pt-BR')} ·{' '}
            {names[1]} em {new Date(other.data.queriedAt).toLocaleString('pt-BR')}
          </p>
          <p>
            Cache de perfis: até 5 minutos. Para renovar o segundo jogador, selecione-o novamente.
          </p>
        </div>
      )}
      {!loading && player && other && <HeroVersus left={player} right={other.data} names={names} />}
      {error && (
        <p role="alert" className="mt-5 text-sm text-red-200">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="empty mt-5">
          Carregando o segundo perfil…
        </p>
      )}
      {!loading && (!player || !other) && (
        <div className="empty mt-5">
          {!player
            ? 'Aguarde o carregamento do seu perfil para comparar.'
            : 'Busque o nome da Steam ou informe o ID de outro jogador para gerar o radar.'}
        </div>
      )}
      {!loading && player && other && (!a || !b) && (
        <div className="empty mt-5">Não há partidas suficientes para os filtros selecionados.</div>
      )}
      {!loading && a && b && other && <ComparisonResults a={a} b={b} n={n} names={names} />}
      {n > 0 && (
        <div className="mt-4 text-xs leading-6 text-stone-400">
          {[left, right].map((matches, i) => (
            <p key={i}>
              Amostra de {names[i]}:{' '}
              {new Date(matches[n - 1].start_time * 1000).toLocaleDateString('pt-BR', {
                timeZone: 'UTC',
              })}{' '}
              a{' '}
              {new Date(matches[0].start_time * 1000).toLocaleDateString('pt-BR', {
                timeZone: 'UTC',
              })}{' '}
              (UTC)
            </p>
          ))}
        </div>
      )}
      {player && other && !loading && (
        <ComparisonInsights
          left={player}
          right={other.data}
          names={names}
          a={a}
          b={b}
          mode={mode}
          hero={activeHero ?? 'all'}
          period={{ from, to, matchMode }}
          sampleAvailable={!invalidPeriod && activeHero !== null}
        />
      )}
      <details className="mt-6 border-t border-white/10 pt-5 text-sm text-stone-400">
        <summary className="cursor-pointer text-stone-200">Como funciona a metodologia?</summary>
        <div className="mt-4 space-y-3 leading-6">
          <p>
            1. Aplicamos os mesmos filtros de modo e herói. Usamos até a janela escolhida de
            partidas recentes e reduzimos ambos ao menor número disponível. Partidas sem duração
            válida são excluídas. As datas podem diferir entre os jogadores.
          </p>
          <p>
            2. Somamos cada atributo e dividimos pela soma dos minutos. Isso reduz a influência de
            partidas mais longas e evita comparar apenas totais. Farm usa last hits; economia usa
            patrimônio final por minuto.
          </p>
          <p>
            3. Radar relativo: 100 × A / (A + B). Para mortes por minuto, invertemos: 100 × B / (A +
            B). O segundo jogador recebe o complemento. Empate ou dois valores zero = 50. Dados
            ausentes ficam sem ponto, com eixo tracejado no radar e N/D na tabela.
          </p>
          <p>
            4. Os pontos não são percentis, rank ou uma nota absoluta de habilidade. Não usamos uma
            nota geral: apoio, combate e sobrevivência descrevem estilos diferentes. Vitória depende
            da equipe e não compõe o radar. O histórico da API pode estar incompleto.
          </p>
        </div>
      </details>
    </section>
  )
}
