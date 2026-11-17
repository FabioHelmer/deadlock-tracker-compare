import { test, expect, type Page } from '@playwright/test'
const browserErrors = new WeakMap<Page, string[]>()
async function mock(page: Page) {
  await page.route('https://api.deadlock-api.com/**', (route) => {
    const url = new URL(route.request().url())
    let data: unknown = []
    if (url.pathname.endsWith('match-history'))
      data = Array.from({ length: 30 }, (_, i) => ({
        match_id: i + 1,
        hero_id: 1,
        start_time: Date.parse('2026-11-17T12:00:00Z') / 1000 - i * 86400,
        player_team: url.pathname.includes('/456/') ? 1 : 0,
        match_result: i % 2,
        player_kills: i + 1,
        player_deaths: 3,
        player_assists: 8,
        net_worth: 15000,
        match_duration_s: 1800,
        last_hits: url.pathname.includes('/456/') ? null : 100,
        game_mode: 1,
        match_mode: i % 2 ? 1 : 4,
      }))
    else if (url.pathname.includes('/assets/')) data = [{ id: 1, name: 'Haze' }]
    else if (url.pathname.endsWith('steam-search'))
      data = [{ account_id: 123, personaname: 'MeuJogador' }]
    else if (url.pathname.endsWith('/steam'))
      data = [
        {
          personaname: url.searchParams.get('account_ids') === '456' ? 'Adversario' : 'MeuJogador',
        },
      ]
    return route.fulfill({ json: data })
  })
}
test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  browserErrors.set(page, errors)
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (/Encountered two children|Invalid hook/.test(message.text())) errors.push(message.text())
  })
  await mock(page)
})
test('home selects and remembers identity, then allows switching', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: /Como você se chama/ })).toBeVisible()
  await page.getByRole('textbox', { name: 'Seu nome na Steam' }).fill('MeuJogador')
  await page.getByRole('button', { name: 'Encontrar', exact: true }).click()
  await page.getByRole('button', { name: /MeuJogador.*Selecionar/ }).click()
  await expect(page.getByRole('heading', { name: 'Visão do jogador.' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tracker-player') || '{}').id))
    .toBe('123')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Visão do jogador.' })).toBeVisible()
  await page.getByRole('button', { name: 'Trocar meu perfil' }).click()
  await expect(page.getByRole('heading', { name: /Como você se chama/ })).toBeVisible()
})
test('comparison filters, radar, favorites and shared links work together', async ({ page }) => {
  await page.goto('./?player=123&opponent=456')
  await expect(page.getByRole('heading', { name: 'Resumo do confronto' })).toBeVisible()
  await page.getByRole('combobox', { name: 'Tipo de partida' }).selectOption('4')
  await page.getByLabel('Data inicial').fill('2026-11-01')
  await page.getByLabel('Data final').fill('2026-11-17')
  await expect(page).toHaveURL(/matchMode=4/)
  await page.getByRole('button', { name: 'Ver atributo Farm', exact: true }).click()
  await expect(page.getByText('Eixos sem dados estão tracejados', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: '☆ Salvar perfil atual' }).last().click()
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('tracker-favorites') || '[]').length),
    )
    .toBe(1)
  await page.getByRole('button', { name: 'Compartilhar comparação' }).click()
  const link = await page.getByRole('textbox', { name: 'Link compartilhável' }).inputValue()
  expect(link).toContain('from=2026-11-01')
  await page.goto(link)
  await expect(page.getByRole('combobox', { name: 'Tipo de partida' })).toHaveValue('4')
  await expect(page.getByLabel('Data inicial')).toHaveValue('2026-11-01')
  await expect(page.getByRole('heading', { name: 'Partidas em comum' })).toBeVisible()
})
for (const width of [360, 390, 768, 1440])
  test(`layout fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./?player=123&opponent=456')
    await expect(page.getByRole('heading', { name: 'Resumo do confronto' })).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await page.screenshot({
      path: `test-results/layout-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    })
  })
test('invalid history is rejected without producing misleading statistics', async ({ page }) => {
  await page.route('**/v1/players/123/match-history', (route) =>
    route.fulfill({ json: [{ player_kills: 'bad' }] }),
  )
  await page.goto('./?player=123')
  await expect(page.getByRole('alert')).toContainText('campos inválidos')
})

test('refresh does not disable cache when switching profiles', async ({ page }) => {
  let calls = 0
  await page.route('**/v1/players/123/match-history', async (route) => {
    calls++
    await route.fallback()
  })
  await page.goto('./?player=123')
  await expect(page.getByRole('heading', { name: 'MeuJogador', exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Atualizar', exact: true }).click()
  await expect.poll(() => calls).toBe(2)
  await expect(page.getByRole('button', { name: 'Atualizar', exact: true })).toBeEnabled()
  const search = page.getByRole('textbox', { name: 'Buscar seu perfil por nome da Steam ou ID' })
  await search.fill('789')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await expect(page.getByText('789', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atualizar', exact: true })).toBeEnabled()
  await search.fill('123')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await expect(page.getByText('123', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atualizar', exact: true })).toBeEnabled()
  expect(calls).toBe(2)
})
test('back navigation restores filters and sharing always reflects current filters', async ({
  page,
}) => {
  await page.goto('./?player=123&opponent=456')
  await expect(page.getByRole('heading', { name: 'Resumo do confronto' })).toBeVisible()
  const type = page.getByRole('combobox', { name: 'Tipo de partida' })
  await type.selectOption('4')
  await page.getByRole('button', { name: 'Compartilhar comparação' }).click()
  const link = page.getByRole('textbox', { name: 'Link compartilhável' })
  await expect(link).toHaveValue(/matchMode=4/)
  await type.selectOption('1')
  await expect(link).toHaveValue(/matchMode=1/)
  await page.goBack()
  await expect(type).toHaveValue('4')
  await expect(link).toHaveValue(/matchMode=4/)
})
test('late response from an older player cannot replace the selected profile', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  let arrived!: () => void
  const started = new Promise<void>((resolve) => {
    arrived = resolve
  })
  await page.route('**/v1/players/123/match-history', async (route) => {
    arrived()
    await gate
    await route.fallback().catch(() => {})
  })
  await page.goto('./?player=123')
  await started
  await page.getByRole('textbox', { name: 'Buscar seu perfil por nome da Steam ou ID' }).fill('789')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await expect(page.getByText('789', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atualizar', exact: true })).toBeEnabled()
  release()
  await expect(page.getByText('789', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(/player=789/)
})

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([])
})

test('back navigation between players restores the previous identity', async ({ page }) => {
  await page.goto('./?player=123')
  await expect(page.getByRole('button', { name: 'Atualizar', exact: true })).toBeEnabled()
  await page.getByRole('textbox', { name: 'Buscar seu perfil por nome da Steam ou ID' }).fill('789')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await expect(page.getByText('789', { exact: true })).toBeVisible()
  await page.goBack()
  await expect(page.getByText('123', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(/player=123/)
})
