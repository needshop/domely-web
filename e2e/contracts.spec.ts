import { expect, type Page, test } from '@playwright/test'

const rows = (page: Page) => page.locator('tbody tr')

/** Sélectionne un locataire dans la liste avec recherche. */
async function pickTenant(page: Page, search: string, name: string) {
  const combo = page.getByRole('combobox', { name: 'Locataire' })
  await combo.fill(search)
  await page.getByRole('option', { name }).click()
}

test.describe('Contrats — liste', () => {
  test('affiche les baux en cours par défaut, paginés par 10', async ({ page }) => {
    await page.goto('/contracts')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contrats')
    await expect(page.getByText('61 résultats')).toBeVisible()
    await expect(rows(page)).toHaveCount(10)
    await expect(page.getByText('1–10 sur 61')).toBeVisible()
  })

  test('filtres de situation, nature et recherche', async ({ page }) => {
    await page.goto('/contracts?status=all')
    await expect(page.getByText('64 résultats')).toBeVisible()

    await page.goto('/contracts?status=terminated')
    await expect(page.getByText('2 résultats')).toBeVisible()

    await page.goto('/contracts?status=upcoming')
    await expect(page.getByText('1 résultat', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'BAIL-2026-0903' })).toBeVisible()

    await page.goto('/contracts?type=professional')
    await expect(page.getByText('4 résultats')).toBeVisible()

    await page.goto('/contracts')
    await page.getByRole('searchbox').fill('teranga')
    await expect(page.getByText('2 résultats')).toBeVisible()
  })
})

test.describe('Contrats — fiche', () => {
  test('contrat en cours : conditions, locataire et lot liés', async ({ page }) => {
    await page.goto('/contracts?q=teranga')
    await rows(page).first().getByRole('link').click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^BAIL-/)
    await expect(page.getByText('Bail professionnel').first()).toBeVisible()
    await expect(page.getByText('En cours', { exact: true })).toBeVisible()

    await page.getByRole('link', { name: /Teranga Digital SAS/ }).click()
    await expect(page).toHaveURL(/\/tenants\/c3$/)
  })

  test('contrat à venir et contrat résilié', async ({ page }) => {
    await page.goto('/contracts/l903')
    await expect(page.getByText('À venir', { exact: true })).toBeVisible()
    await expect(page.getByText(/Ce contrat débute le/)).toBeVisible()

    await page.goto('/contracts/l901')
    await expect(page.getByText('Résilié', { exact: true })).toBeVisible()
    await expect(page.getByText(/Contrat résilié le .* Congé donné par le locataire/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Modifier' })).toHaveCount(0)
  })

  test('contrat introuvable', async ({ page }) => {
    await page.goto('/contracts/inconnu')
    await expect(page.getByText('Ce contrat est introuvable.')).toBeVisible()
  })
})

test.describe('Contrats — création', () => {
  test('depuis un lot vacant : le lot passe en loué', async ({ page }) => {
    await page.goto('/properties/p3')
    await page.getByRole('link', { name: 'Créer un contrat pour Apt 18' }).click()
    await expect(page).toHaveURL(/\/contracts\/new\?property=p3&unit=apt-18/)

    // Bien, lot, loyer et dépôt pré-remplis depuis le lot
    await expect(page.getByLabel('Loyer mensuel')).not.toHaveValue('')
    await pickTenant(page, 'abdoulaye', 'Abdoulaye Yeo')

    // Bail démarrant aujourd'hui : le lot est loué immédiatement
    await page.getByRole('group', { name: 'Début du bail' }).getByRole('spinbutton').first().focus()
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    await page.keyboard.type(`${dd}${mm}${today.getFullYear()}`)

    await page.getByRole('button', { name: 'Créer le contrat' }).click()
    await expect(page).toHaveURL(/\/contracts\/l-/)
    await expect(page.getByText('Contrat créé')).toBeVisible()
    await expect(page.getByText('En cours', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      new RegExp(`^BAIL-${today.getFullYear()}-`),
    )

    await page.getByRole('link', { name: /Immeuble Bellevue/ }).click()
    await expect(page.getByRole('link', { name: 'Abdoulaye Yeo' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Créer un contrat pour Apt 18' })).toHaveCount(0)
  })

  test('refuse un lot déjà loué sur la période', async ({ page }) => {
    await page.goto('/contracts/new?property=p1&unit=apt-1')
    await pickTenant(page, 'awa d', 'Awa Diallo')
    await page.getByRole('button', { name: 'Créer le contrat' }).click()
    await expect(
      page.getByText(/Ce lot est déjà loué sur cette période \(BAIL-2025-0001/),
    ).toBeVisible()
  })

  test('champs obligatoires et lot dépendant du bien', async ({ page }) => {
    await page.goto('/contracts/new')
    await expect(page.getByText('Choisissez d’abord un bien.')).toBeVisible()
    await page.getByRole('button', { name: 'Créer le contrat' }).click()
    await expect(page.getByText('Le formulaire contient des erreurs')).toBeVisible()
    // locataire, bien, lot, loyer
    await expect(page.getByText('Ce champ est obligatoire.')).toHaveCount(4)
  })

  test('depuis la fiche locataire, le locataire est pré-sélectionné', async ({ page }) => {
    await page.goto('/tenants/f2')
    await page.getByRole('link', { name: 'Nouveau contrat' }).click()
    await expect(page).toHaveURL('/contracts/new?tenant=f2')
    await expect(page.getByRole('combobox', { name: 'Locataire' })).not.toHaveValue('')
  })
})

test.describe('Contrats — modification et résiliation', () => {
  test('modifie le loyer : la fiche du bien suit le contrat', async ({ page }) => {
    await page.goto('/contracts/l1/edit')
    await expect(
      page.getByText('Le locataire et le lot d’un contrat ne changent pas'),
    ).toBeVisible()
    await page.getByLabel('Loyer mensuel').fill('400000')
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page).toHaveURL('/contracts/l1')
    await expect(page.getByText('Modifications enregistrées')).toBeVisible()

    await page.getByRole('link', { name: /Résidence Les Oliviers/ }).click()
    await expect(page.getByRole('row', { name: /Apt 1 .*400 000/ })).toBeVisible()
  })

  test('résiliation immédiate : le lot redevient vacant', async ({ page }) => {
    await page.goto('/contracts/l1')
    await page.getByRole('button', { name: 'Résilier' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: /Motif/ }).click()
    await page.getByRole('option', { name: 'Accord amiable' }).click()
    await dialog.getByRole('button', { name: 'Résilier le contrat' }).click()

    await expect(page.getByText('Résiliation enregistrée')).toBeVisible()
    await expect(page.getByText('Résilié', { exact: true })).toBeVisible()
    await expect(page.getByRole('status')).toContainText('Accord amiable')

    // Navigation interne : les données en mémoire sont conservées
    await page.getByRole('link', { name: /Résidence Les Oliviers/ }).click()
    await expect(page.getByRole('link', { name: 'Créer un contrat pour Apt 1' })).toBeVisible()
  })
})
