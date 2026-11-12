import { expect, type Page, test } from '@playwright/test'

const nav = (page: Page) => page.getByRole('navigation', { name: 'Navigation principale' })
// Dans le contenu de la page (les toasts sont aussi des éléments de liste)
const members = (page: Page) => page.getByRole('main').getByRole('listitem')
const member = (page: Page, name: string) => members(page).filter({ hasText: name })

async function signOut(page: Page, name: string) {
  await page.getByRole('button', { name: `Mon compte (${name})` }).click()
  await page.getByRole('menuitem', { name: 'Se déconnecter' }).click()
  await expect(page).toHaveURL('/login')
}

async function signIn(page: Page, identifier: string, password: string) {
  await page.getByLabel('Identifiant', { exact: true }).fill(identifier)
  await page.getByLabel('Mot de passe', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
}

/** Action d'un membre, avec confirmation pour les actions sensibles. */
async function memberAction(page: Page, name: string, action: string, confirm = false) {
  await page.getByRole('button', { name: `Actions pour ${name}` }).click()
  await page.getByRole('menuitem', { name: action }).click()
  if (confirm) await page.getByRole('dialog').getByRole('button', { name: action }).click()
}

test.describe('Workspace — compte propriétaire', () => {
  test('réservé aux admins d’agence', async ({ page }) => {
    await page.goto('/')
    await expect(nav(page).getByRole('link', { name: 'Biens' })).toBeVisible()
    await expect(nav(page).getByRole('link', { name: 'Workspace' })).toHaveCount(0)
    await page.goto('/workspace')
    await expect(page).toHaveURL('/')
  })
})

test.describe('Workspace — admin d’agence', () => {
  test.use({ storageState: 'e2e/fixtures/agency-auth-state.json' })

  test('membres de l’agence et rôles', async ({ page }) => {
    await page.goto('/')
    await nav(page).getByRole('link', { name: 'Workspace' }).click()
    await expect(page).toHaveURL('/workspace')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Workspace')

    await expect(member(page, 'Aminata Sow')).toContainText('(vous)')
    await expect(member(page, 'Aminata Sow')).toContainText(
      'Administrateur d’agence · Gestionnaire',
    )
    await expect(member(page, 'Ibrahima Fall')).toContainText('Actif')
    await expect(member(page, 'Mariam Koné')).toContainText('Désactivé')
    await expect(member(page, 'Yao Mensah')).toContainText('Invité')
    // Pas d'action sur son propre compte
    await expect(page.getByRole('button', { name: 'Actions pour Aminata Sow' })).toHaveCount(0)
  })

  test('invite un gestionnaire qui crée son compte et accède aux bailleurs', async ({ page }) => {
    await page.goto('/workspace')
    await page.getByRole('button', { name: 'Inviter un gestionnaire' }).click()
    const dialog = page.getByRole('dialog')

    // E-mail déjà utilisé par un compte
    await dialog.getByLabel('Nom', { exact: true }).fill('Ndiaye')
    await dialog.getByLabel('Prénom').fill('Khady')
    await dialog.getByLabel('E-mail').fill('ibrahima.fall@example.com')
    await dialog.getByRole('textbox', { name: 'Téléphone' }).fill('77 600 99 88')
    await dialog.getByRole('button', { name: 'Envoyer l’invitation' }).click()
    await expect(dialog.getByText('Un compte existe déjà avec cette adresse e-mail.')).toBeVisible()

    await dialog.getByLabel('E-mail').fill('khady.ndiaye@example.com')
    await dialog.getByRole('button', { name: 'Envoyer l’invitation' }).click()
    await expect(page.getByRole('heading', { name: 'Invitation envoyée' })).toBeVisible()
    const link = new URL((await page.getByTestId('invitation-link').textContent()) ?? '')
    await page.getByRole('button', { name: 'Terminé' }).click()
    await expect(member(page, 'Khady Ndiaye')).toContainText('Invité')

    // Le lien ouvert en étant connecté : il faut d'abord se déconnecter
    await page.goto(link.pathname + link.search)
    await expect(page.getByText('Vous êtes déjà connecté')).toBeVisible()
    await page.getByRole('button', { name: 'Se déconnecter' }).click()

    await expect(page.getByRole('heading', { name: 'Rejoindre Teranga Immobilier' })).toBeVisible()
    await expect(page.getByText('Aminata Sow vous invite')).toBeVisible()
    await page.getByLabel('Mot de passe', { exact: true }).fill('Khady2026')
    await page.getByLabel('Confirmer le mot de passe').fill('Khady2026')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await page.getByLabel('Code de vérification (6 chiffres)').fill('123456')

    await expect(page.getByRole('heading', { name: 'Bienvenue, Khady !' })).toBeVisible()
    await page.getByRole('link', { name: 'Se connecter' }).click()
    await page.getByLabel('Mot de passe', { exact: true }).fill('Khady2026')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page).toHaveURL('/')

    // Gestionnaire de l'agence : bailleurs oui, workspace non
    await expect(nav(page).getByRole('link', { name: 'Bailleurs' })).toBeVisible()
    await expect(nav(page).getByRole('link', { name: 'Workspace' })).toHaveCount(0)
    await expect(page.getByRole('banner').getByText('Teranga Immobilier')).toBeVisible()

    // Le lien ne sert qu'une fois
    await signOut(page, 'Khady Ndiaye')
    await page.goto(link.pathname + link.search)
    await expect(
      page.getByRole('heading', { name: 'Invitation expirée ou invalide' }),
    ).toBeVisible()
  })

  test('désactive puis réactive un gestionnaire', async ({ page }) => {
    await page.goto('/workspace')
    await memberAction(page, 'Ibrahima Fall', 'Désactiver le compte', true)
    await expect(page.getByText('Compte de Ibrahima Fall désactivé')).toBeVisible()
    await expect(member(page, 'Ibrahima Fall')).toContainText('Désactivé')

    // Le gestionnaire ne peut plus se connecter
    await signOut(page, 'Aminata Sow')
    await signIn(page, 'GST5M3Q', 'Domely2026')
    await expect(
      page.getByText('Ce compte a été désactivé par l’administrateur de votre agence.'),
    ).toBeVisible()

    await signIn(page, 'AGT8R2K', 'Domely2026')
    await expect(page).toHaveURL('/')
    await page.goto('/workspace')
    await memberAction(page, 'Ibrahima Fall', 'Réactiver le compte')
    await expect(member(page, 'Ibrahima Fall')).toContainText('Actif')
  })

  test('annule une invitation : le lien n’est plus valable', async ({ page }) => {
    await page.goto('/workspace')
    await memberAction(page, 'Yao Mensah', 'Annuler l’invitation', true)
    await expect(page.getByText('Invitation de Yao Mensah annulée')).toBeVisible()
    await expect(member(page, 'Yao Mensah')).toHaveCount(0)

    await signOut(page, 'Aminata Sow')
    await page.goto('/invitation?token=demo-invitation-yao')
    await expect(
      page.getByRole('heading', { name: 'Invitation expirée ou invalide' }),
    ).toBeVisible()
  })
})
