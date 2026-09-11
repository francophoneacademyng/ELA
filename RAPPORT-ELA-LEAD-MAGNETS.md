# RAPPORT — ELA LEAD MAGNETS (Mission 5, reprise et exécution réelle)

**Date :** 11 septembre 2026
**Périmètre :** construire les premiers actifs d'acquisition réels — lead magnets → landing pages → lead capture → free trial → tracking → email nurture préparé.
**Statut :** livré, testé, déployé et vérifié en production.
**Règle respectée :** aucune donnée propriétaire inventée ; aucun email/campagne/publication envoyé.

---

## 1. Agents utilisés

Les 8 agents marketing OpenCode existants (aucun nouvel agent créé) :

1. `marketing-strategist` (arbitre)
2. `market-researcher`
3. `seo-specialist`
4. `content-copywriter`
5. `social-media-manager`
6. `lead-generation-specialist`
7. `email-marketing-specialist`
8. `growth-cro-analyst`

Ils ont été lancés en parallèle sur un socle commun (6 académies, ES masqué, pricing NGN, free trial 12/24 leçons, audience Nigeria/Afrique).

## 2. Contributions de chaque agent

- **Lead Generation Specialist :** a défini les 6 lead magnets, personas, format, valeur concrète, stratégie de gating (name+email, champs optionnels objectif/niveau), CTA free trial, priorisation.
- **Market Researcher :** intentions de recherche par langue, motivations (études/travail/bourse/business), thèmes de mots-clés, concurrents (catégories), angles différenciants, risques, positionnements honnêtes. A signalé l'absence de volumes Nigeria mesurés → hypothèses à valider.
- **SEO Specialist :** title/meta/H1-H2/intention/mots-clés/liens internes/CTA par page + spécification des données structurées. A identifié le **blocage structurel du hash routing** (URL non crawlables, canonical/hreflang non exploitables) → documenté, non contourné par de fausses balises.
- **Content Copywriter :** copy des landing pages (H1, sous-titre, puces, formulaire, FAQ, remerciement), contenu réel des 6 magnets (12 items de checklist + tableaux de 10 phrases), et traductions FR/DE/ZH/AR/RU.
- **Growth/CRO Analyst :** plan CRO étape par étape (PROBLÈME → HYPOTHÈSE → ACTION → KPI), optimisation formulaire (email/validation/mobile/autocomplete), hiérarchie CTA, mobile + RTL, signaux de confiance autorisés, plan de mesure, 5 expériences A/B.
- **Email Marketing Specialist :** séquence 7 emails (timing, objectif, sujet, preheader, corps, CTA, branche), stratégie multi-académie par tokens, multilingue, architecture technique, délivrabilité/conformité, KPI.
- **Social Media Manager :** concepts de posts (LinkedIn/Facebook/Instagram/TikTok/YouTube/WhatsApp), calendrier 4 semaines, hooks vidéo, angle B2B, copie WhatsApp, do-not-say.
- **Marketing Strategist :** arbitrage final — priorisation DE → FR → AR → EN → ZH → RU, funnel état-machine, noms d'événements canoniques, échelle d'offre, séquencement 90 jours, risques, OWNER INPUT REQUIRED.

## 3. Décisions finales

- **6 lead magnets, un par académie** (pas de génériques). ES reste masqué (aucune route, aucune donnée, absent des règles).
- **Priorité d'exécution :** DE, FR, EN, ZH, AR, RU (arbitrage stratégiste croisé avec lead-gen ; les 6 sont construits d'un coup car le coût marginal est faible).
- **Gating à faible friction :** nom + email + académie (pré-sélectionnée) + consentement explicite ; objectif/niveau optionnel. **Aucun téléphone.**
- **Livraison immédiate sur la page** (accès au contenu + téléchargement `.txt`) : la valeur est réelle sans dépendre d'une intégration email non branchée.
- **Email :** séquences rédigées mais **non envoyées** ; aucune automatisation simulée.
- **Tracking :** noms d'événements exacts imposés, ajoutés à la whitelist Firestore sans doublon.
- **SEO :** title/meta dynamiques par route ; JSON-LD dynamique **non ajouté** (hash routing) — recommandation documentée.

## 4. Les six lead magnets

| Code | Académie | Certification | Lead magnet | Checklist | Phrases |
|---|---|---|---|---|---|
| FR | Francophone Academy | CECRL | French A1–A2 Starter Checklist: Your 30-Day Roadmap to Real Conversations | 12 | 10 |
| DE | Germanophone Academy | Goethe-Zertifikat | Germany Study & Ausbildung Prep Checklist (A1–B1) | 12 | 10 |
| ZH | Sinophone Academy | HSK | China Business Mandarin Starter Kit (HSK 1–2 + Supplier Phrases) | 12 | 10 |
| EN | Anglophone Pro Academy | IELTS | IELTS 7+ Professional English Checklist | 12 | 10 |
| AR | Arabophone Academy | ALPT | Gulf Business Arabic Phrasebook + Etiquette Guide | 12 | 10 |
| RU | Russophone Academy | TORFL | Russian Scholarship & TORFL A1 Prep Checklist | 12 | 10 |

Tous les contenus (titre, sous-titre, puces) existent en **EN, FR, DE, ZH, AR, RU** ; repli anglais si une langue manque. Les checklists sont en anglais (conseils d'étude universels) avec tableaux de phrases dans la langue cible (pinyin/translittération inclus pour ZH/AR/RU).

## 5. Landing pages

- **Hub :** `#/lead-magnets` — hero + grille des 6 magnets + CTA.
- **Détail :** `#/lead-magnets/fr|de|zh|en|ar|ru` — fil d'Ariane, badge académie+certification, H1, sous-titre, 5 puces de valeur, ligne de confiance, FAQ, formulaire sticky (desktop).
- **Après capture :** le bloc « What's inside » + checklist numérotée + tableau de phrases + bouton de téléchargement `.txt` + CTA free trial remplacent le formulaire.
- **Navigation :** lien « Free guides » ajouté dans le header et le footer (traduit dans les 6 langues).
- **RTL :** CSS en propriétés logiques (`padding-inline-start`, `text-align: start`, `margin-inline-start`), aucune largeur fixe hors tableau scrollable.

## 6. Lead capture

- **Collection Firestore :** `leadMagnetLeads` (`name`, `email`, `academy`, `goal`, `leadMagnetId`, `source`, `consent: true`, `locale`, `ts`).
- **Règles Firestore** (`firestore.rules`) : `create` autorisé uniquement si email valide, `consent == true`, `academy` ∈ {FR, DE, ZH, EN, AR, RU} (ES exclu), `ts` numérique. `read` admin uniquement. `update`/`delete` interdits.
- **Aucune écriture** en cas d'échec de validation. En cas de Firebase indisponible : message honnête « inscription temporairement indisponible », pas de fausse promesse.
- **Pas d'envoi email réel** : le lead est stocké et le contenu délivré en page.

## 7. Free Trial funnel

`#/lead-magnets/*` → formulaire → capture → contenu + CTA → `#/free-trial` (12 leçons sans compte / 24 avec compte) → `#/register` → `#/pricing` → `#/checkout` → Paystack.

Chaque landing page contient un CTA free trial au-dessus de la ligne de flottaison, après les puces de valeur, dans le remerciement et dans le bloc final. Aucune fonctionnalité existante (Auth, Firestore, Paystack, Functions, i18n, RTL, pricing, register, login, navigation) n'a été modifiée fonctionnellement.

## 8. Email architecture

Document dédié : `docs/ELA-LEAD-MAGNET-EMAIL-SEQUENCES.md`.
- 7 emails (livraison → quick win → méthode → profondeur → invitation trial → branche starter/non-starter → récap final), avec timing, objectif, sujet + alt, preheader, corps, CTA, déclencheur.
- 7 templates + variables par académie (pas 42 emails).
- **Fournisseur existant :** `sendEmail()` (SendGrid v3) dans `functions/core.js`, mode log si clé absente. **Aucune automatisation branchée, aucun envoi effectué.**
- Écart serveur signalé : `EMAIL`/`VALID_INTERFACE_LANGS` ne couvrent que `en/fr/ar` (extension de/ru/zh = OWNER INPUT REQUIRED).

## 9. SEO

- `document.title` dynamique par route via `PAGE_TITLES` ; `meta description` dédiée par page lead magnet via `LEAD_MAGNET_META`.
- Pages publiques (hors `PRIVATE_PATHS`) → `robots: index,follow`.
- Liens internes : hub ↔ 6 magnets, `/academies`, `/courses`, `/pricing`, `/free-trial`, `/lead-magnets`.
- **Limite honnête documentée :** le hash routing empêche des URL uniques crawlables, donc canonical/hreflang/sitemap par route ne peuvent pas être servis correctement. Aucune balise trompeuse n'a été ajoutée. Migration vers des URL propres = prochaine mission recommandée.

## 10. CRO

- Headline = promesse concrète (roadmap/checklist), sous-titre = public + bénéfice, 5 puces de valeur.
- Formulaire court, un seul CTA primaire, micro-copie « we only ask what we need », consentement non pré-coché, labels au-dessus, champs pleine largeur, `inputmode`/`autocomplete` corrects, erreurs inline `role=alert`.
- Hiérarchie CTA : primaire = free trial, secondaire = télécharger le guide.
- Signaux de confiance factuels uniquement : « Real teachers · live classes · verifiable certificate ». Aucun témoignage/statistique/garantie.
- Plan d'expériences A/B (5) documenté par l'analyste (non exécutées — nécessitent du trafic réel).

## 11. Tracking

- **Nouveaux événements :** `lead_magnet_view`, `lead_magnet_start`, `lead_captured`, `lead_magnet_download` (émis par la page), `registration_started`, `registration_completed` (émis dans le parcours d'inscription existant).
- **Déjà présents et réutilisés :** `trial_started` (ouverture d'une leçon d'essai), `pricing_view`, `checkout_started`, `payment_success` (serveur uniquement), `page_view`, `registration`.
- **Whitelist Firestore** `marketingEvents` étendue sans doublon ; `FS_EVENTS` mis à jour. Clic CTA `#/lead-magnets` → `cta_lead_magnet_click` (GA4).
- ES ne peut pas être émis : l'académie est contrainte aux 6 codes dans les règles.

## 12. Content assets

Document dédié : `docs/ELA-LEAD-MAGNET-CONTENT-PLAN.md`.
- 2 concepts de post par plateforme (LinkedIn, Facebook, Instagram, TikTok, YouTube, WhatsApp).
- Calendrier 4 semaines (~4 posts/semaine) avec hook, format, CTA.
- 6 hooks vidéo courts (un par académie).
- 3 posts LinkedIn B2B (écoles, RH, institutions) sans partenaire nommé.
- Copie WhatsApp forwardable par magnet.
- Liste do-not-say + OWNER INPUT REQUIRED. **Rien n'a été publié.**

## 13. Courses / Live — état actuel

- `/courses` : implémentée (`renderCourses` → callable `getCatalog`). Affiche les cours groupés par académie, sinon état vide + formulaire de liste d'attente. **Fonctionnelle, mais dépend du contenu Firestore `courses` (status approved).**
- `/live` : implémentée (`renderLive` → callable `getLiveCatalog`). Affiche les sessions triées, bouton de connexion, sinon état vide + liste d'attente. **Fonctionnelle, dépend des `liveClasses`.**
- **Contenu seed existant :** `data/seed/` contient A1 pour anglophone, arabophone, germanophone, russophone, sinophone. **Manque : francophone (FR).** Aucun cours/classe/professeur/témoignage n'a été fabriqué.
- **Manques précis :** ingérer/publier les cours approuvés, ajouter le seed FR, planifier des sessions live réelles, vérifier que `getCatalog`/`getLiveCatalog` renvoient des données en production.

## 14. Fichiers créés

- `src/ela/data/lead-magnets.data.js` — 6 magnets, contenu multilingue, checklists, phrases, FAQ.
- `src/ela/pages/lead-magnets.page.js` — hub + landing pages + formulaire + capture + tracking + téléchargement.
- `docs/ELA-LEAD-MAGNET-EMAIL-SEQUENCES.md` — séquences email 1–7 préparées.
- `docs/ELA-LEAD-MAGNET-CONTENT-PLAN.md` — plan social/contenu.
- `RAPPORT-ELA-LEAD-MAGNETS.md` — ce rapport.

## 15. Fichiers modifiés

- `js/routes-v2.js` — enregistrement des routes `/lead-magnets` + 6 slugs.
- `js/app.js` — `PAGE_TITLES`, `LEAD_MAGNET_META`, tracking `registration_started`/`registration_completed`.
- `js/marketing.js` — whitelist `FS_EVENTS` étendue + clic CTA lead magnet.
- `index.html` — liens nav/footer « Free guides ».
- `assets/css/main.css` — styles lead magnets (responsive, RTL-safe).
- `i18n/en|fr|de|zh|ar|ru.json` — 33 clés × 6 langues (`nav.guides` + `leadMagnets.*`).
- `firestore.rules` — collection `leadMagnetLeads` + whitelist `marketingEvents` étendue.
- `js/routes-v2.js`, `js/app.js`, `js/marketing.js` — vérifiés par `node --check`.

## 16. Tests

| Test | Méthode | Résultat |
|---|---|---|
| Syntaxe JS | `node --check` sur page, data, routes-v2, app.js, marketing.js | ✅ |
| JSON i18n | `JSON.parse` des 6 fichiers + clés présentes | ✅ 33 clés × 6 |
| Intégrité data | import Node : 6 magnets, 6 langues, 12 items, 10 phrases | ✅ |
| Rendu hub | Chrome headless : 6 cartes, titre, nav « Free guides » | ✅ |
| Rendu détail DE | H1, formulaire, champs, consentement, FAQ, CTA | ✅ |
| Contenu gated | checklist absente avant capture | ✅ |
| Régression routes | home, academies, free-trial, pricing, courses, live | ✅ |
| Validation formulaire (prod) | CDP : nom vide, email invalide, consentement manquant | ✅ 3 messages corrects, aucune écriture |
| RTL arabe (prod) | CDP : `dir=rtl`, `lang=ar`, UI arabe | ✅ |
| Mobile 320 / 375 | CDP : overflow horizontal | ✅ 0 px |
| Tablette 768 | CDP : overflow horizontal | ✅ 0 px |
| Desktop 1280 | CDP : diagnostic `scrollWidth == clientWidth`, 0 élément débordant | ✅ |
| ES masqué | Aucune route/donnée/règle ES | ✅ |

## 17. Commit

- `0d457c3` — `feat(lead-magnets): 6 landing pages acquisition + lead capture + tracking + i18n` (16 fichiers, +1710 / −10).
- Commit du présent rapport : voir historique Git (commit séparé, docs).

## 18. Deployment

- **Firestore rules :** `firebase deploy --only firestore:rules` → *rules file compiled successfully*, *released rules to cloud.firestore*, *Deploy complete*.
- **Hosting :** `firebase deploy --only hosting` → 168 fichiers, *release complete*, *Deploy complete*.
- **Projet :** `ela-academy-7f868` (`https://ela-academy-7f868.web.app`, domaine `https://elaacademy.ng`).
- **Functions :** non redéployées (aucune modification côté functions).

## 19. Production verification

- Assets live (HTTP 200) : `/src/ela/pages/lead-magnets.page.js`, `/src/ela/data/lead-magnets.data.js`, `/js/routes-v2.js`, `/i18n/en.json`, `/i18n/ar.json`.
- `routes-v2.js` contient `/lead-magnets/` et `renderLeadMagnetPage` ; `en.json` contient `"nav.guides": "Free guides"` ; le module contient `leadMagnetLeads`.
- Rendu production (Chrome headless) : hub = 6 cartes + titre ; AR = titre, formulaire, FAQ, contenu gated, aucun ES.
- Validation formulaire testée **en production** via CDP sans écriture Firestore.
- **Non testé volontairement :** soumission valide (créerait un vrai lead). À valider par le propriétaire.

## 20. OWNER INPUT REQUIRED

1. Faits d'examen (frais, centres, formats, dates) pour IELTS, Goethe, DELF/DALF/TCF/TEF, HSK, TORFL, ALPT avant toute publication de chiffres.
2. Relations officielles éventuelles avec les organismes d'examen (les disclaimers supposent « aucune affiliation »).
3. Qualifications des enseignants avant toute affirmation de crédential.
4. Version HSK enseignée (2.0 vs 3.0).
5. Reconnaissance de l'ALPT et du fournisseur.
6. Revue juridique de l'usage nominatif des marques d'examen.
7. Conditions exactes du free trial et lien de vérification des certificats.
8. Politique de remboursement/annulation à afficher au checkout.
9. Témoignages/certifications/partenaires **réels** (sinon rester sans).
10. Baselines analytiques (trafic, leads, conversions) + budget/CAC.
11. Clé SendGrid (scope Mail Send), expéditeur vérifié, SPF/DKIM/DMARC, décision scheduler vs SendGrid Automation.
12. Décision SEO : migration hash → URL propres (prerender/path) pour canonical/hreflang/sitemap.
13. Seed FR manquant et publication des cours/sessions live réels.
14. Validation de la copie arabe et confirmation que l'ES reste masqué.

## 21. Risques

| # | Risque | Impact | Mitigation |
|---|---|---|---|
| 1 | Hash routing → SEO international limité | Moyen | Documenté ; migration URL propres planifiée |
| 2 | Aucune automatisation email branchée → leads non nourris | Élevé | Séquences prêtes ; brancher `onLeadCreated` + scheduler (mission suivante) |
| 3 | Contenu checklist EN pour interfaces DE/ZH/AR/RU | Faible | Copy marketing localisée ; checklist = conseils universels + phrases cibles |
| 4 | Données d'examen pouvant évoluer | Moyen | Aucun chiffre publié ; OWNER INPUT REQUIRED |
| 5 | `leadMagnetLeads` non lisible côté client (admin only) | Faible | Volontaire ; export admin à prévoir |
| 6 | Free trial anonyme non contactable | Moyen | Pousser le compte gratuit (24 leçons) via CTA |

## 22. Prochaine mission

1. **Brancher l'automatisation email** : `onLeadCreated` + fonction planifiée + route de désabonnement, en s'appuyant sur `sendEmail` (SendGrid) et `docs/ELA-LEAD-MAGNET-EMAIL-SEQUENCES.md`.
2. **Migration SEO vers des URL propres** (prerender/SSG ou History API) pour activer canonical, hreflang et sitemap, puis ajouter JSON-LD (`LearningResource`, `BreadcrumbList`).
3. **Compléter le contenu pédagogique** : seed francophone + ingestion/publication des cours et sessions live.
4. **Tableau de bord funnel** : exploiter les événements `lead_magnet_*` → `trial_started` → `payment_success` (par académie et par langue).
5. **Lancer les 5 expériences A/B** documentées par le CRO dès qu'un trafic suffisant est disponible.
