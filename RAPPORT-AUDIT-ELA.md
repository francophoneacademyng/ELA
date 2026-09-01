# RAPPORT D'AUDIT COMPLET — ELA (E-Learn Language Academy)

- **Date de l'audit :** 1er septembre 2026
- **Site live :** https://ela-academy-7f868.web.app
- **Projet Firebase ciblé :** `ela-academy-7f868` (`.firebaserc`)
- **Mode :** lecture seule — aucun fichier de code modifié, aucun déploiement, aucune écriture Firestore/Auth/Paystack. (Le présent fichier `RAPPORT-AUDIT-ELA.md` est le livrable d'audit.)

---

## 0. État Git (demandé en premier)

```
On branch master
nothing to commit, working tree clean
```

5 derniers commits (`git --no-pager log -5 --oneline`) :
```
d439af3 feat: SEO (og:image PNG, sitemap, robots) + bandeau consentement cookies (i18n, GA differe)
fd648f2 feat: admin back-office sidebar + live classes 3 blocs + cartes actionnables + revenus 7/30/90
aed1ef1 feat: tracking Phase 0 (GA4 + marketingEvents Firestore + payment_success webhook) + regles admin
aeac0ee fix: nav par role - documentation durable du mecanisme(liens jamais dans le HTML statique(
7de0c62 design: refonte visuelle panneau admin(header back-office, hero KPI, chart revenus, academies, content center(
```

**Arbre de travail propre.** Toutes les modifications auditées sont déjà commitées et déployées(l'hébergement live correspond au code local réel).

---

## 1. Résumé exécutif (10 lignes max)

ELA est **architecturalement solide et très avancé** : c'est une SPA (18 routes) proprement adaptée du modèle FA vers une **académie multi-langues** (5 académies)german/mandarin/english/arabic/russian), avec un backend de 18 Cloud Functions couvrant paiements, parrainage, assistant, curriculum, quiz, certificats PDF, admin et enseignement. **L'app est PRÊTE fonctionnellement, MAIS PAS encore « mise en production réelle »** : 3 points bloquants restent des **placeholders / config** (et non du code casséélé) :

1. **Paystack :cohérence de mode impossible à vérifier en lecture seule.** La clé **publique `pk_live_…` est en dur dans le frontend** (local + live)et la **clé secrète** vit dans `functions/.env`(type live/test non vérifiable — valeur non lue). Tant que `PAYSTACK_SECRET` n'est pas confirmé `sk_live_…` (et que le webhook `charge.success` pointe vers `paystackWebhook`), le flux live affiché peut être test-incohérents — **à régler avant le moindre lancement réel**.
2. **Emails transactionnels non garantis.** `SENDGRID_FROM` n'est **pas défini** dans `.env` → l'expéditeur retombe sur `noreply@elearnlanguage.ng`, qui n'est pas un domaine vérifié SendGrid → risque d'erreur 403 sur les confirmations de paiement/expiration. 
3. **Analytics Google mort :** `GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'` (placeholder **non remplacé**, confirmé local **ET live**). Les événements vont quand même dans Firestore (`marketingEvents`) mais **aucune donnée GA4** ne part chez Google. 

(Reste aussi à **clarifier la marque** : le site live affiche encore « **By the founder of Francophone Academy »** au pied de page.)

---

## 2. Tableau de synthèse par domaine

| Domaine | État | Détail clé |
|---|---|---|---|
| **Hosting / déploiement** | ✅ Fonctionnel | Live up; robots/sitemap OK; SEO og:image PNG OK |
| **Config Firebase / `.firebaserc`** | ✅ Configuré | Projet réel `ela-academy-7f868`(aucun placeholder) |
| **Auth (inscription/connexion)** | ✅ Branché (code; non testé en live par respect lecture seule) | `createUserWithEmailAndPassword` / `signInWithEmailAndPassword` + doc `users/{uid}` dans Firestore |
| **Pages publiques** | ✅ Présentes (revue code + accueil live) | 18 routes; toutes ont un renderer; pas de page 404 → fallback home |
| **Pricing affiché** | ✅ Cohérent | Tableau front = table serveur = pages légales (75k/200k/405k ; 120k/320k/648k ;  ️150k/420k/840k) |
| **Paystack** | ⚠️ À confirmer | Clé publique **live** dans le frontend; clé secrète `.env` de type indéterminé (en lecture seule)|
| **Cloud Functions** | ✅ Déployées (vérifié `healthCheck`) | 18 exports; appelées via `africa-south1` (cohérent) |
| **Firestore rules** | ✅ Publiées, solides | deny-all par défaut; création contrôlée de `marketingEvents` |
| **Emails (SendGrid)** | ⚠️ À configurer | `SENDGRID_FROM` absent → expéditeur domaine non vérifié |
| **Analytics GA4** | ❌ Placeholder | `G-XXXXXXXXXX` (marketing.js:16) |
| **Branding** | ⚠️ Residus FA | Footer « **Francophone Academy** » (index.html:106 + i18n) + commentaires code |
| **Domaine/contact** | ⚠️ Placeholder probable | `elearnlanguage.ng` (affiché; non vérifié) vs email gmail dans les pages légales |
| **Vidéos de leçons** | ❌ Placeholder | `curriculum.js`: `videoUrl=""` (HeyGen prévu, absent) |
---

##3. Liste détaillée des problèmes (avec fichier:ligne

###3.1 Restes de la marque / des textes FA (critique demandé
| # | Fichier:ligne | Problème |
|---|---|---|---|
|1| `index.html:106` | Statique **`By the founder of Francophone Academy`** — **visible sur le site live**. À clarifier (si volontaire « par le fondateur », l'exprimer en « ELA » ou l'archiver) |
|2| `i18n/en.json:16` · `i18n/fr.json:16` · `i18n/ar.json:16` | Trois traductions `footer.by` citant Francophone Academy(voit aussi `index.html`) |
|3| `js/firebase-config.js:7` (comment) | « comme pour Francophone Academy » — interne, bénin, à nettoyer |
|4| `functions/index.js:5, 722, 1077`(comments) · `firestore.rules:40` · `assets/css/main.css:716` | Commentaires « Francophone / modèle Francophone » — internes, bénins (traçabilité modèle) |
|5| `GUIDE-INSTALLATION-ELA….\*.md` · `RAPPORT-FINAL-*.md` etc`.| Documents historiques nommant FA — pas utilisateur-visible, à garder en archive |

###3.2 Placeholdersde configuration (non remplacés
| # | Fichier:ligne | Problème |
|---|---|---|---|
|6| `js/marketing.js:16` | **`GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'`** — placeholder GA4 (confirmé local **ET live**). Aucune donnée GA4 (même si gtag se charge,car l'ID est invalide— la regex le laisse passer) |
|7| `js/firebase-config.js:4-10` | commentaires « À REMPLIR SUR TON PC » obsolètes(la config est remplie)— cosmétique |
|8| `index.html:76 (footer-domain`) · `:96 (mailto` | Domaine **`elearnlanguage.ng`** affiché(et utilisé comme expéditeur SendGrid]. Non vérifié enregistré/exploité → contact/emails potentiellement morts |
|9| `functions/index.js:579` | `SENDGRID_FROM` retombe sur `noreply@elearnlanguage.ng`(.env n'a PAS `SENDGRID_FROM`→ 6 clés présentes — voir §6) |
|10| `functions/curriculum.js:6` (+ `.env` `HEYGEN_API_KEY`) | `videoUrl=""` — vidéos de leçons **absentes** (HeyGen prévu, clé présente inutilisée) |
|11| `functions/index.js:440` (+`.env` `AI_PROVIDER`) | `AI_PROVIDER` présent dans `.env` **mais jamais lu** par le code (le backend utilise `OPENROUTER_BASE`/`MODEL` en dur) — mort, bénin |
|12| `functions/.env.example` | Valeurs vides == modèle (normal, attendu) |

###3.3 Paiement Paystack
| # | Fichier:ligne | Problème |
|---|---|---|---|
|13| `js/firebase-config.js:24` (et live) | Clé **publique `pk_live_cba892…`** en dur dans le frontend = **mode LIVE affiché** |
|14| `functions/.env: PAYSTACK_SECRET` | **Présente**, mais **type (sk_live ou sk_test) indéterminé en lecture seule** (valeur non lue volontairement). Si encore `sk_test` → incohérence frontend-live/backend-test casse le flux réel. À confirmer |
|15| `functions/index.js:365-434` (`paystackWebhook`) | Vérifie signature HMAC-SHA512 + montant côté serveur(solide(.**Mais son URL doit être enregistrée dans le dashboard Paystack**(hors code)→ à confirmer par le propriétaire |
|16| `functions/index.js:43-54` · `app.js:270-272` · `ELA-pages-legales.md:24-28`| Grille cohérente (serveur/front/légal). ✅ — constaté, pas un problème |
###3.4 Fonctions / ressources FA
| # | Fichier:ligne | Problème |
|---|---|---|---|
|17| `functions/index.js` (intégral) | **Aucune référence** à un ID de projet, bucket, région ou URL FA. Toutes les ressources sont ELA (`ela-academy-7f868`, `elearnlanguage.ng`). **Aucune fonction ne pointe vers FA** ✅ |
|18| `functions/index.js:32` | `admin.initializeApp({projectId: …'ela-academy-7f868'})` → isolation correcte du projet FA. ✅ |

###3.5 Logique fonctionnelle(incohérences à trancher
| # | Fichier:ligne | Problème |
|---|---|---|---|
|19| `ELA-pages-legales.md:22` et `app.js` `pricing.perLanguage` vs `functions/index.js:746-747` et `firestore.rules:39-44` | **Incohérence produit :** la grille est présentée **« par académie »(per academy) mais le backend/règles donnent **accès au catalogue complet** dès qu'un abonnement est actif(`canAccess` retourne `active` sans filtre académie; règle `canStudentReadContent` sans contrôle d'académie). Si volontaire == documenter la promesse; sinon == aligner la grille ou restreindre l'accès |
|20| `index.html:96`(mailto `contact@elearnlanguage.ng`) vs `ELA-pages-legales.md:5,57,…` et i18n `legal…body`(`languageacademyelearn@gmail.com`) | Deux emails de contact différents(domaine vs gmail) selon l'endroit — à unifier |
|21| `index.html:95` | WhatsApp `+234 806 614 3797` — plausiblement ELA(Nigeria, même fondateur)mais **à confirmer** que ce n'est pas un reliquat d'un numéro FA|

###3.6 Déploiement / état live
| # | Point | État |
|---|---|---|---|
|22| `healthCheck` | ✅ **Vérifié live** : `{"status":"ok","project":"E-Learn Language Academy","milestone":1}` |
|23| `africa-south1` pour les callables | ✅ Cohérent(frontend `app.js:12-14` force `africa-south1`;`healthCheck` répond) |
|24| `robots.txt`, `sitemap.xml`, `og:image` | ✅ Publiés et atteignables(vérifiés live) |
|25| `checkSubscriptionExpiry` / `generateCertificate` | ⚠️ Codés de façon robuste mais non re-testés en live aujourd'hui(dépendent du scheduler/des triggers et du storage par défaut) |
---

##� 4. Travaux restants priorisés

###P0 — Bloquants avant mise en production réelle
1. **[Paystack — cohérence live]** Confirmer que `functions/.env` → `PAYSTACK_SECRET` est bien `sk_live_…`(et non `sk_test`), redéployer `--only functions`, et vérifier dans le dashboard Paystack que le **webhook** `https://africa-south1-ela-academy-7f868.cloudfunctions.net/paystackWebhook` (événement `charge.success`) est bien actif. (`js/firebase-config.js:24`) — **un paiement réel cassé maintenant = perte d'argent**.
2. **[Emails transactionnels]** Définir `SENDGRID_FROM` et/ou vérifier le domain `elearnlanguage.ng` dans SendGrid (Single Sender Verified),sinon les emails de confirmation de paiement/expiration partent en 403. (`functions/index.js:579`).
3. **[Placeholder de contact/domaine]** Posséder/server le domain `elearnlanguage.ng` puis les emails footer(et `noreply@elearnlanguage.ng`) deviennent réels; sinon remplacer par l'email gmail officiel. (`index.html:76,96`).
4. **[GA4]** Coller le vrai **`G-…`** dans `js/marketing.js:16` et redéployer —sinon zéro donnée analytics.(Firestore `marketingEvents` continue de marcher pour la base.)

###P1 — Important (avant publicisation large
5. **[Parité produit « plan » vs « catalogue »]** Trancher l'incohérence « grille par académie » vs « abonnement ouvrant tout le catalogue »(`functions/index.js:746-747`, `firestore.rules:39-44`, `ELA-pages-legales.md:22`) — enjeu légal/marketing.

 6. **[Unifier contacts]** Unifier email de contact(footer vs pages légales vs expéditeur SendGridliste(`index.html:96` vs `ELA-pages-legales.md:5,57,100,121` vs `functions/index.js:579`).
7. **[Confirmer WhatsApp]** Vérifier que `+2348066143797` est le numéro officiel ELA(et pas un reliquat FA) (`index.html:95`).

###P2 — Amélioration / nettoyage
8. **Marque** : adapter le ribbon footer « By the founder of Francophone Academy » en une mention ELA (« By the founder of E-Learn Language Academy » ou retirer)(`index.html:106`, `i18n/*\*.json:16`).
9. **[Vidéos de leçons]** Remplir `videoUrl` du curriculum ou brancher HeyGen(hello la clé `HEYGEN_API_KEY` présente dans `.env` mais inutilisée)(`functions/curriculum.js:6`).
10.Nettoyage code : retirer les commentaires FA obsolètes internes(`firebase-config.js:7`, `main.css:716`, `functions/index.js:5,722,1077`, `firestore.rules:40`)et le banner« À REMPLIR »(`firebase-config.js:4-10`, `GUIDE…`).
11\. Supprimer `AI_PROVIDER` présent dans `.env` mais jamais utilisé(`functions/index.js:440`).
12\. **Page 404** : ajouter une vraie page 404(actuellement toute route inconnue tombe sur la home)(`js/app.js:2552`).

---

##� 5. Ce qui est déjà bon et ne demande rien

- **Hébergement & SEO** : site live, `robots.txt`, `sitemap.xml`, og:image PNG, meta OG/twitter, favicon SVG — rien à faire..
- **Multi-langue** : moteur i18n complet(EN/FR/AR + RTL arabe) appliqué au shell et aux pages — solide..
- **Sécurité du backend** : clés secrètes **jamais** dans le frontend(toutes dans `functions/.env`;`.env` bien dans `.gitignore`), montants **toujours recalculés côté serveur**(table canonique `PRICE_TABLE`, `functions/index.js:43-54`), signature HMAC-SHA512 vérifiée, transactions/abonnements de façon idempotente, rôles gérés côté serveur(`setUserRole`) — très solide.

- **Règles Firestore** : deny-all par défaut, création contrôlée(`marketingEvents` whitelist, `users/{uid}` auto, `progress`/`quizScores` self-only etc.) — prêtes pour production..
- **Pricing** : tableau serveur = affichage = pages légales — cohérent(75k/200k/405k ; 120k/320k/648k ; 150k/420k/840k). ✅
- **Cloud Functions** : 18 exports bien découpés, région `africa-south1` cohérente avec le frontend, scheduler/timezone Africa/Lagos, tests par jalons(admin/teacher/student/curriculum/jalon2-5/e2e) — forte maturité..
- **Catalogue** : contenu propriétaire réel pour les 5 académies(`curriculum.js` + `curriculum-quizzes.js`), seed idempotent via `seedCurriculum`, index composites Firestore déployés(`firestore.indexes.json`)..
- **Pages légales** : Terms / Privacy / Refund rédigées(Nigeria, NDPA 2023, Paystack/SendGrid/OpenRouter disclosed) et intégrées → prêtes..
- **Tracking Firestore** : `page_view`, `registration`, `trial_started`, `checkout_started`, `payment_success`→ `marketingEvents` fonctionnent **sans cookies** (même si GA4 est mort)..
---

##� 6. Configuration Firebase et functions(.env — **clés PRÉSENTES,(valeurs NON affichées par respect de la règle**)

- **`.firebaserc`** : `default == ela-academy-7f868` ✅ (réel, pas placeholder)
- **`firebase.json`** : hosting `public="."`, `rewrites ** → /index.html`; firestore rules+indexes; functions codebase `default`; emulators définis(Auth 9099,Functions 5001,Firestore 8080,PubSub 8089) — aucun placeholder✅
- **`functions/.env` — clés présentes**(valeurs non lues/non affichées) :

```
PAYSTACK_SECRET           (présente — type live/test non vérifiable en lecture seule)
PAYSTACK_CALLBACK_URL     (présente)
OPENROUTER_KEY            (présente)
AI_PROVIDER              (présente — jamais lu par le code)
SENDGRID_API_KEY         (présente)
HEYGEN_API_KEY            (présente — inutilisée,videos prévues/absent)
```
- Non présents dans `.env` : `SENDGRID_FROM`(→ retombe sur `noreply@elearnlanguage.ng`), `OPENROUTER_MODEL`(→ défaut `openai/gpt-4o-mini`).

---

##� 7. Note de méthode / limites de l'audit

- Test **live** exécuté(lecture seule): `/`(shell+footer), `/robots.txt`, `/sitemap.xml`, `/js/firebase-config.js`, `/js/marketing.js`, et `/healthCheck`(africa-south1)→ re**toutes répondent**.
- Le contenu des pages interactives(accueil rendue en JS, dashboard, admin, checkout)n'a**pas pu être exercé en navigateur**(pas de navigateur headless dans cet environnementous ni de compte). Leurs routes/formulaires ont été auditées par **revue de code**(renderers, validations, appels callables, Firestore influs. Les formulaires inscription/connexion n'ont **pas** été soumis en live(créeraient un vrai utilisateur → interdit en lecture seule)..
- `functions/.env` : seules les **noms de clés** figent dans ce rapport; les **valeurs n'ont jamais été lues ni affichées**.
- Aucune transaction Paystack réelle n'a été initiée. Le flux a été audité dans le code uniquement..

---

*Audit réalisé en mode lecture seule — aucun fichier de projet modifié,aucun déploiement,aucune écriture Firestore/Auth/Paystack. (Hormisle présent rapport `.md`, qui était le livrable demandé.*