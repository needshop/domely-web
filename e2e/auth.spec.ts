import { expect, type Page, test } from '@playwright/test'

// Ces tests partent sans session (les autres fichiers démarrent connectés au compte de démo)
test.use({ storageState: { cookies: [], origins: [] } })

const DEMO = { identifier: 'DMY4K7P', password: 'Domely2026' }

const password = (page: Page) => page.getByLabel('Mot de passe', { exact: true })
const otp = (page: Page) => page.getByLabel('Code de vérification (6 chiffres)')

async function login(page: Page, identifier: string, pwd: string) {
  await page.getByLabel('Identifiant', { exact: true }).fill(identifier)
  await password(page).fill(pwd)
  await page.getByRole('button', { name: 'Se connecter' }).click()
}

async function fillDetails(page: Page, email: string, phone: string) {
  await page.getByLabel('Nom', { exact: true }).fill('Ndiaye')
  await page.getByLabel('Prénom').fill('Fatou')
  await page.getByLabel('E-mail').fill(email)
  await page.getByRole('textbox', { name: 'Téléphone' }).fill(phone)
  await password(page).fill('Secret123')
}

test.describe('Authentification', () => {
  test('une page protégée redirige vers la connexion, puis y revient', async ({ page }) => {
    await page.goto('/tenants')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Connexion')
    await login(page, DEMO.identifier, DEMO.password)
    await expect(page).toHaveURL('/tenants')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Locataires')
  })

  test('identifiants invalides', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Identifiant', { exact: true }).fill('abc')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByText('L’identifiant compte 7 lettres et chiffres.')).toBeVisible()

    // Saisie en minuscules : convertie en majuscules
    await login(page, 'dmy4k7p', 'mauvais')
    await expect(page.getByLabel('Identifiant', { exact: true })).toHaveValue('DMY4K7P')
    await expect(page.getByRole('alert')).toHaveText('Identifiant ou mot de passe incorrect.')
    await expect(page).toHaveURL('/login')
  })

  test('mémorise l’identifiant et déconnecte depuis le menu du compte', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Identifiant', { exact: true }).fill(DEMO.identifier)
    await password(page).fill(DEMO.password)
    await page.getByText('Mémoriser mon identifiant').click()
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page).toHaveURL('/')

    await page.getByRole('button', { name: 'Mon compte (Moussa Diop)' }).click()
    await page.getByRole('menuitem', { name: 'Se déconnecter' }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByLabel('Identifiant', { exact: true })).toHaveValue(DEMO.identifier)
    await expect(page.getByRole('switch', { name: 'Mémoriser mon identifiant' })).toBeChecked()

    // Déconnecté : l'application n'est plus accessible
    await page.goto('/properties')
    await expect(page).toHaveURL('/login')
  })

  test('un compte professionnel affiche le nom de l’agence dans l’en-tête', async ({ page }) => {
    const header = page.getByRole('banner')
    await page.goto('/login')
    await login(page, 'AGT8R2K', DEMO.password)
    await expect(page).toHaveURL('/')
    await expect(header.getByText('Teranga Immobilier')).toBeVisible()
    await expect(header.getByText('Agence immobilière')).toBeVisible()

    // Mobile : le nom est dans le menu, entre le logo et la navigation
    await page.setViewportSize({ width: 375, height: 812 })
    await expect(header.getByText('Teranga Immobilier')).toBeHidden()
    await page.getByRole('button', { name: 'Afficher le menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation principale' })
    await expect(drawer.getByText('Teranga Immobilier')).toBeVisible()
    await drawer.getByRole('button', { name: 'Masquer le menu' }).click()
    await page.setViewportSize({ width: 1280, height: 720 })

    // Compte propriétaire : pas de nom d'agence
    await page.getByRole('button', { name: 'Mon compte (Aminata Sow)' }).click()
    await page.getByRole('menuitem', { name: 'Se déconnecter' }).click()
    await login(page, DEMO.identifier, DEMO.password)
    await expect(page).toHaveURL('/')
    await expect(header.getByText('Teranga Immobilier')).toHaveCount(0)
  })

  test('liens d’aide vers les pages de récupération', async ({ page }) => {
    await page.goto('/login')
    const help = page.getByRole('navigation', { name: 'Aide à la connexion' })
    await help.getByRole('link', { name: 'Mot de passe oublié ?' }).click()
    await expect(page).toHaveURL('/forgot-password')
    await page.getByRole('link', { name: 'Retour à la connexion' }).click()
    await help.getByRole('link', { name: 'Identifiant oublié ?' }).click()
    await expect(page).toHaveURL('/forgot-identifier')
  })

  test('création d’un compte propriétaire avec vérification OTP', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Créer un compte' }).click()
    await expect(page).toHaveURL('/signup')

    // Profil obligatoire
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(page.getByText('Choisissez votre profil pour continuer.')).toBeVisible()
    await page.getByText('Propriétaire gestionnaire').click()
    await page.getByRole('button', { name: 'Continuer' }).click()

    // Les champs professionnels ne sont pas demandés
    await expect(page.getByText('Étape 2 sur 3')).toBeVisible()
    await expect(page.getByLabel('Nom de l’agence')).toHaveCount(0)
    await fillDetails(page, 'fatou@example.com', '77 600 11 22')
    await page.getByRole('button', { name: 'Continuer' }).click()

    await expect(page.getByText('Étape 3 sur 3')).toBeVisible()
    await expect(page.getByText('+221 •••••••22')).toBeVisible()
    await otp(page).fill('000000')
    await expect(page.getByText('Code incorrect. Vérifiez le SMS reçu et réessayez.')).toBeVisible()
    await otp(page).fill('123456')

    await expect(page.getByRole('heading', { name: 'Bienvenue, Fatou !' })).toBeVisible()
    const identifier = (await page.getByTestId('identifier').textContent()) ?? ''
    expect(identifier).toMatch(/^[A-Z0-9]{7}$/)

    // Connexion avec l'identifiant pré-rempli
    await page.getByRole('link', { name: 'Se connecter' }).click()
    await expect(page.getByLabel('Identifiant', { exact: true })).toHaveValue(identifier)
    await password(page).fill('Secret123')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page).toHaveURL('/')
  })

  test('inscription : contrôle de l’e-mail déjà utilisé et du mot de passe', async ({ page }) => {
    await page.goto('/signup')
    await page.getByText('Propriétaire mandant').click()
    await page.getByRole('button', { name: 'Continuer' }).click()
    await fillDetails(page, 'moussa.diop@example.com', '77 600 11 23')
    await password(page).fill('court')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(
      page.getByText(
        'Le mot de passe doit compter au moins 8 caractères, dont une lettre et un chiffre.',
      ),
    ).toBeVisible()

    await password(page).fill('Secret123')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(page.getByText('Un compte existe déjà avec cette adresse e-mail.')).toBeVisible()
  })

  test('création d’un compte professionnel avec justificatifs', async ({ page }) => {
    // Scénario long (OTP, trois téléversements, latences simulées) : délai triplé
    test.slow()
    await page.goto('/signup')
    await page.getByText('Professionnel', { exact: true }).click()
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(page.getByText('Étape 2 sur 4')).toBeVisible()
    await fillDetails(page, 'agence@teranga.sn', '77 600 11 24')
    await page.getByLabel('Nom de l’agence').fill('Teranga Immo')
    await page.getByLabel('SIRET / SIREN').fill('SN-DKR-2024-B-1234')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await otp(page).fill('123456')

    await expect(page.getByRole('heading', { name: 'Justificatifs professionnels' })).toBeVisible()
    await page.getByRole('button', { name: 'Envoyer et créer mon compte' }).click()
    await expect(page.getByText('Ajoutez les documents obligatoires pour continuer.')).toBeVisible()

    const pdf = (name: string) => ({
      name,
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    })
    for (const label of [
      'Registre du commerce',
      'Carte professionnelle',
      'Pièce d’identité du gérant',
    ]) {
      const chooser = page.waitForEvent('filechooser')
      await page.getByRole('button', { name: new RegExp(`Choisir un fichier : ${label}`) }).click()
      await (await chooser).setFiles(pdf(`${label}.pdf`))
    }
    await expect(page.getByText('Registre du commerce.pdf')).toBeVisible()

    // Format refusé
    await page.getByRole('button', { name: /Retirer le fichier : Carte professionnelle/ }).click()
    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /Choisir un fichier : Carte professionnelle/ }).click()
    await (
      await chooser
    ).setFiles({ name: 'carte.txt', mimeType: 'text/plain', buffer: Buffer.from('x') })
    await expect(page.getByText('Format non accepté : PDF, JPG ou PNG uniquement.')).toBeVisible()
    const retry = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /Choisir un fichier : Carte professionnelle/ }).click()
    await (await retry).setFiles(pdf('carte.pdf'))

    await page.getByRole('button', { name: 'Envoyer et créer mon compte' }).click()
    await expect(page.getByRole('heading', { name: 'Bienvenue, Fatou !' })).toBeVisible()
    await expect(page.getByText('Vérification en cours')).toBeVisible()
  })

  test('mot de passe oublié : OTP, lien de réinitialisation, nouveau mot de passe', async ({
    page,
  }) => {
    await page.goto('/forgot-password')
    await page.getByLabel('E-mail').fill('inconnu@example.com')
    await page.getByRole('textbox', { name: 'Téléphone' }).fill('77 123 45 67')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(
      page.getByText('Aucun compte ne correspond à cet e-mail et à ce numéro de téléphone.'),
    ).toBeVisible()

    await page.getByLabel('E-mail').fill('moussa.diop@example.com')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await otp(page).fill('123456')
    await expect(page.getByRole('heading', { name: 'Consultez vos e-mails' })).toBeVisible()
    await expect(page.getByText('m•••p@example.com')).toBeVisible()

    await page.getByRole('link', { name: 'ouvrir le lien de réinitialisation' }).click()
    await expect(page).toHaveURL(/\/reset-password\?token=/)
    const resetUrl = page.url()
    await page.getByLabel('Nouveau mot de passe').fill('Nouveau2026')
    await page.getByLabel('Confirmer le mot de passe').fill('Autre2026')
    await page.getByRole('button', { name: 'Enregistrer le mot de passe' }).click()
    await expect(page.getByText('Les deux mots de passe ne correspondent pas.')).toBeVisible()
    await page.getByLabel('Confirmer le mot de passe').fill('Nouveau2026')
    await page.getByRole('button', { name: 'Enregistrer le mot de passe' }).click()

    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Mot de passe modifié')).toBeVisible()
    await expect(page.getByLabel('Identifiant', { exact: true })).toHaveValue(DEMO.identifier)
    await password(page).fill(DEMO.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByText('Identifiant ou mot de passe incorrect.')).toBeVisible()
    await password(page).fill('Nouveau2026')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page).toHaveURL('/')

    // Le lien ne sert qu'une fois
    await page.goto(resetUrl)
    await expect(page.getByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).toBeVisible()
  })

  test('identifiant oublié : renvoyé après vérification du téléphone', async ({ page }) => {
    await page.goto('/forgot-identifier')
    await page.getByLabel('E-mail').fill('Moussa.Diop@example.com')
    await page.getByRole('textbox', { name: 'Téléphone' }).fill('77 123 45 67')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await otp(page).fill('123456')
    await expect(page.getByRole('heading', { name: 'Identifiant envoyé' })).toBeVisible()
    await expect(page.getByTestId('identifier')).toHaveText(DEMO.identifier)
    await page.getByRole('link', { name: 'Retour à la connexion' }).click()
    await expect(page.getByLabel('Identifiant', { exact: true })).toHaveValue(DEMO.identifier)
  })

  test('lien de réinitialisation invalide', async ({ page }) => {
    await page.goto('/reset-password?token=inconnu')
    await expect(page.getByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).toBeVisible()
    await page.getByRole('link', { name: 'Demander un nouveau lien' }).click()
    await expect(page).toHaveURL('/forgot-password')
  })
})
