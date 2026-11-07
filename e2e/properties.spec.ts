import { expect, test } from '@playwright/test'

test.describe('Biens — liste', () => {
  test('affiche les biens et leurs indicateurs', async ({ page }) => {
    await page.goto('/properties')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biens')
    await expect(page.getByText('11 résultats')).toBeVisible()
    await expect(page.getByRole('link', { name: /Résidence Les Oliviers/ })).toBeVisible()
  })

  test('recherche insensible aux accents et filtres dans l’URL', async ({ page }) => {
    await page.goto('/properties')
    await page.getByRole('searchbox').fill('cote d’ivoire')
    await expect(page.getByText('3 résultats')).toBeVisible()
    await expect(page).toHaveURL(/q=cote/)

    await page.reload()
    await expect(page.getByRole('searchbox')).toHaveValue('cote d’ivoire')
    await expect(page.getByText('3 résultats')).toBeVisible()

    await page.getByRole('button', { name: 'Réinitialiser les filtres' }).first().click()
    await expect(page.getByText('11 résultats')).toBeVisible()
  })

  test('filtre par type et occupation', async ({ page }) => {
    await page.goto('/properties?type=house')
    await expect(page.getByText('3 résultats')).toBeVisible()

    // Biens avec au moins un lot vacant : Bellevue, Baobab, Galerie Étoile, Villa Teranga
    await page.goto('/properties?type=apartment')
    await expect(page.getByText('1 résultat', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /Appartement Corniche/ })).toBeVisible()

    await page.goto('/properties?occupancy=vacant')
    await expect(page.getByText('4 résultats')).toBeVisible()
  })

  test('état vide quand aucun bien ne correspond', async ({ page }) => {
    await page.goto('/properties?q=introuvable')
    await expect(page.getByText('Aucun bien ne correspond à votre recherche')).toBeVisible()
  })

  test('bascule en vue tableau et mémorise le choix', async ({ page }) => {
    await page.goto('/properties')
    await page.getByRole('radio', { name: 'Vue tableau' }).click()
    await expect(page.getByRole('table')).toBeVisible()
    await page.reload()
    await expect(page.getByRole('table')).toBeVisible()
  })
})

test.describe('Biens — pagination', () => {
  const cards = (page: import('@playwright/test').Page) =>
    page.getByRole('link', { name: /^Voir la fiche de/ })

  test('9 biens par page, page 2 via la pagination', async ({ page }) => {
    await page.goto('/properties')
    await expect(cards(page)).toHaveCount(9)
    await expect(page.getByText('1–9 sur 11')).toBeVisible()

    await page.getByRole('button', { name: 'Page 2' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(cards(page)).toHaveCount(2)
    await expect(page.getByText('10–11 sur 11')).toBeVisible()

    await page.getByRole('button', { name: 'Précédent' }).click()
    await expect(cards(page)).toHaveCount(9)
  })

  test('un changement de filtre ramène à la page 1', async ({ page }) => {
    await page.goto('/properties?page=2')
    await expect(cards(page)).toHaveCount(2)
    // Dakar : Les Oliviers, Baobab, Appartement Corniche
    await page.getByRole('searchbox').fill('Dakar')
    await expect(page).not.toHaveURL(/page=/)
    await expect(cards(page)).toHaveCount(3)
  })

  test('pas de pagination quand tout tient sur une page', async ({ page }) => {
    await page.goto('/properties?type=house')
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toHaveCount(0)
  })

  test('une page hors limites affiche la dernière page', async ({ page }) => {
    await page.goto('/properties?page=99')
    await expect(cards(page)).toHaveCount(2)
  })
})

test.describe('Biens — fiche', () => {
  test('ouvre la fiche depuis la liste', async ({ page }) => {
    await page.goto('/properties')
    await page.getByRole('link', { name: /Immeuble Bellevue/ }).click()
    await expect(page).toHaveURL('/properties/p3')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Immeuble Bellevue')
    // 24 lots dont 1 vacant et 1 en travaux
    await expect(page.getByRole('tab', { name: /Lots/ })).toContainText('24')
    await expect(page.getByRole('row')).toHaveCount(25)
  })

  test('onglet Informations', async ({ page }) => {
    await page.goto('/properties/p1')
    await page.getByRole('tab', { name: 'Informations' }).click()
    const panel = page.getByRole('tabpanel')
    await expect(panel.getByText('Route des Almadies')).toBeVisible()
    await expect(panel.getByText(/Résidence sécurisée/)).toBeVisible()
  })

  test('fil d’Ariane et bien introuvable', async ({ page }) => {
    await page.goto('/properties/p2')
    await page.getByRole('link', { name: 'Biens' }).last().click()
    await expect(page).toHaveURL('/properties')

    await page.goto('/properties/inconnu')
    await expect(page.getByText('Ce bien est introuvable.')).toBeVisible()
  })

  test('les biens récents du tableau de bord mènent à la fiche', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Résidence Les Oliviers/ }).click()
    await expect(page).toHaveURL('/properties/p1')
  })
})
