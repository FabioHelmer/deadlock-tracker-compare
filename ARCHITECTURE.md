# Arquitetura

O projeto é um frontend estático. As funcionalidades continuam compatíveis com GitHub Pages.

```text
src/
  app/                      composição das páginas e jogador ativo
  domain/                   modelos, filtros, agrupamentos e métricas puras
  services/
    deadlock/               HTTP, parsers de dados externos e consultas
    cache.ts                cache em memória com expiração
  features/
    player/                 busca, painel, progresso e usePlayer
    comparison/             comparação, filtros, URL, radar e resultados
    favorites/              armazenamento, hook e interface dos favoritos
```

## Direção das dependências

- `domain` importa apenas outros módulos do domínio. Não usa React, rede ou armazenamento do navegador.
- `services/deadlock` conhece o contrato externo e entrega modelos normalizados do domínio.
- Hooks das funcionalidades coordenam efeitos e estado. Componentes visuais recebem dados e callbacks.
- `app` mantém a seleção do jogador e compõe as funcionalidades. O jogador ativo tem uma única fonte de estado; o perfil lembrado é uma preferência independente.

## Fluxo de dados

`fetch → unknown → parser específico → modelo normalizado → cache → usePlayer → componentes`

Os parsers retornam os tipos concretos: não há promessa de um tipo genérico desvinculada da validação. Campos numéricos opcionais ausentes são normalizados como `null`. Metadados desconhecidos são ignorados; campos conhecidos inválidos produzem erro. Histórico inválido não entra no cache. Falhas de perfil ou catálogo têm fallback independente.

`usePlayer` controla estados idle/loading/success/error e cancela a requisição anterior ao trocar de jogador ou atualizar. `refetch` ignora o cache apenas naquela consulta. A resposta cancelada não pode substituir o estado atual. O catálogo mantém seu próprio TTL.

`useComparisonLocation` centraliza a leitura, serialização e histórico da URL. Alterações de filtros são entradas no histórico; voltar e avançar restauram os filtros. O link exibido para compartilhamento deriva do estado atual e não é uma cópia desatualizada.

`useComparison` coordena o adversário e usa `buildComparison`, uma função pura, para produzir amostras de mesmo tamanho e métricas. Sem um herói válido em comum ou com período invertido, a comparação não inventa um substituto nem utiliza datas sentinela.

## Métricas e agrupamento

As métricas são um objeto `PlayerMetrics` com propriedades nomeadas. O catálogo `attributes` aponta para essas propriedades e concentra rótulo, unidade, direção de melhoria e explicação. A apresentação pode mudar de ordem sem trocar os valores dos atributos.

O agrupamento de heróis é único em `domain/heroes.ts`. Empates usam a partida mais recente e, por fim, o ID, sem depender da ordem da resposta externa.

## Estado persistente

- Perfil lembrado: `tracker-player`, validado antes de usar.
- Favoritos: `tracker-favorites`, acessados por um adaptador e `useFavorites`, sincronizados com `useSyncExternalStore`.
- Account ID: validação e normalização centralizadas no domínio.
- Filtros e adversário: URL. Falhas de armazenamento não impedem o uso da aplicação.

## Verificação

```sh
npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e
```

Os testes cobrem fronteiras do domínio, normalização, falhas parciais, cache, atualização forçada, cancelamento, troca rápida de jogador, favoritos e restauração de filtros por link e histórico. Os testes de navegador usam respostas controladas; disponibilidade e CORS da API real precisam ser verificados no domínio publicado.
