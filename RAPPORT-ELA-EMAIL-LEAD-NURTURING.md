# RAPPORT — ELA EMAIL LEAD NURTURING (Mission 7)

**Date :** 11 septembre 2026
**Objet :** automatisation email + nurturing des leads (visiteur → lead magnet → capture → lead → free trial → inscription → paiement → client).
**Statut :** code livré, testé (unitaires + émulateur), déployé et vérifié en production.
**Commit :** `562ff21` — `feat(marketing): implement lead nurturing automation`
**Sécurité :** **envoi d'emails RÉEL DÉSACTIVÉ par défaut** (`NURTURE_SEND_ENABLED=false`). Aucun email n'a été envoyé.

---

## 1. Audit initial

Éléments trouvés dans le projet (réutilisés, non recréés) :
- **Lead magnets + landing pages** (`/lead-magnets/{fr,de,zh,en,ar,ru}`) avec formulaire écrivant dans Firestore `leadMagnetLeads` (name, email, academy, goal, leadMagnetId, source, consent, locale, ts) — Mission 5.
- **Règles Firestore** : `leadMagnetLeads` create-only (email valide, consentement, académie ∈ 6), admin read ; `marketingEvents` whitelist.
- **Infrastructure email** : `sendEmail()` dans `functions/core.js` (SendGrid v3, texte brut) ; `SENDGRID_API_KEY` et `SENDGRID_FROM` **déjà configurés** dans `functions/.env`.
- **Cloud Functions** : 34 fonctions existantes ; un exemple de scheduler (`checkSubscriptionExpiry`, region `europe-west1`) dans `auth.js`.
- **Paiement** : `payment.js` (webhook Paystack, `grantSubscription` idempotent, événement `payment_success`).
- **Inscription** : `createAccount` (Admin SDK) crée `users/{uid}`.
- **Tracking client** : `js/marketing.js` (GA4 + Firestore), événements lead/trial/registration.
- **URLs propres + SEO** : Mission 6 (canonical, hreflang, sitemap, robots).

**Absent avant cette mission :** aucun trigger `onLeadCreated`, aucune séquence email, aucun scheduler de nurturing, aucun endpoint de désabonnement, aucune traçabilité de consentement, aucun anti-doublon.

## 2. Architecture existante

- SPA statique (Firebase Hosting, `cleanUrls`), hash router dual-mode.
- Firestore + Cloud Functions v2 (Node 22, `firebase-functions` v6).
- SendGrid transactionnel (texte brut, `sendEmail`).
- Aucune automatisation marketing branchée.

## 3. Agents utilisés

Les 8 agents marketing existants (aucun nouvel agent créé), en parallèle, avec des périmètres ciblés : `marketing-strategist`, `lead-generation-specialist`, `email-marketing-specialist`, `content-copywriter`, `growth-cro-analyst`, `market-researcher`, `seo-specialist`, `social-media-manager`. DeepSeek = orchestrateur, implémentation, tests et validation.

## 4. Contributions de chaque agent

- **marketing-strategist** : funnel final + règles de transition/arrêt (inscription/trial/paiement → stop), politique consentement/désabonnement, cadence 7 emails, KPI.
- **lead-generation-specialist** : points de capture, politique d'anti-doublon (email canonical), scoring par champs existants, exigences de preuve de consentement, sur-collecte à éviter.
- **email-marketing-specialist** : spec de la séquence (timing/objectif/CTA/stop), stratégie 7 templates, multilingue (EN/FR/AR réels, repli EN), architecture Firebase, idempotence, conformité.
- **content-copywriter** : rédaction complète des 7 emails en **EN, FR, AR** (sujets, preheaders, corps, CTA), variables, ton sans hype, aucune garantie.
- **growth-cro-analyst** : 5 optimisations (PROBLÈME→HYPOTHÈSE→ACTION→KPI), hiérarchie CTA après capture, mesure.
- **market-researcher** : cohérence personas/marchés, langues d'email (EN acceptable pour la base nigériane ; FR/AR essentiels), timings par fuseau, risques (confusion « free trial », certificat ≠ organisme).
- **seo-specialist** : CTA vers URLs propres + `?lang=`, UTM, pas de cloaking/duplication, et **détection d'une régression de tracking** après la migration URLs propres (corrigée).
- **social-media-manager** : verdict honnête — le social apporte peu au nurturing lui-même ; il alimente la capture en amont (déjà en place), pas de lien social dans les emails 1–6.

## 5. Architecture finale

```
Formulaire /lead-magnets/*  →  Firestore leadMagnetLeads (consent=true)
        │ (Firestore onCreate)
        ▼
nurtureOnLeadCreated : valide consentement → anti-doublon → initialise sequence → Email 1
        │
        ▼
nurtureScheduler (toutes les 15 min, europe-west1) : traite les leads dus → Emails 2..7
        │
        ├── users/{uid} créé        → nurtureOnUserCreated        → status registered (stop)
        └── subscriptions/{uid} active → nurtureOnSubscriptionActive → status customer (stop)
        │
        ▼
nurtureUnsubscribe (/unsubscribe, token signé) → status unsubscribed (suppression permanente)
```

## 6. Funnel

`lead_magnet_view → lead_magnet_start → lead_captured` (client) → **`lead_created`** (serveur) → `email_sent` (×7) → `trial_started` → `registration_started/completed` → `plan_selected` → `checkout_started` → `payment_success`.
États du lead : `active` → `registered` | `customer` | `unsubscribed` | `nurture_complete` | `duplicate` | `stopped` | `error`.

## 7. Email sequence

7 emails, texte brut, un seul CTA, aucun témoignage/statistique/garantie :

| # | Délai | Objectif | CTA |
|---|---|---|---|
| 1 | J0 | Bienvenue + livraison du guide | `/lead-magnets/{slug}` |
| 2 | J1 | Victoire de 5 minutes | `/free-trial` |
| 3 | J3 | Bénéfice concret | `/academies` |
| 4 | J5 | Méthode ELA (auto-rythmé + live + certificat) | `/free-trial` |
| 5 | J7 | Invitation Free Trial (12 sans compte / 24 avec) | `/free-trial` |
| 6 | J10 | Objections (temps, niveau, appareil) | `/free-trial` |
| 7 | J14 | Rappel final respectueux | `/free-trial` |

Langues réelles : **EN, FR, AR** (AR en arabe standard). **DE/RU/ZH → repli EN** (aucune traduction fictive). ES jamais utilisé. Variables : `{{name}}`, `{{academy_label}}`, `{{magnet_title}}`, `{{guide_url}}`, `{{trial_url}}`, `{{unsubscribe_url}}`. Chaque email contient un pied de désabonnement visible + en-têtes `List-Unsubscribe`.

## 8. Firebase Functions

Nouveau module `functions/nurture.js` (aucune nouvelle dépendance npm) :
- **`nurtureOnLeadCreated`** (Firestore onCreate, `africa-south1`) : consentement → anti-doublon → init séquence → Email 1. Erreurs capturées (`status: error`).
- **`nurtureScheduler`** (onSchedule, `every 15 minutes`, `europe-west1`) : traite les leads `active` dus (limite 200/run), idempotent.
- **`nurtureOnUserCreated`** (onCreate `users/{uid}`, `africa-south1`) : inscription → `registered`.
- **`nurtureOnSubscriptionActive`** (onWritten `subscriptions/{uid}`, `africa-south1`) : paiement → `customer`.
- **`nurtureUnsubscribe`** (onRequest, `europe-west1`) : token HMAC signé, idempotent, page HTML `noindex`.

Idempotence : réclamation du pas par **transaction** (`lastSentStep` avancé AVANT l'envoi) → au plus un envoi par pas, même en cas de retry. Erreurs journalisées, pas de secret dans le code.

## 9. Firestore

- **Modèle existant conservé** (`leadMagnetLeads`) ; la séquence est ajoutée par le trigger (pas de champs superflus) :
  `status`, `unsubscribed`, `sequence { step, lastSentStep, startedAt, nextSendAt, lastSentAt, history[] }`, `lastEmailSentAt`, `stopReason`, `registeredAt`, `convertedAt`, `duplicateOf`, `errorMessage`.
- **Règles** : `leadMagnetLeads` inchangé (create-only client, admin read) ; les fonctions écrivent via l'Admin SDK (bypass). `marketingEvents` whitelist étendue (`plan_selected`, `thankyou_view`, `trial_cta_click`).
- **Pas de nouvel index composite** : le scheduler filtre `status == 'active'` (index simple auto) et la cadence est calculée en code.

## 10. Consentement

- Consentement explicite non pré-coché déjà capturé (`consent: true`) ; le trigger refuse tout lead sans consentement (`status: stopped`).
- Traçabilité : `consent`, `ts`, `locale`, `academy`, `source`, `leadMagnetId` conservés sur le document.
- **OWNER INPUT REQUIRED** : version du texte de consentement, `consentAt` serveur, IP/user-agent hachés, double opt-in éventuel, durée de conservation, DPO.

## 11. Unsubscribe

- Lien signé HMAC-SHA256 (`leadId` + expiration 1 an) → `https://elaacademy.ng/unsubscribe?token=…`.
- Endpoint HTTP (region `europe-west1`, supportée par Hosting) : token invalide → 400 ; valide → `status: unsubscribed`, `unsubscribed: true`, `lead_unsubscribed`.
- En-têtes `List-Unsubscribe` + `List-Unsubscribe-Post` sur chaque envoi.
- Un désabonné n'est **jamais réactivé** par une inscription ou un paiement (vérifié).

## 12. Anti-duplication

- **Même email, plusieurs soumissions** : le trigger cherche un lead antérieur non désabonné ; le nouveau est marqué `duplicate` (aucune seconde séquence).
- **Refresh / double-clic** : le formulaire désactive le bouton ; le trigger ne crée qu'une séquence par email.
- **Réinscription après désabonnement** : un désabonné n'est pas compté comme « antérieur actif » → une nouvelle soumission peut démarrer une nouvelle séquence (comportement volontaire), mais l'ancien document reste `unsubscribed`.
- **Idempotence par pas** : transaction `lastSentStep` (at-most-once).

## 13. Analytics

- Serveur : `lead_created`, `email_sent` (step/template/locale/dryRun), `sequence_stopped` (registration|payment|nurture_complete), `lead_unsubscribed`.
- Client (corrigé) : `lead_magnet_view/start/captured/download`, `thankyou_view`, `trial_cta_click`, `plan_selected`, `trial_started`, `registration_started/completed`, `checkout_started`, `page_view`.
- **Régression corrigée** : après la migration URLs propres (Mission 6), `page_view` journalisait `location.hash` (vide) et les clics CTA ne matchaient plus `#/…`. `js/marketing.js` utilise désormais `location.pathname` et normalise les liens propres.

## 14. Tests

**Unitaires** (`functions/test/nurture.test.js`, `node --test`) — **13/13 PASS** :
séquence 7 pas/délais croissants, langues supportées (repli EN, ES exclu), normalisation email, mapping 6 académies, sign/verify token (+altéré/malformé/expiré rejetés), rendu 7×3 langues sans placeholder, repli EN pour de/ru/zh/es, arabe/français, liens guide `?lang`, token de désabonnement lié au lead, `fill()`, absence de termes interdits (garantie/visa/témoignage), cadence/idempotence `nextDueStep`.

**Intégration** (`functions/test/integration.js`, émulateur Firestore+Functions) — **ALL PASS** :
- lead créé → `active` + séquence initialisée ; envoi désactivé → aucun pas avancé ;
- même email → `duplicate` + `duplicateOf` ;
- sans consentement → `stopped` ;
- `/unsubscribe` token valide → 200 + `unsubscribed` ; token invalide → 400 ;
- inscription → `registered` ; paiement → `customer` ; désabonné non réactivé.

**Note :** le premier déclenchement en émulateur subit un cold-start (~14–18 s) ; les tests utilisent des attentes de 30–60 s. Aucun email réel n'a été envoyé (envoi désactivé).

## 15. Build

Pas d'étape de build (site statique + functions Node). Vérifications : `node --check` sur `nurture.js`, `index.js`, `marketing.js`, `lead-magnets.page.js` ; `JSON.parse` de `firebase.json`. Le code client n'a pas de bundler.

## 16. Deployment

- **Firestore rules** : `released rules to cloud.firestore` (compilation OK).
- **Hosting** : `release complete` (tracking corrigé, rewrite `/unsubscribe`).
- **Functions** : 5 nouvelles fonctions créées avec succès :
  `nurtureOnLeadCreated`, `nurtureOnUserCreated`, `nurtureOnSubscriptionActive` (africa-south1), `nurtureScheduler` (europe-west1), `nurtureUnsubscribe` (europe-west1).
- **Correction** : Firebase Hosting ne supporte pas la région `africa-south1` pour un rewrite `function` ; l'endpoint a été déplacé en `europe-west1` (l'ancienne instance africa-south1 a été supprimée).
- Projet : `ela-academy-7f868`.

## 17. Production verification

- `nurtureUnsubscribe` direct : `token=bad` → **400**.
- `https://elaacademy.ng/unsubscribe?token=bad` → **400** (rewrite Hosting opérationnel).
- `https://elaacademy.ng/unsubscribe` sans token → **400**.
- Token valide (lead inexistant) → **200**, page HTML « You are unsubscribed » + `noindex`.
- `firebase functions:list` : les 5 fonctions présentes (bons types/régions).
- Pages publiques `/`, `/academies`, `/free-trial`, `/pricing`, `/lead-magnets/de` → HTTP 200 avec canonical + `<base>`.
- Rendu réel `/lead-magnets/de` (Chrome headless) : formulaire présent, titre Goethe, canonical, aucun ES.
- `NURTURE_SEND_ENABLED=false` confirmé dans `functions/.env` → **aucun email réel**.
- `marketing.js` en production contient bien le correctif `location.pathname` + `plan_selected`.

## 18. OWNER INPUT REQUIRED

1. **Activation d'envoi** : passer `NURTURE_SEND_ENABLED=true` dans `functions/.env` puis redéployer — **uniquement** après validation (voir §19).
2. **SendGrid** : confirmer `SENDGRID_FROM` vérifié (expéditeur), configurer SPF + DKIM + DMARC, warm-up du domaine.
3. **Consentement/légal** : version du texte, base légale NDPA 2023 / GDPR, durée de conservation, contact DPO, politique de suppression.
4. **Double opt-in** : décision (recommandé) avant activation.
5. **Traductions DE/RU/ZH** des emails (aujourd'hui repli EN).
6. **Baselines** analytiques (trafic, taux d'ouverture/clic, lead→trial) — non disponibles.
7. **Retour à l'envoyeur** : adresse de réponse surveillée (aujourd'hui `SENDGRID_FROM`).
8. **Bounces/plaintes** : brancher le webhook d'événements SendGrid pour auto-suppression (non implémenté).

## 19. Limitations

- **Aucun email n'a été envoyé.** L'activation réelle est laissée au propriétaire (interrupteur unique).
- Emails en **texte brut** uniquement (infrastructure `sendEmail` existante) ; pas de template HTML/design.
- Traductions email limitées à **EN/FR/AR** (repli EN pour de/ru/zh).
- Le trial **anonyme** (sans compte) n'est pas rattachable à un lead (pas d'email) ; la transition fiable est l'**inscription**.
- Le scheduler est **périodique (15 min)** ; la cadence est approximative (±15 min).
- `List-Unsubscribe` nécessite un traitement côté SendGrid/ESP pour l'one-click complet (l'en-tête est posé, l'endpoint existe).
- Le token de désabonnement contient l'email en base64url (PII faible, lien envoyé au destinataire) — minimisation possible.

## 20. Risques

| # | Risque | Impact | Mitigation |
|---|---|---|---|
| 1 | Activation d'envoi sans SPF/DKIM/DMARC | Élevé (délivrabilité) | Interrupteur désactivé ; procédure documentée |
| 2 | Backlog : leads anciens recevant la séquence d'un coup à l'activation | Moyen | `startedAt` réinitialisé au pas 1 ; un email / 15 min |
| 3 | Cold-start des triggers | Faible | Retries Firebase ; erreurs capturées |
| 4 | Trial anonyme non relié au lead | Moyen | Transition sur inscription ; pousser le compte gratuit |
| 5 | Bounces/plaintes non traités automatiquement | Moyen | Webhook SendGrid à brancher (OWNER) |
| 6 | Conformité légale (NDPA/GDPR) non validée | Élevé | Consentement stocké ; validation juridique requise |

## 21. Prochaine mission recommandée

**Mission 8 — Activation contrôlée + mesure du funnel :**
1. Valider SPF/DKIM/DMARC + `SENDGRID_FROM`, puis activer `NURTURE_SEND_ENABLED=true` sur un test interne.
2. Brancher le webhook d'événements SendGrid (delivered/open/click/bounce/complaint) → `email_opened`, `email_clicked`, auto-suppression.
3. Ajouter un dashboard funnel (`lead_created → trial_started → payment_success`) par académie/locale/pas.
4. Compléter les traductions DE/RU/ZH des emails si le marché hors base nigériane est confirmé.
5. Soumettre le sitemap à Google Search Console (restant Mission 6).
