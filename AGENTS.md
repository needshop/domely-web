# AGENTS.md — Domely

Document de référence pour les agents (et les humains) qui travaillent sur Domely : objectifs,
structure, spécifications techniques et fonctionnelles, conventions et pièges connus.
**À tenir à jour à chaque fonctionnalité livrée** (sections 7, 8, 11 et 12 en particulier).

> Dernière mise à jour : 12/11/2026 — front v0.1.0, tous les modules de la navigation (Biens, Locataires, Loyers, Interventions, Contrats,
> Rapports, Paramètres) et l'authentification (simulée, en attendant l'API).

---

## 1. Le projet

**Domely** — _La clarté au service de votre immobilier._ SaaS de gestion locative pour les
propriétaires et gestionnaires de biens en **Afrique de l'Ouest** (zone UEMOA + Guinée).

### Objectifs globaux

- Centraliser le patrimoine : biens, lots, locataires, contrats de bail.
- Suivre les loyers : échéances, encaissements (Mobile Money, espèces, virement, chèque),
  impayés et relances.
- Donner une vision claire et immédiate : tableau de bord, indicateurs, alertes (retards,
  fins de bail).
- Adapté au contexte local : franc CFA (XOF) par défaut, EUR et GNF, pays de la zone,
  Mobile Money, WhatsApp, usage mobile important.
- Suivre l'entretien : interventions (signalement, planification, prestataires, coûts).
- Analyser : rapports (revenus, recouvrement, impayés, dépenses, résultat par bien, export CSV).
- Personnaliser : profil, organisation, devise et taux, valeurs par défaut des baux, modèle de relance.
- À venir : API, application mobile.

### Public et contexte d'usage

- Propriétaires particuliers, gestionnaires et agences, multi-pays (SN, CI, TG, BJ, ML, BF,
  NE, GW, GN).
- Usage fréquent sur smartphone : chaque écran doit fonctionner dès 360 px de large.
- Interface en **français** par défaut, **anglais** disponible.

---

## 2. Organisation du dépôt

```
domely/                      # racine de travail (pas un dépôt git)
├── .mcp.json                # serveur MCP Playwright (tests navigateur)
├── Domely_Brand_Kit/        # logos, icônes, palette, charte graphique (PDF)
├── front/                   # SPA React — dépôt git : git@github.com:needshop/domely-web.git
│   ├── AGENTS.md            # ce fichier
│   └── CLAUDE.md            # consignes Claude Code (importe AGENTS.md)
├── api/                     # API (à venir, vide)
└── mobile/                  # application mobile (à venir, vide)
```

- `front/` a son propre dépôt git ; on travaille **directement sur `main`** pour l'instant.
- Le brand kit fait foi pour les couleurs, logos et typographies.

---

## 3. Consignes de travail

### Git

- **Aucune attribution Claude** : pas de `Co-Authored-By: Claude …` dans les commits, pas de
  « Generated with Claude Code » dans les PR.
- Commit / push **uniquement à la demande** de l'utilisateur, sur `main`.
- Messages de commit en français, préfixés : `feat(module): …`, `fix(module): …`.

### Code

- **URLs en anglais** (`/properties`, `/tenants`…), libellés traduits via i18n.
- Aucun texte en dur dans les composants : tout passe par `react-i18next` (fr **et** en).
- Commentaires et documentation en français.
- Avant de livrer : `npm run typecheck`, `npm run lint`, `npm run format:check` et
  `npx playwright test` doivent passer ; vérifier visuellement (desktop, mobile 375 px,
  thème sombre si pertinent).

### Environnement

- Le serveur de dev tourne sur le port **5174** (souvent lancé par l'utilisateur : ne pas le tuer).
- Ne jamais tuer de processus de manière large. Seul `pkill -f "vite preview --port 4173"`
  (serveur de preview des tests) est autorisé.
- macOS 13 : Chromium de Playwright non supporté → tests sur **Chrome système**
  (`channel: 'chrome'`, MCP lancé avec `--browser chrome`).

---

## 4. Front — stack technique

| Domaine       | Choix                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| Framework     | React 19 + TypeScript 7, build **Vite 8** (SPA)                             |
| Styles        | **Tailwind CSS v4** (`@tailwindcss/vite`, thème dans `src/index.css`)       |
| Design system | **HeroUI v3** (`@heroui/react`, `@heroui/styles`), sans provider            |
| Accessibilité | React Aria Components (sous HeroUI) ; `RouterProvider` RAC pour les liens   |
| Routage       | React Router 8 (`createBrowserRouter`, `useSearchParams`, `useBlocker`)     |
| Formulaires   | react-hook-form 7 + zod 4 (`@hookform/resolvers`), messages traduits        |
| Dates         | `@internationalized/date` (DatePicker), dates métier en ISO `AAAA-MM-JJ`    |
| i18n          | i18next + react-i18next, clés typées, détection `localStorage` → navigateur |
| Icônes        | lucide-react                                                                |
| Polices       | Alata (titres, navigation, boutons) et Inter (texte), auto-hébergées        |
| Qualité       | oxlint, Prettier (+ tri des classes Tailwind)                               |
| Tests         | Playwright 1.65 (e2e) + serveur MCP Playwright                              |
| PWA           | `manifest.webmanifest`, icônes de l'application, installable                |

### Commandes (`front/`)

```bash
npm run dev            # http://localhost:5174
npm run build          # typecheck + build de production
npm run typecheck      # tsc -b
npm run lint           # oxlint
npm run format         # prettier --write
npx playwright test    # e2e (build + preview sur le port 4173)
```

- Variables d'environnement : `VITE_API_URL` (défaut `http://localhost:3000/api`),
  voir `front/.env.example`. Version de l'app injectée via `__APP_VERSION__` (package.json).
- Alias d'import : `@` → `front/src`.

---

## 5. Front — architecture

```
src/
├── app/            # router.tsx, RootLayout (liens React Aria, défilement), PageLoader, CurrencyProvider
├── assets/brand/   # logos et symboles SVG (couleur et blanc)
├── components/     # composants partagés (StatTile, FilterSelect, ListPagination…)
│   ├── charts/     # RentCollectionChart (histogramme mensuel), HorizontalBars
│   ├── form/       # champs RHF + HeroUI (fields.tsx) et mise en page (FormLayout.tsx)
│   └── layout/     # AppLayout, Sidebar, MobileNav, navigation.ts
├── features/       # un dossier par module métier (voir ci-dessous)
├── hooks/          # hooks génériques (useLocalStorage)
├── i18n/           # configuration, types et traductions fr / en (common.json)
├── lib/            # utilitaires : format, currency, dates, countries, search, csv, cn, env
├── pages/          # pages routées (assemblent les composants des features)
└── services/       # (vide) futur client HTTP de l'API
```

### Chargement des pages

- Chaque page de `pages/` est **chargée à la demande** (`lazy` de React Router dans
  `app/router.tsx`) : un fichier JavaScript par page, téléchargé à la première visite.
  Les layouts (`RootLayout`, `AppLayout`, `AuthLayout`) et les gardes restent dans le fichier
  principal.
- Nouvelle page : l'exporter par son nom, l'ajouter à l'objet `pages` du routeur puis déclarer
  la route avec `lazy: page(pages.x, (m) => <m.XPage … />)` (les props comme `mode` passent).
- `PageLoader` s'affiche au tout premier chargement (`HydrateFallback`) ; lors d'une navigation,
  la page précédente reste affichée jusqu'à ce que la suivante soit prête.
- Poids téléchargé (build de production, dépendances partagées comprises) : environ 0,9 Mo
  pour le tableau de bord, 1,2 à 1,4 Mo pour les pages à formulaire, contre 1,7 Mo pour tout
  avant le découpage.

### Anatomie d'une feature (`src/features/<module>/`)

| Fichier       | Rôle                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `types.ts`    | Types du domaine, listes de valeurs (`as const`)                                                          |
| `mockData.ts` | Données fictives réalistes, de même forme que la future API                                               |
| `store.ts`    | Store en mémoire (`subscribe` / `getSnapshot`, `create`, `update`…)                                       |
| `api.ts`      | **Seul point d'accès aux données** : hooks (`useX`, `useXRows`) et mutations async (`createX`, `updateX`) |
| `utils.ts`    | Calculs métier purs (statuts, indicateurs, agrégats)                                                      |
| `hooks/`      | État de liste dans l'URL (filtres, tri, page)                                                             |
| `components/` | Composants d'affichage du module                                                                          |
| `form/`       | `schema.ts` (zod), `mapping.ts` (entité ↔ formulaire), formulaire                                         |

Modules : `auth`, `dashboard`, `properties`, `landlords`, `tenants`, `contracts`, `rents`, `maintenance`, `reports`,
`settings` (`reports` n'a pas de store : il agrège les données des autres modules).

### Flux de données

- Les stores en mémoire sont lus via `useSyncExternalStore` dans `api.ts`. Les composants
  n'importent **jamais** un store ou un `mockData` directement.
- Pour brancher l'API, on remplace l'implémentation des hooks de `api.ts` (ex. TanStack
  Query) **sans toucher aux composants**.
- Les données sont perdues au rechargement (assumé tant que l'API n'existe pas), **sauf les
  paramètres** (`domely-settings`), **les comptes** (`domely-accounts`) et **la session**
  (`domely-session`), enregistrés dans `localStorage`.
- **Sources de vérité et états dérivés** :
  - le **contrat** fait foi pour l'occupation : `useProperties()` applique les contrats aux
    biens (`applyLeases`). Un lot est « loué » s'il a un contrat en cours, avec le loyer, les
    charges et le locataire de ce contrat. `useRawProperties()` donne les biens bruts ;
  - les **échéances de loyer** ne sont pas stockées : elles sont calculées à partir des
    contrats (`buildDues`) ; seuls les **encaissements** et les **relances** sont stockés ;
  - le **retard** d'un lot ou d'un locataire est déduit des échéances impayées
    (`lateLeaseIds`).

---

## 6. Conventions transverses

### UI et charte

- Palette (`@theme` dans `src/index.css`) :
  - **nuit** `#0B1E3B` (dominante, sidebar), **rouge** `#FF4444` (accent, actions principales) ;
  - jaune `#FFD600` et vert `#00E676` en touches.
- Les variables HeroUI (`--accent`, `--surface`…) sont surchargées pour le clair et le sombre.
- Thème clair / sombre / système (`useTheme` HeroUI, clé `heroui-theme`), avec un script
  anti-flash dans `index.html`.
- Sélecteurs de **langue** et de **devise** : listes déroulantes (`Select`) qui affichent le
  code (FR, XOF…) dans le champ et le nom complet dans la liste ; la flèche est masquée sous
  640 px (en-tête mobile chargé). Le thème reste un groupe de boutons.
- Les statuts s'affichent **toujours avec une icône et un libellé**, jamais par la couleur seule.
- Dataviz : les couleurs néon de la marque ne servent qu'aux statuts (contraste insuffisant
  pour les séries). Graphique des loyers : barres nuit, mois courant en rouge, tableau de
  données accessible (`<details>`).
- Pages de liste :
  - en-tête (titre, sous-titre, action principale), puis indicateurs (`StatTile`) ;
  - ensuite barre d'outils (recherche, filtres), compteur de résultats, liste, pagination ;
  - tableau sur desktop, cartes sur mobile.
- Fiches détail : fil d'Ariane, en-tête avec statut et actions, indicateurs, cartes de contenu.
- Formulaires :
  - sections en cartes, bandeau d'erreurs après soumission ;
  - barre d'actions flottante (sticky) ;
  - confirmation avant de quitter avec des modifications (`LeaveGuard`).

### État dans l'URL

- Filtres, tri, page, vue et mois sont dans les paramètres d'URL (partageables, rechargeables).
- La valeur par défaut est retirée de l'URL. Un changement de filtre ramène à la page 1, et une
  page hors bornes est ramenée dans les bornes.
- Préférences locales (`localStorage`) : `domely-lang`, `domely-currency`,
  `domely-sidebar-collapsed`, `domely-properties-view`, `heroui-theme`, `domely-settings`
  (paramètres, lus avec les valeurs par défaut en repli pour les champs ajoutés plus tard),
  `domely-remembered-identifier` (identifiant mémorisé sur la page de connexion).
- Simulation de l'authentification : `domely-accounts` (comptes créés, liens de
  réinitialisation) et `domely-session` (utilisateur connecté).

### Montants et devises

- **Tous les montants sont stockés en XOF** (devise de référence).
- L'affichage est converti vers la devise choisie (`CurrencySwitcher`) :
  - EUR : `655,957 XOF = 1 €` (parité fixe) ;
  - GNF : `1 XOF = 14,18 GNF` par défaut (taux **indicatif**), modifiable dans Paramètres ;
    les taux passent par le `CurrencyContext` (`useCurrency().rates`).
- À partir de 1 million, notation abrégée à 2 décimales : `15 250 000 F CFA` s'affiche
  « 15,25 M F CFA ».
- Toujours formater via `useFormatters()` (`lib/format.ts`) : `money`, `moneyExact`, `number`,
  `percent`, dates…

### Dates

- Dates métier en chaîne ISO `AAAA-MM-JJ`, mois en `AAAA-MM`. Les helpers sont dans
  `lib/dates.ts` (`todayIso`, `daysUntil`, `addMonths`, `addDays`, `durationInMonths`).
- Pour afficher une date ISO, la convertir avec `new Date(\`${iso}T12:00:00\`)` afin d'éviter
  les décalages de fuseau.
- Les données fictives (loyers) sont générées **par rapport à la date du jour**.

### i18n

- Un seul namespace `common` (`src/i18n/locales/{fr,en}/common.json`) avec des clés typées.
  Les fichiers fr et en doivent avoir **exactement les mêmes clés** (vérifié au typecheck).
- Pluriels i18next (`_one`, `_other`, `_zero`). Les traductions s'ajoutent **avant** d'utiliser
  la clé, sinon le typecheck échoue.
- Les schémas zod sont construits avec `t` (`makeXSchema(t)`) pour des messages traduits.

### Formulaires

- Utiliser les champs de `components/form/fields.tsx` :
  - `FormTextField`, `FormTextArea`, `FormNumberField`, `FormSelect` ;
  - `FormComboBox` (liste avec recherche), `FormDateField`, `FormSwitch`.
- Ces champs sont en `validationBehavior="aria"` : la validation vient de zod.
- Les champs « vides » valent `null` (nombres, sélections) ou `''` (textes) dans le formulaire.
- Les valeurs initiales sont figées au montage (`useMemo` sur l'id).

### Accessibilité

- Lignes de tableau cliquables, mais c'est le lien de la ligne qui porte la navigation au
  clavier ; libellés `aria-label` explicites sur les boutons-icônes.
- Zones `aria-live` pour les compteurs de résultats, `role="meter"` pour les jauges.

---

## 7. Modèle de domaine

```
Landlord (bailleur) 1───n Property (comptes professionnels, `Property.landlordId`)
Property (bien) 1───n Unit (lot)
Unit 1───n Lease (contrat) n───1 Tenant (locataire)
Lease 1───n RentDue (échéance mensuelle, calculée) 1───n Payment (encaissement)
RentDue 1───n Reminder (relance)
Property 1───n Intervention (sur un lot ou les parties communes) n───0..1 Tenant (signalement)
```

| Entité         | Champs clés                                                                                                                                                                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Property`     | id, name, type, address { street, district, city, country ISO }, acquiredAt?, createdAt, description?, landlordId?, units[]                                                                                                                                                                           |
| `Landlord`     | id, kind (individual / company), name, contactPerson?, phone, email, city?, country? (UEMOA + GN + FR), mandateStart?, feeRate? (% des loyers), notes?, createdAt                                                                                                                                     |
| `Unit`         | id (unique **dans le bien**), label, kind, floor?, area, rooms?, rent et charges (référence), status ; dérivés : lease?, isLate?                                                                                                                                                                      |
| `Tenant`       | id, kind (individual / company), name, phone, email?, occupation?, contactPerson?, idDocument?, emergencyContact?, notes?, createdAt                                                                                                                                                                  |
| `Lease`        | id, reference `BAIL-AAAA-NNNN`, propertyId, unitId, tenantId, type, startDate, endDate, rent, charges, deposit, paymentDay (1–28), tacitRenewal, terminatedAt?, terminationReason?, notes?, createdAt                                                                                                 |
| `RentDue`      | id `leaseId:AAAA-MM`, period, dueDate, amount (loyer + charges), paid, remaining, status, daysLate, payments[] — **calculé**                                                                                                                                                                          |
| `Payment`      | id, leaseId, period, date, amount, method, reference?, note?                                                                                                                                                                                                                                          |
| `Reminder`     | id, leaseId, period, date, channel (whatsapp / sms / email)                                                                                                                                                                                                                                           |
| `Account`      | id, identifier (7 caractères), profile, professionalKind?, firstName, lastName, email, phone (international), password (simulation), agencyName?, registrationNumber?, documents[] { type, name, size, mimeType }, verification (`verified` / `pending`), createdAt                                   |
| `Session`      | accountId, identifier, firstName, lastName, profile, verification, professionalKind?, agencyName?, startedAt                                                                                                                                                                                          |
| `Intervention` | id, reference `INT-AAAA-NNNN`, propertyId, unitId? (absent = parties communes), title, description?, category, priority, status, reportedBy, tenantId?, reportedAt, scheduledAt?, completedAt?, provider { name, phone? }?, estimatedCost?, actualCost?, chargedTo, history[] { date, status, note? } |

Valeurs :

- Types de bien : `building`, `residence`, `apartment`, `house`, `commercial`, `office`. Les
  terrains ne sont pas gérés. `apartment` et `house` n'ont qu'un seul lot.
- Natures de lot : `apartment`, `studio`, `house`, `shop`, `office`.
- Statuts de lot : `rented` (dérivé du contrat), `vacant`, `underWorks`.
- Natures de bail : `residential`, `commercial` (boutique), `professional` (bureau).
- Moyens de paiement : `mobileMoney`, `cash`, `bankTransfer`, `check`.
- Interventions :
  - catégories : `plumbing`, `electricity`, `airConditioning`, `locksmith`, `painting`,
    `masonry`, `appliances`, `cleaning`, `other` ;
  - priorités : `urgent`, `normal`, `low` ;
  - statuts : `new`, `scheduled`, `inProgress`, `done`, `cancelled` ;
  - signalée par `tenant`, `owner` ou `manager` ; à la charge de `owner` ou `tenant`.

---

## 8. Spécifications fonctionnelles (livrées)

### Transverse

- **Layout**
  - Sidebar nuit repliable en icônes (état mémorisé), avec la version de l'app en bas.
  - Sur mobile, un tiroir s'ouvre depuis le bouton du header.
  - Header : devise, langue, thème, notifications (non branchées), menu du compte.
- **Navigation** : Tableau de bord, Biens, Bailleurs (comptes professionnels), Locataires, Loyers, Interventions, Contrats,
  Rapports, Paramètres : tous les modules sont implémentés.
- **PWA** installable avec l'icône de l'application ; page 404 ; retour en haut de page à
  chaque navigation.

### Authentification (`/login`, `/signup`, `/forgot-password`, `/forgot-identifier`, `/reset-password`)

- **Accès** : toute l'application exige une session (`RequireAuth`). Sans session, on est
  renvoyé vers `/login`, puis ramené à la page demandée après la connexion. Les pages
  visiteurs (`GuestOnly`) renvoient un utilisateur connecté vers l'accueil.
  `/reset-password` reste accessible connecté ou non (le lien vient d'un e-mail).
- **Layout** (`AuthLayout`) : sur desktop, présentation de la plateforme sur 2/3 (logo blanc
  en haut, surtitre, slogan et sous-titre centrés verticalement, points forts en bas ; `xl` et
  plus, colonne de 28rem en `lg`) et
  formulaire sur 1/3 (langue et thème en haut, plus le logo sur mobile uniquement, formulaire au centre, copyright en bas).
  Sur mobile, le formulaire seul.
- **Identifiant de connexion** : 7 caractères, lettres majuscules et chiffres (au moins un de
  chaque, sans 0/O, 1/I/L), généré à la création du compte et envoyé par e-mail. Saisi en
  majuscules automatiquement.
- **Connexion** : identifiant, mot de passe (afficher / masquer), interrupteur « Mémoriser mon
  identifiant » (pré-remplit le champ et place le curseur sur le mot de passe). Sous le
  formulaire, bloc de liens ombré : mot de passe oublié, identifiant oublié. Lien vers
  l'inscription. Erreur unique « Identifiant ou mot de passe incorrect ».
- **Comptes de démonstration** affichés sur la page, mot de passe `Domely2026` :
  - `DMY4K7P` : Moussa Diop, propriétaire gestionnaire, +221 77 123 45 67,
    moussa.diop@example.com ;
  - `AGT8R2K` : Aminata Sow, agence « Teranga Immobilier », +221 77 654 32 10,
    aminata.sow@example.com.
- **Création de compte** (`/signup`, étapes en mémoire, garde de sortie) :
  1. profil : propriétaire gestionnaire, propriétaire mandant, professionnel ;
  2. informations : nom, prénom, e-mail, téléphone (indicatif SN, CI, TG, BJ, ML, BF, NE, GW,
     GN, FR + 8 à 10 chiffres), mot de passe (8 caractères, une lettre, un chiffre, règles
     affichées en direct). Professionnels : agence immobilière ou mandataire indépendant, nom
     de l'agence, SIRET / SIREN (ou NINEA, RCCM, IFU… ; 5 à 30 caractères). E-mail et
     téléphone **uniques** ;
  3. vérification du téléphone par code OTP à 6 chiffres (validation automatique à la saisie,
     renvoi après 60 s, 5 essais, validité 5 min) ;
  4. professionnels : justificatifs (PDF, JPG, PNG, 5 Mo max, glisser-déposer). Agence :
     registre du commerce, carte professionnelle, pièce d'identité du gérant. Mandataire :
     pièce d'identité, attestation d'immatriculation, mandat (facultatif). Le compte est créé
     « vérification en cours » ;
  - fin : identifiant affiché (copie), envoyé par e-mail ; bouton « Se connecter » avec
    l'identifiant pré-rempli.
- **Mot de passe / identifiant oublié** : e-mail et téléphone du compte (ils doivent
  correspondre au même compte), code OTP, puis envoi par e-mail du lien de réinitialisation
  (30 min, usage unique, un seul lien actif par compte) ou de l'identifiant.
- **Réinitialisation** (`/reset-password?token=`) : nouveau mot de passe et confirmation ; lien
  invalide, expiré ou déjà utilisé signalé avec un lien pour en demander un autre. Ensuite,
  retour à la connexion avec l'identifiant pré-rempli et un bandeau de confirmation.
- **Compte professionnel** : nom de l'agence et statut (agence / mandataire) à gauche de
  l'en-tête de l'application (à partir de 640 px, tronqué avec infobulle si besoin) et, dans le
  menu mobile, entre le logo et la navigation.
- **Menu du compte** (avatar dans l'en-tête) : nom, profil, identifiant, vérification en cours,
  Paramètres, Se déconnecter.

### Tableau de bord (`/`)

- Indicateurs :
  - biens gérés ;
  - locataires actifs ;
  - loyers encaissés du mois avec la variation par rapport au mois précédent ;
  - loyers impayés et nombre de locataires concernés.
- Graphique des loyers encaissés sur 12 mois (attendu et encaissé, taux de recouvrement,
  tooltip, tableau de données). Carte d'occupation de hauteur fixe sur desktop.
- Carte « Loyers en retard » : les 5 impayés les plus anciens. Son bouton « Relancer »
  **n'est pas branché**.
- Biens récents.
- Carte « Interventions à traiter » : les 4 plus urgentes, avec lien vers chaque fiche.
- Échéances (assurance, révision…) : **données fictives** du tableau de bord.

### Biens (`/properties`, `/properties/new`, `/properties/:id`, `/properties/:id/edit`)

- **Liste**
  - Indicateurs : biens, lots et vacants, taux d'occupation, loyers mensuels.
  - Recherche insensible aux accents (nom, adresse, ville, pays en fr et en).
  - Filtres : type, ville, occupation. Tri : récents, nom, loyer, occupation.
  - Vue cartes ou tableau (mémorisée), **9 biens par page**.
- **Fiche**
  - Indicateurs : lots, occupation, loyers et potentiel, retards.
  - Onglets Lots, Interventions (à traiter d'abord) et Informations.
  - Bouton « Signaler une intervention » (pré-remplit le bien).
  - Le nom du locataire mène à sa fiche ; un lien **« Louer »** sur chaque lot vacant crée un
    contrat pré-rempli.
- **Formulaire**
  - Sections : informations générales, adresse, lots (ajout et suppression).
  - Un type à lot unique impose un seul lot ; les libellés de lots doivent être uniques.
  - Pour un lot loué, le statut, le loyer et la suppression sont verrouillés (gérés par le
    contrat).
  - Toast de confirmation, garde de sortie.

### Bailleurs (`/landlords`, `/landlords/new`, `/landlords/:id`, `/landlords/:id/edit`)

- **Réservé aux comptes professionnels** (agences, mandataires) : entrée de navigation masquée
  pour les propriétaires, routes protégées (`RequireProfessional`, retour à l'accueil),
  champ « Bailleur » absent du formulaire et de la fiche d'un bien.
- **Liste**
  - Indicateurs : bailleurs (dont sans bien), biens confiés (et biens sans bailleur), loyers
    gérés par mois, honoraires mensuels estimés.
  - Recherche (nom, interlocuteur, téléphone avec ou sans espaces, e-mail, ville, bien),
    filtre par type, tri (nom, récents, nombre de biens, loyers). **10 par page**.
  - Colonnes : bailleur, contact, biens confiés et lots, occupation, loyers, honoraires (taux).
- **Fiche** : boutons Appeler, Écrire, Modifier ; indicateurs (biens et lots, occupation,
  loyers et retards, honoraires) ; biens confiés (occupation, loyers, retards, lien vers le
  bien) avec « Ajouter un bien » (pré-sélectionne le bailleur, `?landlord=`) ; coordonnées et
  mandat.
- **Formulaire** : particulier ou société (raison sociale, interlocuteur) ; téléphone
  obligatoire et **unique** parmi les bailleurs ; e-mail **obligatoire** (comptes rendus) ; ville et pays de résidence (dont la
  France pour la diaspora) ; début du mandat ; honoraires de gestion en % (0 à 100) ; notes.
- **Honoraires estimés** = taux × loyers mensuels des lots loués (hors charges).
- **Biens** : section « Bailleur » en tête du formulaire (liste avec recherche, facultative,
  lien « Ajouter un bailleur ») ; ligne « Bailleur » dans l'onglet Informations de la fiche.

### Locataires (`/tenants`, `/tenants/new`, `/tenants/:id`, `/tenants/:id/edit`)

- **Liste**
  - Indicateurs : actifs, en retard, baux bientôt échus (90 jours), loyers et charges attendus.
  - Recherche : nom, téléphone avec ou sans espaces, e-mail, bien, lot.
  - Filtres : situation (à jour, en retard, bail bientôt échu, sans bail), type, bien. Tri.
  - **10 par page**.
- **Fiche**
  - Boutons Appeler (`tel:`) et Écrire (`mailto:`), Nouveau contrat, Modifier.
  - Baux en cours avec l'avancement et un lien vers le contrat.
  - Coordonnées, pièce d'identité, personne à prévenir, notes.
- **Formulaire**
  - Particulier ou société : les champs s'adaptent (raison sociale, interlocuteur, RCCM).
  - Téléphone obligatoire, de 8 à 15 chiffres, **unique** (le doublon est signalé avec le nom).
  - Pièce d'identité : type et numéro vont ensemble. Personne à prévenir : nom et téléphone vont
    ensemble.

### Contrats (`/contracts`, `/contracts/new`, `/contracts/:id`, `/contracts/:id/edit`)

- **Statuts** :
  - `upcoming` (à venir) ;
  - `active` (en cours) ;
  - `expired` (échu sans résiliation, le locataire occupe toujours le lot) ;
  - `terminated` (résiliation effective).
- **Liste**
  - Par défaut, les baux en cours, échéance la plus proche en premier.
  - Indicateurs : en cours et à venir, échéances proches, loyers et charges, dépôts de garantie.
  - Filtres : situation, nature, bien. Tri. **10 par page**.
- **Fiche**
  - Conditions du bail, avancement, liens vers le locataire et le logement.
  - Bandeaux selon la situation (échu, à venir, résilié, résiliation programmée).
  - Historique des loyers avec encaissement.
- **Résiliation** : date d'effet (pas avant le début du bail) et motif. Le lot est libéré à la
  date d'effet.
- **Formulaire**
  - Champs : locataire (liste avec recherche), bien, puis lot (avec sa situation).
  - Pré-remplissage depuis `?tenant=`, `?property=` et `?unit=`.
  - Valeurs proposées :
    - loyer, charges et nature du bail repris du lot ;
    - dépôt d'usage : 2 mois de loyer en habitation, 3 en commercial ou professionnel ;
    - début le 1ᵉʳ du mois suivant, fin un an plus tard (veille de la date anniversaire).
  - **Refus des chevauchements** sur un même lot et des lots en travaux ; la fin doit suivre
    le début.
  - En modification, le locataire et le lot sont verrouillés ; un contrat résilié n'est plus
    modifiable.

### Loyers (`/rents`)

- **Échéances** :
  - une par mois et par contrat, au jour d'échéance, pour le loyer et les charges ;
  - du premier mois du bail jusqu'au mois courant, ou jusqu'à la fin effective ;
  - la date d'échéance est le début du bail s'il commence après le jour d'échéance ;
  - pas de calcul au prorata.
- **Situations** : `paid` (payé), `due` (à échoir), `partial` (échu, réglé en partie),
  `late` (échu, rien réglé), avec les jours de retard.
- **Vue « Échéances du mois »**
  - Navigation par mois, sans dépasser le mois courant.
  - Indicateurs : attendu, encaissé et taux, reste à encaisser, impayés tous mois confondus.
  - Filtres : situation, bien. Les impayés s'affichent en premier.
  - Action **Encaisser**.
- **Vue « Impayés »** : toutes les échéances échues non soldées, de la plus ancienne à la plus
  récente. Action **Relancer**.
- **Encaissement**
  - Le montant proposé est le reste dû, et il peut être partiel ; il ne peut pas dépasser le
    reste dû.
  - La date ne peut pas être dans le futur.
  - On renseigne le moyen de paiement et une référence (n° Mobile Money, de chèque…).
- **Relance**
  - Le message est pré-rédigé, modifiable et traduit.
  - Envoi par WhatsApp (`wa.me`), SMS (`sms:`) ou e-mail (`mailto:`) depuis l'appareil de
    l'utilisateur.
  - La relance est enregistrée sur l'échéance (« Relancé le … »).
- Les impayés alimentent le retard affiché sur les biens, les locataires et le tableau de bord.

### Interventions (`/maintenance`, `/maintenance/new`, `/maintenance/:id`, `/maintenance/:id/edit`)

- **Cycle de vie** et actions de la fiche :
  - `new` → **Planifier** (date de passage, prestataire), **Démarrer** ou **Annuler** ;
  - `scheduled` → **Démarrer**, **Replanifier** ou **Annuler** ;
  - `inProgress` → **Terminer** (date de fin, pas dans le futur, et coût réel) ou **Annuler** ;
  - `done` → **Rouvrir** (repasse en cours) ; `cancelled` → **Rouvrir** (repasse en nouvelle) ;
  - chaque étape est inscrite dans l'**historique**, avec une note facultative (motif d'annulation…).
- **Liste**
  - Par défaut : interventions à traiter, urgentes d'abord.
  - Indicateurs : à traiter (nouvelles, en cours), urgentes, passages dans les 7 jours,
    dépenses de l'année (coûts réels des interventions terminées).
  - Recherche (titre, référence, bien, lot, locataire, prestataire), filtres par statut,
    priorité, catégorie et bien, tri. **10 par page**.
  - Un passage prévu dépassé sans démarrage est signalé.
- **Fiche** : détails (description, logement, signalement, prise en charge), planification et
  coûts (prestataire avec lien `tel:`), historique.
- **Formulaire**
  - Bien, puis lot ou **parties communes** ; titre, catégorie, priorité, description.
  - Signalée par le locataire (celui en place sur le lot), le propriétaire ou le gestionnaire.
  - Planification facultative : date de passage, prestataire, coût estimé, prise en charge.
  - Le statut évolue depuis la fiche. Exception : ajouter une date de passage à une demande
    nouvelle la rend « planifiée » (et la retirer la ramène à « nouvelle »).
  - Pré-remplissage depuis `?property=` et `?unit=`.

### Rapports (`/reports`)

- **Filtres** (dans l'URL) : période (12 derniers mois glissants, année en cours ou l'une des
  deux précédentes, sans dépasser le mois courant) et bien (tous ou un seul).
- **Indicateurs** de la période : loyers encaissés sur l'attendu, taux de recouvrement et
  impayés, dépenses d'entretien (interventions terminées, part du propriétaire), résultat net
  (encaissé − dépenses du propriétaire).
- **Loyers encaissés** par mois (histogramme partagé avec le tableau de bord, mois courant
  en rouge s'il fait partie de la période), export CSV.
- **Dépenses par catégorie** (barres horizontales), avec la part propriétaire / refacturée au
  locataire.
- **Performance par bien** : occupation à date, attendu, encaissé, recouvrement, impayés,
  dépenses, résultat net, ligne de total ; trié par résultat net ; export CSV.
- **Impayés par ancienneté** (1–30, 31–60, 61–90, plus de 90 jours) et **principaux débiteurs**,
  à date (indépendants de la période).
- Les loyers sont comptés par mois d'échéance (attendu et réglé pour ce mois), les dépenses
  par date de fin d'intervention.
- **CSV** : séparateur `;`, BOM UTF-8 (ouverture directe dans Excel en français), montants
  bruts en XOF.

### Paramètres (`/settings`, onglet dans `?tab=`)

- Enregistrés dans le navigateur (`domely-settings`), conservés au rechargement.
- **Profil** : nom, e-mail, téléphone. Le prénom personnalise le titre du tableau de bord
  (« Bonjour Fatou, »).
- **Organisation** : type (particulier, agence, société), nom, identifiant légal (NINEA, RCCM,
  IFU…), pays, ville, adresse, téléphone, e-mail. Le nom et les coordonnées **signent les
  relances**.
- **Préférences** : langue, devise d'affichage et thème (appliqués immédiatement) ; taux GNF
  (l'EUR reste à parité fixe) ; réinitialisation de tous les paramètres, avec confirmation.
- **Location** : valeurs proposées à la création d'un contrat (jour d'échéance, durée de 12,
  24 ou 36 mois, reconduction tacite, dépôt en mois de loyer pour l'habitation et pour le
  commercial / professionnel).
- **Messages** : modèle de relance avec variables `{{name}}`, `{{month}}`, `{{unit}}`,
  `{{property}}`, `{{amount}}`, `{{date}}`, aperçu et retour au modèle par défaut. Un modèle
  identique au modèle par défaut n'est pas enregistré, pour continuer à suivre la langue.

---

## 9. Règles métier clés (résumé)

- Un lot ne peut avoir qu'**un contrat à la fois** : pas de chevauchement de périodes entre
  contrats non résiliés.
- Occupation d'un lot = contrat `active` ou `expired`. Le loyer affiché pour un lot loué est
  celui du contrat.
- Locataire « en retard » = au moins une échéance `late` ou `partial`.
- Un « bail bientôt échu » se termine dans les **90 jours** (`LEASE_ENDING_DAYS`).
- Références : contrats `BAIL-<année de début>-NNNN`, interventions `INT-<année du signalement>-NNNN`.
- Intervention « à traiter » = `new`, `scheduled` ou `inProgress`.

---

## 10. Tests

- **Playwright e2e** dans `front/e2e/` (≈ 120 tests), fichiers par module : `auth`, `landlords`, `smoke`, `theme`,
  `sidebar`, `i18n`, `dashboard`, `currency`, `properties`, `property-form`, `tenants`,
  `tenant-form`, `contracts`, `rents`, `maintenance`, `reports`, `settings`.
- Les tests tournent sur un **build de production** servi par `vite preview` sur le port
  **4173** (`reuseExistingServer: false`), sous Chrome système, en locale `fr-FR`.
  Le serveur de dev n'est pas utilisé : il est trop instable pour les tests.
- **Session** : les tests démarrent connectés au compte de démonstration propriétaire
  (`storageState: e2e/fixtures/auth-state.json` dans `playwright.config.ts`). Pour le compte
  agence : `test.use({ storageState: 'e2e/fixtures/agency-auth-state.json' })` (`landlords`). `auth.spec.ts`
  repart d'un état vide (`test.use({ storageState: { cookies: [], origins: [] } })`).
- Code OTP : saisir avec `getByLabel('Code de vérification (6 chiffres)').fill('123456')`.
  Téléversement : `page.waitForEvent('filechooser')` puis `setFiles({ name, mimeType, buffer })`.
- Le serveur MCP Playwright sert aux vérifications visuelles (captures desktop et mobile,
  débordement horizontal).
- Bonnes pratiques :
  - Les données étant en mémoire, **pas de `page.goto` après une mutation** : naviguer par
    clic pour conserver l'état.
  - Les montants des loyers dépendent de la date du jour : tester des comportements ou des
    variations relatives, pas des totaux figés.
  - Pour l'ancêtre « carte » d'un élément :
    `xpath=ancestor::*[contains(concat(" ",@class," ")," card ")][1]`
    (`contains(@class,"card")` attrape aussi `card__title`).
  - Libellés ambigus : utiliser `exact: true` (ex. « Payé » / « Impayé », « Prestataire » /
    « Téléphone du prestataire ») et cibler les lignes (`getByRole('row')`) ou l'en-tête de la
    fiche plutôt que des options de liste cachées.
  - Après un clic de navigation, attendre l'URL (`toHaveURL`) avant de vérifier le contenu.
  - Saisir une date : focaliser le premier segment du groupe puis taper `jjmmaaaa`.
  - Liste avec recherche (`ComboBox`) : taper la recherche, attendre l'option, puis la choisir
    **au clavier** (`ArrowDown` jusqu'à sa position, `Enter`). Le clic sur l'option est instable
    pendant l'animation d'ouverture, surtout sous la charge de la suite complète. Ne pas
    supposer un seul résultat (« abdoulaye » en trouve deux).
  - Lien d'une page qui vient de s'afficher après une mutation (création…) : si le clic attend
    en vain un élément « stable », l'activer au clavier (`focus()` puis `Enter`).
  - Machine de développement à 2 cœurs : la suite complète prend environ 8 min avec 2 workers
    (valeur par défaut) ; davantage de workers sature la machine et fait échouer des tests.
  - Export de fichiers : `page.waitForEvent('download')` puis lire `download.path()`.

---

## 11. Pièges connus

- **`NumberField` et `step`** : React Aria arrondit la valeur au multiple de `step`. Ne jamais
  mettre de `step` sur un montant (383 000 deviendrait 385 000).
- **Fenêtres avec validation** : effacer une erreur au blur fait rétrécir la fenêtre sous le
  curseur, et le clic sur le bouton tombe à côté. Utiliser `reValidateMode: 'onSubmit'` dans
  les fenêtres de formulaire.
- **`useSearchParams`** : une mise à jour fonctionnelle lancée juste après une navigation
  peut partir de paramètres périmés (course) ; dans les tests, attendre l'affichage du nouvel
  état.
- **Identifiants de lots** : uniques par bien seulement (`apt-1` existe dans plusieurs biens).
  Toujours raisonner en `propertyId` + `unitId`.
- **Hooks et effets** : éviter `setState` synchrone dans un effet (règle de lint). Initialiser
  l'état directement et remonter le composant via `key`.
- **Bouton désactivé et `NumberField`** : un champ numérique ne valide sa saisie qu'au blur, et
  cliquer sur un bouton désactivé ne déplace pas le focus. Ne pas désactiver un bouton
  « Enregistrer » en attendant que le formulaire soit « modifié » : la saisie ne serait jamais
  enregistrable.
- **Cartes mobiles dans une grille** : un élément de grille garde la largeur de son contenu ;
  mettre `min-w-0` sur le `<li>` pour que les textes `truncate` ne fassent pas déborder la page.
- Après chaque `Write`/`Edit` d'un fichier formaté, Prettier peut reformater : relire avant
  une modification ciblée.

---

## 12. Préparation de l'API (à venir — dossier `api/`)

Le front est prêt à être branché : remplacer les implémentations de `features/*/api.ts` par
des appels HTTP (client dans `src/services/`, URL `VITE_API_URL`).

Ressources pressenties (REST, montants en XOF, dates ISO) :

| Ressource         | Opérations                                                                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/properties`     | liste (filtres, pagination), détail, création, modification                                                                                                                                                           |
| `/landlords`      | liste, détail, création, modification ; unicité du téléphone ; rattachement des biens (`landlordId`)                                                                                                                  |
| `/tenants`        | liste, détail, création, modification ; unicité du téléphone                                                                                                                                                          |
| `/leases`         | liste, détail, création (contrôle des chevauchements), modification, `POST /leases/:id/terminate`                                                                                                                     |
| `/rent-dues`      | échéances calculées (par mois, impayés), indicateurs                                                                                                                                                                  |
| `/payments`       | création, annulation                                                                                                                                                                                                  |
| `/reminders`      | création, historique ; plus tard, envoi serveur (WhatsApp, SMS, e-mail)                                                                                                                                               |
| `/exchange-rates` | taux XOF → EUR / GNF                                                                                                                                                                                                  |
| `/dashboard`      | agrégats (encaissements sur 12 mois, impayés, occupation)                                                                                                                                                             |
| `/interventions`  | liste, détail, création, modification, transitions de statut (planifier, démarrer, terminer, annuler, rouvrir)                                                                                                        |
| `/providers`      | (plus tard) annuaire des prestataires                                                                                                                                                                                 |
| `/auth/*`         | connexion (identifiant + mot de passe), déconnexion, inscription, envoi et vérification OTP (SMS), récupération (lien de réinitialisation, envoi de l'identifiant), réinitialisation, téléversement des justificatifs |
| `/settings`       | paramètres du compte et de l'organisation (aujourd'hui dans le navigateur)                                                                                                                                            |
| `/reports/*`      | agrégats par période et par bien ; exports CSV / PDF générés côté serveur                                                                                                                                             |

Points à trancher côté API :

- authentification : jetons (cookie `httpOnly` recommandé), durée de session, hash des mots
  de passe, limitation des tentatives, envoi réel des SMS et e-mails ; énumération des comptes
  (la récupération signale aujourd'hui « aucun compte ne correspond ») ;
- comptes multi-utilisateur d'une agence, rattachement propriétaire mandant ↔ professionnel ;
- où sont calculées les échéances (serveur recommandé) et leur historisation ;
- génération des quittances PDF ;
- envoi des relances ;
- téléversement des documents (bail signé, pièces d'identité, photos des biens).

---

## 13. Limites connues et feuille de route

**Déjà livré** : initialisation, PWA, thème clair et sombre, i18n, devises, authentification
(simulée), tableau de bord, et tous les modules : Biens, Locataires, Contrats, Loyers (encaissement et relance),
Interventions, Rapports et Paramètres.

Les limites ci-dessous sont **connues et assumées** à ce stade ; elles sont à traiter par la
suite. Quand une limite est levée, la retirer de cette liste et mettre à jour la section 8.

### Transverse

- **Pas d'API** : données de démonstration en mémoire, perdues au rechargement (sauf les
  paramètres, dans le navigateur). Pas de synchronisation entre appareils ni de mode hors ligne.
- **Authentification simulée** dans le navigateur : mots de passe en clair dans `localStorage`,
  code OTP fixe `123456` (aucun SMS), aucun e-mail envoyé (lien de réinitialisation et
  identifiant affichés à l'écran), justificatifs non envoyés (métadonnées seulement), pas
  d'expiration de session ni de verrouillage après échecs.
- Les données (biens, loyers…) sont **les mêmes pour tous les comptes** : pas de
  cloisonnement par compte, ni de droits selon le profil ; les paramètres et le prénom du
  tableau de bord ne viennent pas du compte connecté.
- Pas de validation des justificatifs côté Domely (le statut reste « vérification en cours »),
  pas de modification du mot de passe ni des informations du compte depuis l'application.
- Cloche de **notifications** du header non branchée.
- Pas de **suppression** ni d'**archivage** (biens, locataires, contrats, interventions).
- Pas de **pièces jointes** (photos, baux signés, pièces d'identité, factures).
- Tests uniquement **e2e** (pas de tests unitaires des calculs métier) ; données fictives des
  loyers et interventions **relatives à la date du jour**.

### Tableau de bord

- Carte « Échéances à venir » (assurance, révision, état des lieux) : **données fictives**.
- Indicateurs « +N ce mois-ci » (biens ajoutés, nouveaux locataires) : **données fictives**.
- Bouton **« Relancer »** de la carte « Loyers en retard » : **non branché** (la relance
  fonctionne depuis la page Loyers).

### Biens

- Pas de suppression ni de photos.
- Occupation affichée **à date** uniquement (pas d'historique).
- Identifiants de lots uniques par bien seulement (`propertyId` + `unitId`).

### Bailleurs

- Données **communes à tous les comptes** (pas de cloisonnement par agence).
- Pas de suppression ni d'archivage ; pas de création rapide depuis le formulaire de bien (le
  lien ouvre le formulaire bailleur et quitte celui du bien).
- Honoraires **estimés** (taux × loyers des lots loués) : ni encaissement réel, ni reversement
  au bailleur, ni compte rendu de gestion.
- Pas de documents du mandat (mandat signé, RIB, pièce d'identité).

### Locataires

- La fiche ne liste que les **baux en cours** : pas d'historique des baux passés.
- « Sans bail » ne distingue pas un ancien locataire d'un futur locataire.
- Unicité vérifiée sur le téléphone uniquement (pas sur l'e-mail ni la pièce d'identité).

### Contrats

- Pas d'action **« Renouveler »** pour un contrat échu (on le modifie ou on le résilie).
- Une résiliation enregistrée **ne peut pas être annulée**.
- Pas de génération du bail (PDF), de signature, d'**état des lieux** ni de suivi de la
  **restitution du dépôt de garantie**.
- Pas de **révision / indexation** du loyer.
- Le seuil « bail bientôt échu » est fixé à **90 jours** (`LEASE_ENDING_DAYS`), non
  configurable.

### Loyers

- Pas de **quittance** de loyer (PDF / impression).
- Pas d'**annulation d'un encaissement** dans l'interface (prévue côté données :
  `cancelPayment`).
- Pas de **prorata** du premier ni du dernier mois.
- Un paiement s'impute sur **une seule échéance** : pas de répartition automatique d'un
  versement sur plusieurs mois, ni de trop-perçu / avoir.
- Pas de pénalités de retard.
- Relances **envoyées depuis l'appareil** (WhatsApp, SMS, e-mail) : pas d'envoi serveur, pas de
  relances automatiques, historique perdu au rechargement.
- Pas de rapprochement bancaire ni Mobile Money.

### Interventions

- Pas d'**annuaire des prestataires** : nom et téléphone saisis à chaque intervention.
- Pas de photos ni de devis / factures joints.
- Démarrer une intervention ne passe pas le lot en **« en travaux »**.
- « À la charge du locataire » est informatif : le coût n'est **pas refacturé** sur ses loyers.
- Pas d'interventions récurrentes (entretiens annuels).

### Rapports

- Pas d'**export PDF** ni de mise en page d'impression (exports CSV uniquement).
- Pas de **comparaison** d'une période à l'autre.
- Occupation **à date** (pas d'évolution dans le temps).
- Loyers comptés **par mois d'échéance** (et non par date d'encaissement) ; dépenses limitées
  aux interventions terminées.
- Pas de déclaration de revenus fonciers ni de vue fiscale.

### Paramètres

- Enregistrés **dans le navigateur** : propres à l'appareil, non partagés.
- Changer d'onglet sans enregistrer **perd les modifications** sans avertissement (la garde
  ne protège que la sortie de la page).
- Pas de logo de l'organisation, ni d'utilisateurs et de droits.
- Seul le taux GNF est modifiable (EUR à parité fixe) ; pas de récupération automatique des taux.

### Prochaines grandes étapes

- API (`api/`) : persistance, comptes et droits, calcul serveur des échéances, envoi des
  relances, génération des PDF (baux, quittances, rapports), téléversement des documents.
- Application mobile (`mobile/`).

---

## 14. Historique des livraisons (front, `main`)

| Commit    | Contenu                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------- |
| `c0abb04` | Initialisation : Vite, Tailwind, HeroUI, i18n, PWA, Playwright                                  |
| `a1be7bf` | Tableau de bord, menu mobile, devises XOF / EUR / GNF                                           |
| `1ca4a85` | Carte Occupation de hauteur fixe                                                                |
| `2193478` | Biens : liste et fiche                                                                          |
| `6842285` | Biens : formulaire et pagination                                                                |
| `a1a652a` | Locataires : liste, fiche, formulaires                                                          |
| `44dc41c` | Contrats : liste, fiche, création, modification, résiliation                                    |
| `091f681` | Loyers : échéances, encaissements, impayés, relances ; dashboard branché                        |
| `8571a9e` | `CLAUDE.md` du front (renvoie vers ce fichier)                                                  |
| `9194948` | `AGENTS.md` déplacé dans `front/` (versionné avec le front)                                     |
| `d108003` | Interventions : liste, fiche, cycle de vie, formulaire ; onglet bien ; dashboard                |
| `fc25403` | Rapports : indicateurs, revenus mensuels, performance par bien, impayés, dépenses, CSV          |
| `fab5dc2` | Paramètres : profil, organisation, préférences et taux, défauts des baux, modèle de relance     |
| `1d6cb56` | Authentification : connexion, inscription (OTP, justificatifs), récupération, agence en en-tête |
| `565aee5` | Bailleurs (comptes professionnels) : liste, fiche, formulaire ; bailleur des biens              |
| `4965203` | Tests : création de contrat stabilisée (liste avec recherche au clavier)                        |
| `6b79e36` | Chargement des pages à la demande (fichier principal de 1,69 Mo à 413 Ko)                       |
