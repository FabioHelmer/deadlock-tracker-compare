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

A escala é relativa ao par: `100 * A / (A + B)`; para mortes, `100 * B / (A + B)`. O outro jogador recebe o complemento. Empates e dois zeros recebem 50. Dados ausentes aparecem como N/D e ponto neutro no radar. Não é percentil ou avaliação absoluta de habilidade. Não ajusta por adversários, rank, função ou patch; as datas das amostras podem diferir. Amostras abaixo de 20 partidas recebem aviso.

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
