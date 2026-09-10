# RAPPORT — GRILLE 3×2 DES 6 ACADÉMIES

Date : 2026-09-10
Page : `#/academies` — `src/ela/pages/academies-public.page.js`
Statut : **TERMINÉ**

---

## 1. Problème

L'exécution précédente est restée bloquée pendant la génération de previews
headless Edge (processus `msedge.exe --headless` non terminé). La mission
n'avait donc pas pu être finalisée : l'ordre d'affichage des académies n'était
pas garanti en grille 3×2, le CSS était incomplet et aucune vérification
responsive/RTL n'avait été faite.

Diagnostic réel : un processus Edge headless orphelin (PID 25296) tournait
encore au redémarrage, ce qui bloquait toute nouvelle génération de previews.
Tous les processus Edge headless ont été tués et la vérification visuelle a été
reprise via le **Chrome DevTools Protocol (CDP)** — mesure du layout en direct,
sans screenshot bloquant.

---

## 2. Solution

### Markup (`academies-public.page.js`)
- Rendu des 6 académies dans l'ordre `ACADEMY_ORDER = FR, DE, ZH, EN, AR, RU`.
- Chaque carte est un `<article>` avec hiérarchie claire :
  numéro (`01`…`06`) → code (`FR`…`RU`) → nom → langue native → description →
  certification → CTA unique.
- `Francophone Academy` reste le flagship (badge « FLAGSHIP ACADEMY » +
  traitement doré).
- Échappement systématique (`escapeHtml`) de toutes les valeurs injectées.
- `dir="ltr"` sur le code, `dir="auto"` sur la langue native (RTL-safe).

### CSS (`assets/css/main.css`)
- `.academies-grid` : vraie grille CSS.
  - **Desktop : `repeat(3, minmax(0, 1fr))`** (3 colonnes × 2 lignes).
  - **Tablette (≤ 1024px) : `repeat(2, minmax(0, 1fr))`** (768px inclus).
  - **Mobile (≤ 767px) : `1fr`** (1 colonne).
- Cartes de hauteur égale (`display:flex; flex-direction:column`), description
  en `flex:1`, CTA poussé en bas → **CTA alignés sur toutes les cartes**.
- CTA `.btn-subscribe` pleine largeur, cible tactile ≥ 48px.
- Correctif anti-scroll horizontal du header : retour à la ligne autorisé sur
  `.nav`, `.nav-links`, `.nav-right` en dessous de 1200px (les 8 liens + le
  sélecteur 6 langues + le CTA débordaient entre ~721px et ~1200px).

### Service Worker (`sw.js`)
- Cache PWA bumpé `ela-pwa-v4` → **`ela-pwa-v5`** pour forcer la reprise du
  nouveau CSS chez les visiteurs existants.

---

## 3. Fichiers modifiés

| Fichier | Nature |
|---|---|
| `src/ela/pages/academies-public.page.js` | Markup des 6 cartes + grille |
| `assets/css/main.css` | Grille 3×2 / 2 / 1, cartes, CTA, RTL, anti-scroll nav |
| `sw.js` | Cache PWA v5 |
| `RAPPORT-ACADEMIES-GRID.md` | Ce rapport |

---

## 4. Agents marketing consultés

Aucun agent relancé. L'exécution précédente n'avait produit aucune
recommandation spécifique à la grille ; les audits marketing déjà présents
(`RAPPORT-ELA-WEBSITE-MARKETING-AUDIT.md`, `RAPPORT-ELA-WEBSITE-ACTION-PLAN.md`,
`RAPPORT-FINAL-MARKETING-AGENTS.txt`) ont été réutilisés. Les décisions de
design (hiérarchie par carte, flagship Francophone, CTA unique, H1 unique) vont
dans le sens des recommandations déjà documentées (QW-8 H1, QW-12 CTA unifiés).

---

## 5. Tests

### Tests statiques
- `node --check` / `--input-type=module --check` : **OK** sur
  `academies-public.page.js`, `academies.config.js`, `dom.js`,
  `i18n-helpers.js`, `sw.js`.
- Équilibre des accolades CSS : **758 ouvrantes / 758 fermantes**.
- Vérification statique du grid : base 3 colonnes, tablette 2, mobile 1,
  carte flex column, CTA pleine largeur, RTL (`unicode-bidi`), description
  `flex:1` → **8/8 PASS**.
- 21 clés i18n vérifiées présentes dans les 7 dictionnaires
  (`en, fr, de, es, zh, ar, ru`).
- Rendu JS exécuté pour les 6 langues d'interface (mock i18n) :
  ordre `FR,DE,ZH,EN,AR,RU`, numéros `1..6`, 6 CTA, aucune académie ES,
  `dir="auto"` présent, certifications réelles (CECRL, Goethe-Zertifikat, HSK,
  IELTS, ALPT, TORFL) → **6/6 PASS**.

### Test de layout réel (CDP, Edge headless)
Mesure directe de `scrollWidth` / `clientWidth`, du nombre de colonnes et de
l'ordre des cartes, sur 14 largeurs :

| Largeur | Colonnes | Lignes | Cartes | Scroll horizontal |
|---|---|---|---|---|
| 1440 | 3 | 2 | 6 | non |
| 1366 | 3 | 2 | 6 | non |
| 1280 | 3 | 2 | 6 | non |
| 1201 | 3 | 2 | 6 | non |
| 1200 | 3 | 2 | 6 | non |
| 1100 | 3 | 2 | 6 | non |
| 1024 | 2 | 3 | 6 | non |
| 900  | 2 | 3 | 6 | non |
| 768  | 2 | 3 | 6 | non |
| 600  | 1 | 6 | 6 | non |
| 480  | 1 | 6 | 6 | non |
| 390  | 1 | 6 | 6 | non |
| 360  | 1 | 6 | 6 | non |
| 320  | 1 | 6 | 6 | **oui (footer)** |

> À 320px (largeur extrême, hors cible mobile usuelle), le débordement
> provient du **footer** (pré-existant, indépendant de la grille). De 360px à
> 1440px, **aucun scroll horizontal**.

### RTL (arabe)
Après passage de l'interface en `ar` : `dir="rtl"`, `lang="ar"`, la grille
s'écoule de droite à gauche (carte 01 à droite), titres et langue native
corrects (`الأكاديمية الفرنكوفونية`, `العربية`), **aucun scroll horizontal**,
6 cartes, 3 colonnes → **RTL OK**.

---

## 6. Responsive

- **Desktop** : 3 colonnes × 2 lignes — `01 FR | 02 DE | 03 ZH` /
  `04 EN | 05 AR | 06 RU`.
- **Tablette** : 2 colonnes.
- **Mobile** : 1 colonne.

---

## 7. Vérifications métier

- 6 académies présentes et dans le bon ordre : **OUI**.
- `ES` n'apparaît **PAS** comme académie ni langue enseignée : **OUI**
  (aucune trace de *spanish / hispanophone / 'ES'* dans le code des académies).
- `RU` (Russophone Academy) présent : **OUI** (position 06).
- CTA alignés en bas de chaque carte : **OUI**.
- Aucun scroll horizontal (360 → 1440px) : **OUI**.

---

## 8. Production

- Commit : `f50a7b1` — `feat(academies): grille 3x2 responsive, cartes premium, CTA alignes, RTL, anti-scroll`
- Firebase Hosting : `ela-academy-7f868` — **deploy complete**
  - URL : https://elaacademy.ng/ (et https://ela-academy-7f868.web.app)
  - 164 fichiers traités, 3 nouveaux uploadés, version publiée.

### Vérification production (CDP sur le site live)
| Contexte | Cartes | Colonnes | Ordre | Scroll horizontal |
|---|---|---|---|---|
| Desktop (1440) | 6 | 3 | FR,DE,ZH,EN,AR,RU | non |
| Tablette (900) | 6 | 2 | FR,DE,ZH,EN,AR,RU | non |
| Mobile (390) | 6 | 1 | FR,DE,ZH,EN,AR,RU | non |
| RTL arabe (1280) | 6 | 3 | flux droite→gauche | non |

- `sw.js` servi en production : `ela-pwa-v5` — **OK**.
- CSS servi : `repeat(3, minmax(0, 1fr))`, `@media max-width:1024px`,
  `@media max-width:767px`, `@media max-width:1200px` (nav) — **OK**.
- JS servi : `.academy-card-code`, `russophone`, aucune trace ES — **OK**.
- **PROD OK : true**.

---

## 9. Résultat

Grille 3×2 opérationnelle, responsive (3/2/1), RTL validé, 6 académies dans
l'ordre attendu, ES exclu, RU présent, CTA alignés, aucun scroll horizontal de
360 à 1440px. Mission terminée.
