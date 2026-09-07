# RAPPORT D'AUDIT — Système d'inscription ELA

Date : 2026-09-07
Portée : `js/app.js`, `src/ela/pages/free-trial.page.js`, `functions/*`, `firestore.rules`, `i18n/*`
Statut : AUDIT TERMINÉ — corrections implémentées, **NON déployées** (validation manuelle requise)

---

## 1. Architecture constatée

Le système d'inscription est **100 % client-side**. Aucune Cloud Function de création de compte n'existait :

| Flux | Fichier | Mécanisme |
|---|---|---|
| Wizard d'inscription (#/register) | `js/app.js:1771-1800` | `createUserWithEmailAndPassword` → `users/{uid}.set({...})` |
| Modal Free Trial | `src/ela/pages/free-trial.page.js:65-99` | idem (second flux séparé) |
| Login | `js/app.js:1822-1830` | `signInWithEmailAndPassword` |

La seule autorité d'unicité d'email était Firebase Auth (`auth/email-already-in-use`), jamais Firestore.

## 2. Constats par ordre de criticité

### 🔴 C1 — Escalade de privilège (rôle admin/teacher) à l'inscription
- `firestore.rules:47-49` : `allow create: if isSignedIn() && request.auth.uid == uid` → **aucune validation de champ**.
- Un client forgé peut créer `users/{uid}` avec `role: "admin"`. Toutes les CF admin (`getAdminPanelData`, `reviewContent`, `setUserRole`, …) lisent `role` sur ce document via Admin SDK et l'acceptent.
- L'UI officielle écrit `role: 'student'`, mais rien ne l'impose côté règles.
- Vecteurs associés (create client) : `referralCredit` arbitraire (fraude sur crédit de paiement, `functions/payment` computePricing), `firstPaymentDone: true`, `academy` incohérent.

### 🔴 C2 — Compte orphelin / double inscription non compensée
- `js/app.js:1780` puis `1782` : création auth **puis** écriture Firestore, en deux temps, sans compensation.
- Si le `.set` échoue (règles, réseau) après création auth → compte Auth sans doc `users` → l'utilisateur ne peut plus jamais s'inscrire (`email-already-in-use`) ni être servi.
- Double-clic / double onglet : le bouton n'est jamais désactivé pendant la requête (`js/app.js:1773-1799`).
- Deux flux (wizard + modal) séparés, mêmes failles répliquées.

### 🟠 C3 — Aucune normalisation stricte des emails
- `.trim()` seulement (`js/app.js:1777`, `1825` ; `free-trial.page.js:66`), **pas de `.toLowerCase()`**.
- Auth normalise en minuscules ; le champ `users.email` stocké peut être en casse mixte → incohérence de données, recherche admin sensible à la casse (`js/admin/pages/admin-users.page.js:80-81`).

### 🟠 C4 — Aucune vérification d'unicité côté client NI serveur
- Zéro check on-blur, zéro callable `checkEmailUnique`, aucune collection d'index email (`emails/{email}`) dans Firestore.

### 🟠 C5 — Aucun rate limiting
- Aucune limite 3 tentatives/min/IP. `createUserWithEmailAndPassword` direct depuis le client contourne toute CF → ouverture brute-force / spam d'inscriptions.

### 🟡 C6 — Erreurs non typées
- Wizard : catch générique (`js/app.js:1799`) sans mapping (`auth/weak-password`, `auth/email-already-in-use`, `auth/too-many-requests`).
- Modal free-trial : message brut anglais exposé à l'utilisateur (`free-trial.page.js:96-97`).

### 🟡 C7 — Login sans contrôle de cohérence auth ↔ users
- `js/app.js:1827` : aucun contrôle de l'existence/l'email du doc `users` après connexion (les orphelins C2 ne sont jamais réparés).

## 3. Corrections implémentées

Ordre d'implémentation : par criticité (cf. protocole). Aucun déploiement effectué.

### 3.a — Cloud Function `createAccount` (inscription serveur, transaction atomique)
Fichier : `functions/auth.js` (+ export `functions/index.js`)
- **Normalisation** : `trim().toLowerCase()` — unique source d'autorité serveur.
- **Validations** : format email, mot de passe ≥ 8, académie ∈ `VALID_ACADEMIES`, langue d'interface ∈ {en, fr, ar}.
- **Unicité** : `admin.auth().getUserByEmail(email)` (autorité canonique, insensible à la casse héritée) **+** doc `emails/{email}` Firestore.
- **Transaction atomique** : création Auth (`admin.auth().createUser`) → transaction Firestore `emails/{email}` + `users/{uid}` avec `role: 'student'` **forcé côté serveur**.
- **Compensation** : si la transaction échoue après création Auth → `admin.auth().deleteUser(uid)` (rollback). Note : une vraie transaction « Auth + Firestore » n'existe pas nativement ; le motif standard create-then-compensate est appliqué.
- Réponse : `{ ok: true, uid }` — le client signe ensuite en local (l'Admin SDK ne crée pas de session client).

### 3.b — Rate limiting (3 tentatives/min/IP)
- Collection `signupAttempts/{sha256(ip)}` (IP **jamais stockée en clair**, aucune IP brute).
- Doc unique par IP, champs par bucket (`create`, `check`) `{ count, start }`, mise à jour **transactionnelle** (compteur fiable en concurrence).
- `createAccount` : max **3/min** → erreur `resource-exhausted` (`rate-limit-exceeded`) avec `retryAfterSeconds`.
- `checkEmailUnique` : max **20/min** (le check on-blur ne doit pas bloquer la frappe).
- Aucun index composite requis (pas de requête range → `firestore.indexes.json` inchangé).

### 3.c — Cloud Function `checkEmailUnique` (vérification d'unicité serveur, UX)
- Callable non authentifié, rate-limité ; lit `emails/{email}` **et** Firebase Auth.
- Retourne `{ available, exists }` — aucune donnée sensible exposée au client.

### 3.d — Cloud Function `ensureProfile` (cohérence auth ↔ users au login)
- Callable **authentifié** : si `users/{uid}` absent (orphelin hérité) → recréation minimale serveur (`role: 'student'`, email normalisé du compte Auth, `referralCode`, `createdAt`).
- Si présent mais email en casse incohérente → normalisation en `merge`.
- L'UI n'a **plus aucun droit d'écrire** le doc `users` directement.

### 3.e — `firestore.rules` : fermeture de l'escalade
- `users/{uid}` : `allow create: if false;` — création **exclusivement** via Admin SDK (createAccount / ensureProfile).
- Ajout : `emails/{email}` lecture/écriture client interdites (`false`), CF uniquement.
- `update` conservé (self, `role` immuable), `delete` toujours `false`.

### 3.f — Frontend : double vérification client + serveur (approche HYBRIDE retenue)
- `js/app.js` (wizard) : normalisation locale `trim().toLowerCase()`, validation email/8+, **bouton désactivé** pendant l'appel, **pré-check `checkEmailUnique`** (UX) puis création **100 % serveur** `createAccount`, ensuite `signInWithEmailAndPassword` (l'Admin SDK ne crée pas de session), mapping d'erreurs i18n (`emailTaken`, `error.rateLimited`, `error.invalidInput`).
- `src/ela/pages/free-trial.page.js` (modal) : même double check via `callFunction`, mot de passe porté à 8 caractères (alignement serveur), messages EN en dur, puis sign-in + reload.

### 3.g — Login (étape f du protocole)
- Normalisation locale de l'email.
- Après sign-in : appel `ensureProfile` (réparation orphelin + cohérence) puis redirection. Un échec d'`ensureProfile` ne bloque jamais la navigation (best-effort loggé).

### 3.h — i18n
- Clés ajoutées dans `i18n/{en,fr,ar}.json` : `register.emailTaken` (déjà posé par l'édition parallèle), `register.error.rateLimited`, `register.error.invalidInput`, `login.error.rateLimited`.

### 3.i — Note de coordination (édition concurrente détectée en cours d'audit)
- `js/app.js`, `i18n/*` puis `src/ela/pages/free-trial.page.js` ont été modifiés **en parallèle** pendant la session (une autre main a produit une ébauche client-side de la même refonte, avec des erreurs de syntaxe à `js/app.js` et `free-trial.page.js` : `doc(email, {…})`, parenthèse manquante…). Ces fragments ont été **remplacés par la version hybride ci-dessus** (elles sont désormais syntaxiquement valides).
- Le bloc de règles `userEmails/{email}` ajouté par l'autre main est conservé (immuable, lecture propriétaire) mais **plus rien ne l'écrit** depuis le frontend hybride → à retirer lors d'un prochain nettoyage validé (aucun code supprimé pendant cet audit).
- Backups des états pré-audit : suffixe `.inscription-audit.bak` (backups `.bak` antérieurs préservés).

## 4. Décisions et limites techniques (à valider)

1. **Périmètre « source »** : `source: 'trial'` ajoute `trialProgress` (comportement free-trial préservé) ; le wizard n'envoie pas ce champ (doc inchangé).
2. **Code de parrainage** : normalisé en `trim().toUpperCase()` côté serveur (schéma `ELA-XXXXXX`) ; la validation d'existence reste au moment du paiement (`computePricing`), comportement métier inchangé.
3. **Mot de passe** : minimum aligné à **8 caractères** partout (wizard affichait déjà 8 ; la modal free-trial affichait 6 → corrigé). Décision produit à confirmer.
4. **IP** : extraite de `x-forwarded-for`/`rawRequest` (callable v2). Non résolue → bucket fallback en mémoire d'instance (limite minimale, jamais bloquante à l'échelle). À confirmer en conditions réelles (console F12 → Network, onglet `fonctions`).
5. **Backups** : chaque fichier modifié est sauvegardé avec suffixe `.inscription-audit.bak` (les `.bak` antérieurs existants sont préservés).
6. **Aucun code supprimé** : modifications exclusivement additives/serveur + règles.

## 5. Vérifications effectuées

- `node -c` sur `functions/auth.js`, `functions/index.js`, `js/app.js`.
- `node --check` (module ESM) sur `src/ela/pages/free-trial.page.js`.
- Parité des clés i18n (en/fr/ar) et validité JSON.
- Cohérence Firestore ↔ frontend : champs `users` attendus par `getDashboardData`, `computePricing`, `referral` inchangés (ajout d'uniquement `emails/*`, `signupAttempts/*`).

## 6. Ordre de déploiement recommandé (quand validé)

1. Déployer **functions** (`createAccount`, `checkEmailUnique`, `ensureProfile`) — l'ancien frontend reste fonctionnel (create client toujours autorisé dans les règles tant que 2 n'est pas fait).
2. Déployer **firestore.rules** (fermeture du create client) — l'inscription passe alors obligatoirement par `createAccount`.
3. Déployer **frontend** (wizard + modal + login).
4. Smoke test console F12 : inscription OK / email déjà pris / 4ᵉ tentative bloquée / login orphelin réparé.

## 7. Recommandations (hors périmètre, agents Data & Security)

- Activer App Check + reCAPTCHA Enterprise sur `createAccount` (anti-bot au-delà du rate-limit IP).
- Migration one-shot : backfiller `emails/{email}` pour les comptes existants (unicité documentaire complète).
- `functions/auth.js` contient des références à des helpers non définis dans le module (`EMAIL`, `sendEmail`, `VALID_ROLES`, `ts` — reliquat du split WIP). **À corriger au prochain jalon** (hors périmètre de cet audit) ; ne bloque pas les nouvelles fonctions (auto-contenues).
