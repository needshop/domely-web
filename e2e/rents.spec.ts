import { expect, type Page, test } from '@playwright/test'

/** Nombre affiché dans « N résultats ». */
async function resultCount(page: Page) {
  const text = await page.getByText(/^\d+ résultats?$|^Aucun résultat$/).textContent()
  return Number.parseInt(text ?? '0', 10) || 0
}

/** Mois précédent (AAAA-MM) : ses impayés sont échus quelle que soit la date du jour. */
const previousPeriod = () => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

test.describe('Loyers — échéances du mois', () => {
  test('affiche les échéances du mois courant et ses indicateurs', async ({ page }) => {
    await page.goto('/rents')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Loyers')
    await expect(page.getByRole('tab', { name: /Échéances du mois/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    for (const label of ['Attendu', 'Encaissé', 'Reste à encaisser', 'Impayés']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible()
    }
    // Une échéance par bail en cours
    await expect(page.getByText('61 résultats')).toBeVisible()
  })

  test('navigation de mois en mois, sans dépasser le mois courant', async ({ page }) => {
    await page.goto('/rents')
    await expect(page.getByRole('button', { name: 'Mois suivant' })).toBeDisabled()
    await page.getByRole('button', { name: 'Mois précédent' }).click()
    await expect(page).toHaveURL(/period=\d{4}-\d{2}/)
    // Attend l'affichage du mois précédent avant de filtrer
    await expect(page.getByRole('button', { name: 'Mois en cours' })).toBeVisible()
    // Mois passé : tout est réglé sauf les retards
    await page.getByRole('button', { name: /Situation/ }).click()
    await page.getByRole('option', { name: 'Payé', exact: true }).click()
    expect(await resultCount(page)).toBeGreaterThan(50)

    await page.getByRole('button', { name: 'Mois en cours' }).click()
    await expect(page).not.toHaveURL(/period=/)

    // Mois futur demandé dans l'URL : ramené au mois courant
    await page.goto('/rents?period=2999-01')
    await expect(page.getByRole('button', { name: 'Mois suivant' })).toBeDisabled()
  })

  test('recherche par locataire', async ({ page }) => {
    await page.goto('/rents')
    await page.getByRole('searchbox').fill('teranga')
    await expect(page.getByText('2 résultats')).toBeVisible()
  })
})

test.describe('Loyers — impayés et encaissement', () => {
  test('la vue Impayés liste les échéances dépassées non soldées', async ({ page }) => {
    await page.goto('/rents?view=unpaid')
    await expect(page.getByRole('tab', { name: /Impayés/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText(/échéances? impayées?, pour/)).toBeVisible()
    expect(await resultCount(page)).toBeGreaterThanOrEqual(5)
    await expect(page.getByRole('cell', { name: /Kwame Kouassi/ }).first()).toBeVisible()
  })

  test('encaisse un impayé en totalité (vue du mois)', async ({ page }) => {
    await page.goto(`/rents?period=${previousPeriod()}&status=late`)
    const before = await resultCount(page)
    await page
      .getByRole('button', { name: /^Encaisser le loyer de/ })
      .first()
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Encaisser un loyer' })).toBeVisible()
    await expect(dialog.getByLabel('Montant encaissé')).not.toHaveValue('')
    await dialog.getByLabel('Référence').fill('MP-TEST-001')
    await dialog.getByRole('button', { name: 'Enregistrer l’encaissement' }).click()

    await expect(page.getByText('Loyer encaissé')).toBeVisible()
    await expect(page.getByText(`${before - 1} résultat`, { exact: false })).toBeVisible()
  })

  test('le montant proposé est exactement le reste dû (pas d’arrondi)', async ({ page }) => {
    // Apt 4 des Oliviers : 355 000 + 28 000 = 383 000 F CFA
    await page.goto(`/rents?period=${previousPeriod()}&q=kwame`)
    await page
      .getByRole('button', { name: /^Encaisser le loyer de/ })
      .first()
      .click()
    await expect(page.getByRole('dialog').getByLabel('Montant encaissé')).toHaveValue(
      /^383\s000\sF\sCFA$/,
    )
  })

  test('paiement partiel et montant supérieur au reste dû', async ({ page }) => {
    await page.goto(`/rents?period=${previousPeriod()}&q=kwame`)
    await page
      .getByRole('button', { name: /^Encaisser le loyer de/ })
      .first()
      .click()
    const dialog = page.getByRole('dialog')
    const amount = dialog.getByLabel('Montant encaissé')

    await amount.fill('99000000')
    await dialog.getByRole('button', { name: 'Enregistrer l’encaissement' }).click()
    await expect(dialog.getByText(/Le montant dépasse le reste dû/)).toBeVisible()

    await amount.fill('100000')
    await dialog.getByRole('button', { name: 'Enregistrer l’encaissement' }).click()
    await expect(page.getByText('Paiement partiel enregistré')).toBeVisible()
    await expect(page.getByRole('row').getByText('Partiel', { exact: true }).first()).toBeVisible()
  })
})

test.describe('Loyers — relances', () => {
  test('la vue Impayés propose Relancer à la place d’Encaisser', async ({ page }) => {
    await page.goto('/rents?view=unpaid')
    await expect(page.getByRole('button', { name: /^Relancer / }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /^Encaisser/ })).toHaveCount(0)
  })

  test('relance par WhatsApp avec un message pré-rédigé', async ({ page }) => {
    // Pas de sortie vers WhatsApp pendant les tests
    await page.context().route('https://wa.me/**', (route) => route.abort())
    await page.goto('/rents?view=unpaid&q=kwame')
    await page.getByRole('button', { name: 'Relancer Kwame Kouassi' }).first().click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Relancer Kwame Kouassi' })).toBeVisible()
    const message = dialog.getByLabel('Message')
    await expect(message).toHaveValue(/Bonjour Kwame Kouassi/)
    await expect(message).toHaveValue(/383\s000\sF\sCFA/)

    const whatsapp = dialog.getByRole('link', { name: 'WhatsApp' })
    await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/221\d+\?text=Bonjour/)
    await expect(dialog.getByRole('link', { name: 'E-mail' })).toHaveAttribute('href', /^mailto:/)

    await whatsapp.click()
    await expect(page.getByText('Relance enregistrée')).toBeVisible()
    await expect(page.getByText(/^Relancé le /).first()).toBeVisible()
  })
})

test.describe('Loyers — liens avec les autres modules', () => {
  test('solder les impayés d’un contrat remet le locataire à jour', async ({ page }) => {
    await page.goto('/contracts/l4')
    await expect(page.getByText(/échéances? impayées? ·/)).toBeVisible()

    // Encaisse chaque échéance impayée de l'historique
    const unpaidRows = page
      .getByRole('row')
      .filter({ has: page.getByText('Impayé', { exact: true }) })
    while ((await unpaidRows.count()) > 0) {
      await unpaidRows
        .first()
        .getByRole('button', { name: /Encaisser/ })
        .click()
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Enregistrer l’encaissement' })
        .click()
      await expect(page.getByRole('dialog')).toHaveCount(0)
    }
    await expect(page.getByText('À jour de ses loyers')).toBeVisible()

    // Navigation interne : les encaissements en mémoire sont conservés
    await page.getByRole('link', { name: /Kwame Kouassi/ }).click()
    await expect(page).toHaveURL(/\/tenants\//)
    await expect(page.getByText('À jour', { exact: true }).first()).toBeVisible()
  })

  test('le tableau de bord reprend les impayés réels', async ({ page }) => {
    await page.goto('/')
    const card = page
      .getByText('Loyers en retard')
      .locator('xpath=ancestor::*[contains(concat(" ",@class," ")," card ")][1]')
    await expect(card.getByText('Kwame Kouassi').first()).toBeVisible()
  })
})
