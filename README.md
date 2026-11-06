# Domely — Front

Interface web du SaaS de gestion immobilière **Domely** — _La clarté au service de votre immobilier._

## Stack

- React 19 + TypeScript, build **Vite**
- **Tailwind CSS v4** (plugin `@tailwindcss/vite`, thème dans `src/index.css`)
- React Router (mode SPA, `createBrowserRouter`)
- Design system **HeroUI v3** (`@heroui/react` + `@heroui/styles`)
- Multilangue **react-i18next** (fr / en)
- Icônes `lucide-react` (style ligne arrondie, conforme à la charte)
- Polices auto-hébergées : **Alata** (titres, navigation, boutons) et **Inter** (texte courant)
- Qualité : `oxlint`, Prettier + tri des classes Tailwind

## Démarrage

```bash
npm install
cp .env.example .env.local   # si besoin
npm run dev                  # http://localhost:5174
```

| Script              | Rôle                      |
| ------------------- | ------------------------- |
| `npm run dev`       | Serveur de développement  |
| `npm run build`     | Typecheck + build de prod |
| `npm run preview`   | Prévisualise le build     |
| `npm run lint`      | Lint (oxlint)             |
| `npm run typecheck` | Vérification TypeScript   |
| `npm run format`    | Formatage Prettier        |

## Structure

```
src/
  app/            # router, providers globaux
  assets/brand/   # logos et symbole Domely (SVG)
  components/
    layout/       # AppLayout, Sidebar, navigation
    ThemeSwitcher.tsx
  features/       # modules métier (biens, locataires, loyers, …)
  hooks/          # hooks partagés
  i18n/           # config i18next + traductions fr / en
  lib/            # utilitaires (cn, env)
  pages/          # pages routées
  services/       # accès API
  types/          # types partagés
```

Alias d'import : `@/` → `src/`.

## Design system : HeroUI v3

- Composants : `@heroui/react` (bâti sur React Aria, sans Provider). Docs : https://heroui.com/docs/react
- Styles : `@import '@heroui/styles'` juste après `tailwindcss` dans `src/index.css` (l'ordre compte).
- Le thème HeroUI est surchargé aux couleurs Domely (blocs `:root` / `.dark` de `src/index.css`).
- Les boutons HeroUI utilisent Alata (`.button` dans `@layer components`).

### Couleurs (charte v1.0)

Utiliser en priorité les tokens sémantiques HeroUI, qui changent avec le thème :

| Token                        | Clair                | Sombre                  | Usage                       |
| ---------------------------- | -------------------- | ----------------------- | --------------------------- |
| `background` / `foreground`  | night-50 / night-900 | night-950 / blanc cassé | Fond de page / texte        |
| `surface`                    | blanc                | night-900               | Cartes, en-tête             |
| `accent`                     | `#FF4444`            | `#FF4444`               | Action principale           |
| `danger`                     | `#FF4444`            | `#FF4444`               | Alertes, suppression        |
| `warning`                    | `#FFD600`            | `#FFD600`               | Attention (texte bleu nuit) |
| `success`                    | `#00E676`            | `#00E676`               | Succès (texte bleu nuit)    |
| `muted`, `border`, `default` | nuances night        | nuances night           | Texte secondaire, bordures  |

La palette brute reste disponible : `night-50…950`, `brand-red-500`, `brand-yellow-500`, `brand-green-500`.
Règles : couleurs vives réservées aux états/actions, **pas de texte blanc sur jaune ou vert**.
Polices : `font-display` (Alata), `font-sans` (Inter).

### Thème clair / sombre

- `ThemeSwitcher` (en-tête) : clair, sombre ou système, via le hook `useTheme` de HeroUI.
- Le choix est stocké dans `localStorage` (`heroui-theme`) et appliqué sur `<html>` (`class` + `data-theme`).
- Un script inline dans `index.html` applique le thème avant le premier rendu (pas de flash).
- Variante Tailwind `dark:` disponible pour les ajustements ponctuels.

## Multilangue (react-i18next)

- Langues supportées : **fr** (référence, langue de repli) et **en**.
- Configuration : `src/i18n/index.ts` — traductions dans `src/i18n/locales/{fr,en}/common.json`.
- Détection : choix mémorisé (`localStorage` « domely-lang ») puis langue du navigateur (`en-US` → `en`) ;
  toute autre langue retombe sur le français.
- `LanguageSwitcher` (en-tête) bascule FR / EN ; `<html lang>` et la locale React Aria / HeroUI
  (`I18nProvider`) suivent la langue active.
- Clés typées : `t('nav.dashboard')` est vérifié à la compilation (`src/i18n/i18next.d.ts`), et
  `npm run typecheck` échoue si une clé du fichier `fr` manque dans `en`.

```tsx
const { t } = useTranslation()
return <h1>{t('dashboard.greeting')}</h1>
```

## Devises

- Les montants sont stockés en **XOF** (devise de référence, `BASE_CURRENCY`) ; c'est aussi la devise affichée par défaut.
- Le sélecteur de l'en-tête (`CurrencySwitcher`) **convertit** l'affichage en **EUR** ou **GNF** ; le choix est mémorisé (`localStorage` « domely-currency »).
- Taux (`src/lib/currency.ts`) : EUR = parité fixe 1 € = 655,957 F CFA ; GNF = **taux indicatif** (`GNF_PER_XOF`), à fournir par l'API.
- Format (`useFormatters`) : montants complets sous 1 M, abrégés au-delà (15 250 000 → « 15,25 M F CFA », 2,5 Md…).
  - `f.money(xof)` / `f.moneyExact(xof)` : convertit un montant XOF puis le formate.
  - `f.formatAmount(v)` : formate un montant déjà converti (graphiques).

## Tests E2E (Playwright)

```bash
npm run test:e2e          # lance le serveur de dev (port 5174) puis les tests
npm run test:e2e:ui       # mode interactif
npm run test:e2e:report   # rapport HTML du dernier run
```

Les tests sont dans `e2e/` et tournent sur le **Google Chrome installé localement** (`channel: 'chrome'`) :
le Chromium embarqué par Playwright n'est pas supporté sur macOS 13.

Le serveur **Playwright MCP** est déclaré dans `../.mcp.json` (racine du workspace) pour piloter le
navigateur depuis Claude Code.
