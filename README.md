# Tracker Compare

Painel de perfil Deadlock em React, TypeScript, Tailwind CSS e Vite.

## Executar

```sh
npm install
npm run dev
```

## Verificar

```sh
npm run build
npm run lint
```

## API

Consultas públicas a `https://api.deadlock-api.com`: histórico de partidas, dados Steam e nomes de heróis. Nenhuma chave é necessária. Opcionalmente configure `VITE_API_URL` em `.env.local` para usar outro endereço compatível.

As métricas são calculadas sobre o histórico retornado, que pode estar incompleto. O painel apresenta falhas, timeout e resultados vazios sem inventar estatísticas. Detalhes de Steam e heróis têm fallback independente.

Documentação: https://api.deadlock-api.com/docs

## Comparação de jogadores

Informe um segundo Account ID na seção Frente a frente. O radar SVG responsivo compara combate (abates/min), apoio (assistências/min), sobrevivência (mortes/min, invertido), economia (patrimônio final/min) e farm (last hits/min).

Ambos usam a mesma quantidade de partidas recentes após os filtros, limitada pela menor amostra disponível. As taxas são razões entre totais e minutos totais. A janela pode ser de 10, 20, 50 ou 100 partidas, com filtros de modo e herói.

A escala é relativa ao par: `100 * A / (A + B)`; para mortes, `100 * B / (A + B)`. O outro jogador recebe o complemento. Empates e dois zeros recebem 50. Dados ausentes aparecem como N/D na tabela e eixos tracejados sem ponto no radar. Não é percentil ou avaliação absoluta de habilidade. Não ajusta por adversários, rank, função ou patch; as datas das amostras podem diferir. Amostras abaixo de 20 partidas recebem aviso.

Testes das fórmulas e filtros (Node 24):

```sh
node --experimental-strip-types --test tests/comparison.test.mjs
```

## Novos recursos

- Mesmo herói: restringe a seleção aos heróis presentes nos dois históricos e aplica o mesmo herói ao radar e à evolução.
- Evolução: últimas 10 partidas versus 10 anteriores, por atributo, com os mesmos filtros. Exige 20 partidas válidas e usa taxas ponderadas pelo tempo.
- Resumo: indica vantagens por atributo na mesma amostra do radar, mantendo dados ausentes como indisponíveis. Apoio usa assistências/min, sem estimar participação percentual em abates da equipe.
- Partidas em comum: cruza IDs dos dois históricos, distingue companheiros e adversários e apresenta resultados com links para as partidas. Independe dos filtros do radar.
- Compartilhar: salva jogadores, modo, herói e janela na URL; o link carrega a comparação automaticamente. Os dados são consultados novamente ao abrir. O endereço precisa estar acessível ao destinatário (localhost só funciona na máquina local).
- Favoritos: adição, remoção e consulta dos perfis salvos em localStorage; sincronizados entre as seções e abas. Permanecem no navegador em que foram salvos.

Todos os testes de cálculos e URLs:

```sh
node --experimental-strip-types --test tests/*.test.mjs
```

## Home e perfil lembrado

Na primeira visita, a home pede o nome da Steam e oferece a escolha do perfil nos resultados da busca (também aceita Account ID). A seleção salva `{ id, name }` na chave `tracker-player` do localStorage. Visitas seguintes abrem automaticamente o perfil lembrado.

O botão "Trocar meu perfil" volta à home para escolher outra pessoa. Links compartilhados têm prioridade na visita e não substituem o perfil salvo. Se o armazenamento estiver bloqueado, o painel continua funcionando e avisa que o perfil não será lembrado. Armazenamento inválido é ignorado.
"# deadlock-tracker-compare"

## Publicar no GitHub Pages

O projeto está configurado para https://fabiohelmer.github.io/deadlock-tracker-compare/.

1. No repositório, abra Settings → Pages → Build and deployment → Source e selecione GitHub Actions.
2. Envie os arquivos e o package-lock.json para a branch main.
3. Acompanhe o workflow Deploy to GitHub Pages na aba Actions. Ele instala dependências, executa lint e testes, gera dist e publica o site. Também é possível executá-lo manualmente.

Não é necessário enviar node_modules ou dist. O base do Vite está definido como /deadlock-tracker-compare/. Se renomear o repositório ou usar domínio próprio, ajuste esse valor.

A API é acessada diretamente pelo navegador e deve ser validada no endereço publicado. Não há backend ou segredo necessário para o deploy.

## Cache e período da comparação

As respostas de perfil e histórico ficam em cache em memória por 5 minutos; o catálogo de heróis, por 1 hora. O cache é limitado a 100 entradas, não persiste após recarregar a página e não guarda falhas. Atualizar o perfil ou selecionar novamente o adversário renova suas consultas, preservando o cache do catálogo.

Os campos De/Até filtram partidas antes de selecionar a janela recente e igualar as amostras. Datas usam UTC, incluindo o dia final inteiro. Períodos invertidos não produzem comparação. Radar, resumo e evolução usam o período escolhido; heróis mais jogados e partidas em comum continuam usando o histórico completo, como indicado no painel. O link compartilhável inclui as datas. A comparação mostra datas reais das amostras e horário de consulta dos históricos, que não é o horário de atualização da fonte original.

## Qualidade, gráficos e modos de partida

O radar foi separado em `src/features/comparison/Radar.tsx`, o gráfico de evolução em `src/features/player/ProgressChart.tsx` e o painel em `src/features/player/Dashboard.tsx`. O radar permite selecionar atributos com mouse, toque ou teclado e mostra valores por jogador. Eixos com dados ausentes ficam tracejados, sem pontos; a área preenchida é removida quando a comparação está incompleta.

A evolução mostra até 30 partidas em ordem cronológica, com seleção de atributo e pontos interativos. Cada ponto usa os valores daquela partida por minuto, sem suavização; dados ausentes interrompem a linha. O resumo continua comparando duas janelas de 10 partidas.

O filtro Tipo de partida diferencia casual (`match_mode=1`) de ranqueada (`match_mode=4`), é aplicado ao radar, resumo e evolução e acompanha o link compartilhado. Referência dos códigos: https://github.com/SteamDatabase/Protobufs/blob/master/deadlock/citadel_gcmessages_common.proto. Tipos ausentes não são classificados como casual ou ranqueado.

Respostas externas são verificadas antes de entrar no cache: formato da lista, campos numéricos finitos e não negativos, times válidos, nomes e URLs de imagem. Dados inválidos de histórico impedem o cálculo; falhas de catálogo e perfil continuam com fallback independente.

## Testes no navegador

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

Os testes Playwright usam respostas controladas da API para validar home, persistência, troca de perfil, comparação, filtros, radar sem dados, favoritos, reabertura de link e rejeição de dados inválidos. Verificam ausência de rolagem horizontal em 360, 390, 768 e 1440 pixels e geram capturas em `test-results` (ignorado pelo Git). Isso não substitui a verificação de disponibilidade e CORS da API publicada. O workflow de Pages executa os testes de navegador antes do deploy.

## Arquitetura e manutenção

Consulte [ARCHITECTURE.md](ARCHITECTURE.md) para camadas, fluxo de dados e responsabilidades. O TypeScript usa modo estrito. `npm run format` aplica a formatação do Prettier e `npm run format:check` verifica o padrão sem alterar os arquivos; o workflow executa essa checagem antes dos demais testes.
