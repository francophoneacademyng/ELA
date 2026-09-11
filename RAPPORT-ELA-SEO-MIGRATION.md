# RAPPORT — ELA SEO MIGRATION (Mission 6)

**Date :** 11 septembre 2026
**Objet :** SEO technique complet + migration des URLs hash (`#/route`) vers des URLs propres crawlables (`/route`).
**Statut :** livré, testé, déployé et vérifié en production.
**Commit :** `62c7d24` — `feat(seo): migration URLs propres + shells SEO + sitemap/robots + hreflang`
**Règle respectée :** aucune campagne/publicité/email/publication ; ES reste masqué ; aucune donnée commerciale inventée.

---

## 1. Architecture actuelle (avant migration)

- **SPA vanilla JS** (pas de build/SSR), un seul document `index.html`.
- **Routeur :** `js/app.js` — routage par hash (`#/academies`), table `ROUTES` + handlers dynamiques `window.ELA_ROUTE_HANDLERS` enregistrés par `js/routes-v2.js`.
- **Pages modules :** `src/ela/pages/*` (academies, free-trial, lead-magnets), `src/academies/*`, `js/admin/*`, `js/teacher/*`.
- **Firebase Hosting :** `public: "."`, rewrite `** → /index.html` (fallback SPA), redirect www → apex, headers de type MIME.
- **i18n :** `js/i18n.js`, langues actives `en/fr/ar/de/ru/zh` (ES masqué), `dir=rtl` pour AR.
- **Tracking :** `js/marketing.js` (GA4 + Firestore `marketingEvents`).
- **PWA :** `sw.js` (cache `ela-pwa-v5`, network-first navigation).
- **SEO existant :** `robots.txt` (Allow all + sitemap), `sitemap.xml` (2 URLs), metas dans `index.html`, JSON-LD Organization/WebSite/Course/FAQ, canonical fixe `https://elaacademy.ng/`.
- **Problème structurel :** toutes les routes partagent l'URL `https://elaacademy.ng/#/...` → une seule URL crawlable, pas de canonical/hreflang/sitemap par page.

## 2. Problème hash routing

Les fragments (`#...`) ne sont **jamais envoyés au serveur** et ne constituent pas des URLs distinctes pour les moteurs. Conséquences : impossibilité d'un canonical par page, hreflang invalide, sitemap inexploitable, titres/meta dépendants uniquement de JS. Google peut exécuter le JS, mais sans URL propre l'indexation multi-pages est compromise.

## 3. Architecture choisie

**Migration progressive, non destructive, à double mode :**

1. **Routeur dual-mode** : le routeur lit désormais `location.pathname` (URL propre) **et** `location.hash` (héritage). Un lien `#/academies` est converti au chargement en `/academies` via `history.replaceState` (sans rechargement).
2. **Interception des clics** : un écouteur document (capture) transforme les clics sur liens internes en navigation SPA (`pushState` + `route()`), sans rechargement, pour URLs propres **et** hash. Les liens externes, ancres, `mailto/tel`, `download`, nouveaux onglets et fichiers statiques sont laissés intacts.
3. **Réécriture des hrefs** : après chaque rendu, les liens `#/…` deviennent `/…` (crawlables).
4. **Coquilles statiques (prerender-lite)** : 16 fichiers HTML générés depuis `index.html` avec un `<head>` propre par route (title, description, canonical, OG, Twitter, hreflang, JSON-LD) + `<noscript>`.
5. **Firebase Hosting `cleanUrls`** : `/academies` sert `academies.html` ; `/academies.html` redirige (301) vers `/academies` ; le fallback `** → /index.html` reste pour les routes sans fichier.
6. **`<base href="/">`** : correctif indispensable pour que les routes imbriquées (`/lead-magnets/de`) résolvent correctement les assets.

Aucune modification de Firebase Auth, Firestore, Paystack, Cloud Functions, registration, login, pricing, free trial, courses, live.

## 4. Routes publiques

| URL | Contenu | Indexable |
|---|---|---|
| `/` | Accueil | Oui |
| `/academies` | 6 académies | Oui |
| `/pricing` | Tarifs | Oui |
| `/free-trial` | Essai gratuit | Oui |
| `/courses` | Catalogue | Oui |
| `/live` | Cours en direct | Oui |
| `/institutions` | B2B | Oui |
| `/lead-magnets` | Hub guides | Oui |
| `/lead-magnets/{fr,de,zh,en,ar,ru}` | 6 landing pages | Oui |
| `/terms`, `/privacy`, `/refund` | Pages légales | Oui (priorité basse) |
| `/verify.html` | Vérification certificat (fichier statique) | Oui |

## 5. Routes privées

`/dashboard`, `/assistant`, `/admin*`, `/teacher*`, `/checkout`, `/login`, `/register`, `/payment/result`, `/payment-success`, `/course`, `/lesson`, `/quiz`.

Traitement : `meta robots = noindex,nofollow` dynamique (liste `PRIVATE_PATHS` étendue à `/course`, `/lesson`, `/quiz`) **et** blocage dans `robots.txt`. Les zones admin/teacher ne sont jamais rendues crawlables. `/login` et `/register` sont conservés (nécessaires) mais `noindex` + `Disallow`.

## 6. Firebase Hosting — changements

`firebase.json` :
- ajout `"cleanUrls": true` ;
- ajout `"scripts/**"` à la liste `ignore` (les scripts de génération/vérification ne sont pas publiés) ;
- `rewrites`, `redirects` (www → apex), `headers` et fallback SPA **inchangés**.

## 7. Redirects

- `www.elaacademy.ng/** → https://elaacademy.ng/:0` (existant, conservé).
- `/academies.html → /academies` (301, via `cleanUrls`) — vérifié en production.
- Héritage hash → URL propre : conversion **côté client** (`replaceState`), car un fragment n'atteint jamais le serveur. Aucun ancien lien n'est cassé.

## 8. Canonical

- `index.html` : `https://elaacademy.ng/`.
- Chaque coquille : canonical auto-référent (`https://elaacademy.ng/academies`, etc.).
- Dynamiquement, `updateMeta()` réaffirme le canonical selon la route ; en langue non-anglaise (`?lang=fr`), le canonical devient `.../academies?lang=fr` (version linguistique auto-référente).
- Les pages privées reçoivent `noindex,nofollow` et ne sont pas dans le sitemap.

## 9. hreflang

- Support réel de `?lang=` ajouté dans `js/i18n.js` (`langFromUrl()` prioritaire, puis localStorage) et reflété dans l'URL par `replaceState` lors du changement de langue.
- Alternates émis (statiquement dans les coquilles + dynamiquement) : `en, fr, ar, de, ru, zh` + `x-default`, pointant vers `?lang=xx`.
- AR → `dir="rtl"`, `lang="ar"` (vérifié en production).
- ES n'apparaît dans aucune alternate (masqué).
- Limite assumée : les langues sont servies par la même URL de base avec `?lang=` (pas de préfixe `/fr/...`) ; c'est la solution la plus honnête sans fabriquer de fausses traductions.

## 10. Sitemap

`sitemap.xml` réécrit : **18 URLs publiques** (accueil, académies, pricing, free-trial, courses, live, institutions, hub + 6 lead magnets, verify.html, 3 pages légales). Exclus : admin, teacher, dashboard, assistant, checkout, login, register, course/lesson/quiz, payment. `lastmod` = 2026-09-11.

## 11. Robots

`robots.txt` : `Allow: /` puis `Disallow` des zones privées (`/admin`, `/teacher`, `/dashboard`, `/assistant`, `/checkout`, `/login`, `/register`, `/payment/result`, `/payment-success`, `/course`, `/lesson`, `/quiz`). `Allow: /courses` (plus spécifique) pour ne pas bloquer le catalogue. Déclaration `Sitemap: https://elaacademy.ng/sitemap.xml`.

## 12. JSON-LD

Sur chaque page publique :
- `EducationalOrganization` (entité de marque) + `WebSite` (site-wide) ;
- `BreadcrumbList` par page (2 niveaux ; 3 niveaux pour les lead magnets : Home > Free guides > Guide).

L'accueil conserve son graphe existant (dont `Course` pour les 6 académies et `FAQPage`). **Aucune note, review, rating, prix ou donnée commerciale inventée.** `LearningResource` volontairement non ajouté pour éviter toute affirmation non vérifiée.

## 13. Metadata

Pour chaque page : `title` unique (≤ ~60 caractères hors suffixe), `meta description` spécifique et cohérente avec le contenu réel, canonical, `og:title/description/url`, `twitter:title/description`, `robots`. Titres distincts pour les 6 lead magnets (ex. « Free Goethe-Zertifikat Study Guide »). Fallback anglais si une traduction manque.

## 14. Performance

- Aucun nouveau JS/CSS runtime ; `app.js` augmente d'environ 200 lignes (routeur/SEO), pas de dépendance ajoutée.
- Les coquilles pèsent ~12 Ko chacune (comme `index.html`) mais **une seule est servie par navigation** : pas d'impact sur le chemin critique.
- `cleanUrls` évite des redirections en chaîne ; `headers` MIME inchangés.
- `sw.js` bumpé `ela-pwa-v5 → v6` pour invalider le cache des anciens clients (sinon l'ancien `app.js` hash-routing resterait servi).
- `<base href="/">` évite des requêtes 404 inutiles sur les routes imbriquées.

## 15. Tests

**Automatiques (local + production) :**
- `node --check` : `app.js`, `i18n.js`, `dom.js`, `sw.js`, scripts générateur/vérificateur — OK.
- `scripts/verify-seo-pages.js` : 16 coquilles × (title, description, canonical, og:url, twitter, robots, noscript, hreflang × 7, JSON-LD) — **ALL SEO PAGE CHECKS PASSED**.
- Routage (CDP, local puis production) : clean `/academies`, titre, canonical, robots ; **hash hérité `/#/academies` → `/academies`** ; `/lead-magnets/de` (formulaire) ; `?lang=fr` ; `?lang=ar` RTL ; `/login` noindex ; 404 noindex ; clic SPA → `/academies` — **ALL PASSED**.
- Layout (CDP, production) : 4 viewports (320/375/768/1280) × 10 routes publiques → **aucun scroll horizontal** (offenders hors conteneurs scrollables = 0) ; RTL AR = 0 overflow — **ALL PASSED**.
- Régression (CDP, local) : 17 routes publiques + privées rendues correctement — **ALL PASSED**.
- Formulaire lead magnet (CDP) : nom vide / email invalide / consentement manquant → messages corrects, aucune écriture.
- JSON i18n : 6 fichiers valides (clés `notFound.*` ajoutées).

**Non testé volontairement :** soumission réelle d'un formulaire (écriture Firestore), parcours d'authentification réel (Firebase), paiement Paystack — inchangés par la mission.

## 16. Deployment

- `firebase deploy --only hosting --project ela-academy-7f868` → *182 fichiers*, *release complete*, **Deploy complete**.
- Aucune règle Firestore ni Function modifiée (pas de redeploiement).
- URL hosting : `https://ela-academy-7f868.web.app` — domaine `https://elaacademy.ng`.

## 17. Production verification

**HTTP (18 URLs publiques) :** toutes en **HTTP 200**, avec canonical correct, hreflang, `<base href="/">`, `<noscript>`.
- `/academies.html` → **301 → `/academies`**.
- `/robots.txt` : sitemap déclaré, `/admin` et `/dashboard` bloqués.
- `/sitemap.xml` : contient les URLs publiques, exclut admin/dashboard.

**Client (Chrome headless/CDP) :** URL propre rendue, hash hérité converti, formulaire lead magnet, `?lang=fr`, `?lang=ar` RTL, noindex privé, 404, clic SPA — **ALL PRODUCTION CLIENT CHECKS PASSED**.

**Layout (production) :** mobile 320/375, tablette 768, desktop 1280 × 10 routes → aucun scroll horizontal ; RTL AR OK — **ALL PRODUCTION LAYOUT CHECKS PASSED**.

**Bug réel trouvé et corrigé pendant les tests :** les routes imbriquées (`/lead-magnets/de`) cassaient les chemins d'assets relatifs (`js/app.js` résolu en `/lead-magnets/js/app.js`). Corrigé par `<base href="/">`. Sans les tests de rendu réel, ce bug aurait échappé à une simple vérification « les fichiers existent ».

## 18. Search Console status

**Non soumis.** Aucun accès à Google Search Console depuis cet environnement → `OWNER INPUT REQUIRED`.
À faire par le propriétaire :
1. Vérifier la propriété `elaacademy.ng` (DNS TXT ou fichier HTML).
2. Soumettre `https://elaacademy.ng/sitemap.xml`.
3. Utiliser « Inspection d'URL » sur `/academies`, `/pricing`, `/free-trial`, `/lead-magnets/de`.
4. Surveiller « Couverture » et « Améliorations » après quelques jours.

## 19. OWNER INPUT REQUIRED

1. **Search Console** : vérification de propriété + soumission du sitemap (non réalisable ici).
2. **Domaine** : confirmer que `elaacademy.ng` est bien le domaine canonique (apex) et que le www redirige (déjà configuré).
3. **hreflang / stratégie multilingue** : valider l'approche `?lang=` ou décider d'une migration ultérieure vers des préfixes `/fr/…` (URLs réellement distinctes).
4. **Contenu traduit** : les coquilles servent un `<head>` anglais ; les traductions réelles de contenu sont côté client. Décider si des versions linguistiques statiques sont souhaitées.
5. **Images OG** : `og-image.png` est partagée ; fournir des images par page si souhaité.
6. **Vérification de contenu** : confirmer que `/courses` et `/live` doivent rester indexables même lorsqu'elles sont vides (risque de contenu mince).
7. **Politique légale** : confirmer l'indexabilité de `/terms`, `/privacy`, `/refund`.
8. **Auteur/éditeur** : données d'organisation exactes (adresse, réseaux) pour enrichir le JSON-LD.

## 20. Remaining risks

| # | Risque | Impact | Mitigation |
|---|---|---|---|
| 1 | Sitemap non soumis à Search Console | Moyen | Procédure documentée (section 18) |
| 2 | Contenu des pages rendu côté client (JS requis) | Moyen | Coquilles avec head correct + `<noscript>` ; Google rend le JS. Prerender complet (SSG) possible plus tard |
| 3 | `?lang=` comme alternates hreflang (pas de préfixe) | Faible/Moyen | Support réel de `?lang=` ; migration `/fr/…` recommandée si SEO international prioritaire |
| 4 | Coquilles à régénérer après modification d'`index.html` | Faible | `node scripts/generate-seo-pages.js` + `verify-seo-pages.js` documentés |
| 5 | Pages `/courses` et `/live` potentiellement vides | Faible | À remplir (contenu réel) ; sinon envisager `noindex` temporaire |
| 6 | Service worker : anciens clients | Faible | Cache bumpé v6 ; network-first pour les navigations |

## 21. Prochaine mission recommandée

**Mission 7 — Contenu réel + soumission Search Console + surveillance SEO :**
1. Vérifier la propriété dans Search Console et soumettre le sitemap (OWNER).
2. Compléter le contenu réel : seed francophone manquant, publication des cours/sessions live (`/courses`, `/live`).
3. Envisager un prerender complet (SSG) pour un contenu statique par route (au-delà du head).
4. Migrer, si prioritaire, vers des URLs multilingues `/fr/...` avec canonical/hreflang distincts.
5. Brancher l'automatisation email des lead magnets (restant de la Mission 5) et le dashboard funnel.
