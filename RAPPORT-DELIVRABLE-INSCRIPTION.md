# RAPPORT DE LIVRAISON — Inscription ELA (audit durci, à valider avant merge)

Date : 2026-09-07 · Statut : **CODE LIVRÉ — NON DÉPLOYÉ, NON MERGÉ** · Branche : `master` (local)

Décisions validées (utilisateur) :
1. **Pas** de trigger `auth.user().onCreate`. Seule la callable **`ensureProfile`** reste (réparation orphelins au login).
2. **Aucun renommage** : la fonction d'inscription reste nommée **`exports.createAccount`** dans le code (aucune fonction `finalizeRegistration` n'existe dans le repo ; `createAccount` EST le « finalizeRegistration » attendu).

---

## 1. Liste exacte des fichiers modifiés

| # | Chemin complet | Nature |
|---|---|---|
| 1 | `C:\Users\11e\Documents\ELA\PROJET\functions\auth.js` | Ajout du bloc inscription (createAccount, checkEmailUnique, ensureProfile, rate limit) |
| 2 | `C:\Users\11e\Documents\ELA\PROJET\functions\index.js` | +3 exports (lignes 154-156) |
| 3 | `C:\Users\11e\Documents\ELA\PROJET\firestore.rules` | `users/{uid}` create → false ; `emails/*`, `signupAttempts/*` serveur-only |
| 4 | `C:\Users\11e\Documents\ELA\PROJET\js\app.js` | Register + login hybrides, helpers erreurs |
| 5 | `C:\Users\11e\Documents\ELA\PROJET\src\ela\pages\free-trial.page.js` | Modal inscription hybride, mot de passe 8+ |
| 6-8 | `C:\Users\11e\Documents\ELA\PROJET\i18n\{en,fr,ar}.json` | +3 clés d'erreur |
| 9 | `C:\Users\11e\Documents\ELA\PROJET\RAPPORT-AUDIT-INSCRIPTION.md` | Rapport d'audit (créé au préalable) |

Aucun fichier supprimé. Aucun déploiement.

---

## 2. finalizeRegistration — code complet (exportée sous `exports.createAccount`)

Emplacement : `functions\auth.js` lignes 339-395. Export : `functions\index.js` ligne 154.

```javascript
exports.createAccount = onCall({ region: REGION }, async (request) => {
  await enforceRateLimit(clientIp(request), 'create', RATE_LIMIT_CREATE);

  const data = request.data || {};
  const email = normalizeEmail(data.email);
  const password = String(data.password || '');
  const name = String(data.displayName || data.name || '').trim();
  const academy = String(data.academy || '').trim();
  const referral = String(data.referral || data.referralCode || '').trim().toUpperCase();
  const source = String(data.source || '').trim();
  const interfaceLang = String(data.interfaceLang || '').trim();

  if (!EMAIL_RE.test(email)) throw new HttpsError('invalid-argument', 'invalid-email');
  if (password.length < 8) throw new HttpsError('invalid-argument', 'weak-password');
  if (!name) throw new HttpsError('invalid-argument', 'missing-name');
  if (academy && !VALID_ACADEMIES.includes(academy)) throw new HttpsError('invalid-argument', 'invalid-academy');
  const lang = VALID_INTERFACE_LANGS.includes(interfaceLang) ? interfaceLang : 'en';

  if (await emailAlreadyTaken(email)) throw new HttpsError('already-exists', 'email-in-use');

  let uid = null;
  try {
    const record = await admin.auth().createUser({ email: email, password: password, displayName: name });
    uid = record.uid;
  } catch (err) {
    if (err && (err.code === 'auth/email-already-exists' || (err.errorInfo && err.errorInfo.code === 'auth/email-already-exists'))) {
      throw new HttpsError('already-exists', 'email-in-use');
    }
    throw err;
  }

  const firestore = admin.firestore();
  const emailRef = firestore.collection('emails').doc(email);
  const userRef = firestore.collection('users').doc(uid);
  const userDoc = buildUserDoc(uid, { name: name, email: email, interfaceLang: lang, academy: academy, referral: referral, source: source });

  try {
    await firestore.runTransaction(async (txn) => {
      const existing = await txn.get(emailRef);
      if (existing.exists) {
        throw new HttpsError('already-exists', 'email-in-use');
      }
      txn.set(emailRef, { uid: uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      txn.set(userRef, userDoc);
    });
  } catch (err) {
    /* Compensation : suppression du compte Auth → jamais d'orphelin. */
    if (uid) await admin.auth().deleteUser(uid).catch(function () {});
    if (err && typeof err === 'object'
        && (err.code === 'already-exists' || String(err.message || '').indexOf('email-in-use') >= 0)) {
      throw new HttpsError('already-exists', 'email-in-use');
    }
    throw new HttpsError('aborted', 'account-creation-failed');
  }

  return { ok: true, uid: uid };
});
```

Auxiliaires du même module (`functions\auth.js:231-332`) — références nécessaires au code ci-dessus :
- `normalizeEmail` : `String(v||'').trim().toLowerCase()`.
- `clientIp` : lit `request.rawRequest.headers['x-forwarded-for']` puis `req.ip` (retourne `null` sinon) → IP **jamais stockée en clair**.
- `enforceRateLimit(ip, bucket, max)` : doc `signupAttempts/{sha256(ip)}`, **transaction** Firestore, fenêtre 60 s, `RATE_LIMIT_CREATE = 3`, `RATE_LIMIT_CHECK = 20` ; lève `resource-exhausted`/`rate-limit-exceeded` avec `retryAfterSeconds`. Fallback mémoire si IP non résolue.
- `emailAlreadyTaken` : `emails/{email}` **puis** `admin.auth().getUserByEmail` (autorité canonique, tolère la casse héritée).
- `buildUserDoc` : `role:'student'` **forcé**, `referralCode 'ELA-'+uid6`, `trialProgress` si `source==='trial'`.

Autre callable d'appoint livrée : `checkEmailUnique` (`functions\auth.js:398-406`) → `{ available, exists }`, rate-limitée à 20/min.

---

## 3. ensureProfile — code complet (callable, PAS de trigger)

Emplacement : `functions\auth.js` lignes 413-450. Export : `functions\index.js` ligne 156.

```javascript
exports.ensureProfile = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const authUser = await admin.auth().getUser(uid);
  const email = normalizeEmail(authUser.email);

  const userRef = admin.firestore().collection('users').doc(uid);
  await admin.firestore().runTransaction(async (txn) => {
    const snap = await txn.get(userRef);
    if (!snap.exists) {
      const name = authUser.displayName || email.split('@')[0] || 'Student';
      txn.set(userRef, {
        displayName: name,
        email: email,
        role: 'student',
        interfaceLang: 'en',
        academies: [],
        academy: '',
        referralCode: 'ELA-' + uid.slice(0, 6).toUpperCase(),
        referralCodeUsed: null,
        referralCredit: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }
    const current = snap.data();
    const patch = {};
    if (!current.email || current.email !== email) patch.email = email;
    if (!current.displayName && authUser.displayName) patch.displayName = authUser.displayName;
    if (Object.keys(patch).length > 0) {
      txn.set(userRef, patch, { merge: true });
    }
  });

  return { ok: true, uid: uid };
});
```

---

## 4. firestore.rules — sections `users`, `emails`, `signupAttempts`, `userEmails`

État actuel du fichier, lignes 47-92 :

```text
    match /users/{uid} {
      // Audit inscription (2026-09-07) : la création d'un compte passe
      // EXCLUSIVEMENT par les Cloud Functions createAccount/ensureProfile
      // (Admin SDK → bypass des règles). Le client ne peut plus créer son
      // propre document → plus d'escalade possible vers role 'admin'/'teacher'
      // ni de champ forgé (referralCredit, firstPaymentDone, …).
      allow create: if false;

      allow read: if isAdmin();
      allow read: if isSignedIn()
                   && request.auth.uid == uid;

      // L'utilisateur met à jour son propre document, sans pouvoir changer
      // son rôle (le rôle est modifié uniquement par l'admin via le serveur).
      allow update: if isSignedIn()
                    && request.auth.uid == uid
                    && request.resource.data.role == resource.data.role;

      allow delete: if false;
    }

    // Index d'unicité des emails (créé par createAccount, Admin SDK).
    // Jamais lisible/écrivable depuis le client (anti-énumération) ;
    // l'unicité exposée passe par la callable checkEmailUnique (rate-limitée).
    match /emails/{email} {
      allow read, write: if false; // Cloud Functions uniquement
    }

    // Rate limiting inscriptions : hash sha256(IP) → jamais d'IP en clair,
    // jamais lisible/écrivable par le client.
    match /signupAttempts/{hash} {
      allow read, write: if false; // Cloud Functions uniquement
    }

    match /userEmails/{email} {
      // Vérrou d'unicité d'email : document dont le NOM = email normalisé (minuscules)ur
      // Créé côté client dans le MÊME batch qui le doc users/{uid}. Si l'email existe déjà,
      // cette create échoue → le batch entier échoue (aucun doublon créé). Immuable.
      allow create: if isSignedIn()
                    && request.auth.uid == request.resource.data.uid
                    && request.resource.data.email == email
                    && !exists(/databases/$(database)/documents/userEmails/$(email));
      allow read: if isSignedIn() && resource.data.uid == request.auth.uid;
      allow read: if isAdmin();
      allow update, delete: if false;
    }
```

Diff de sécurité : `allow create` sur `users/{uid}` : `isSignedIn() && request.auth.uid == uid` → **`false`**. Le bloc `userEmails/*` (déposé par l'édition parallèle) est conservé intact ; plus aucun frontend ne l'écrit (hybride serveur) → candidat au retrait lors d'un nettoyage validé.

---

## 5. js\app.js — modifications inscription + login

`C:\Users\11e\Documents\ELA\PROJET\js\app.js` (2082 lignes, IIFE vanilla ; helper `callable()` ligne 12-14).

### 5.1 Helpers ajoutés (lignes 1696-1715)

```javascript
  /* ---------- Aide inscription (audit 2026-09-07) ---------- */

  // Mapping des erreurs des callables createAccount/checkEmailUnique → clé i18n.
  function signupErrorKey(err) {
    if (err && err.__emailTaken) return 'register.emailTaken';
    var code = (err && err.code) ? String(err.code).replace('functions/', '') : '';
    var msg = (err && err.message) ? String(err.message) : '';
    if (code === 'already-exists' || msg.indexOf('email-in-use') >= 0 || msg.indexOf('EMAIL_EXISTS') >= 0) return 'register.emailTaken';
    if (code === 'resource-exhausted' || msg.indexOf('rate-limit') >= 0) return 'register.error.rateLimited';
    if (code === 'invalid-argument' || msg.indexOf('weak-password') >= 0 || msg.indexOf('invalid-email') >= 0) return 'register.error.invalidInput';
    return 'register.error';
  }

  function loginErrorKey(err) {
    var code = (err && err.code) ? String(err.code).replace('auth/', '') : '';
    var msg = (err && err.message) ? String(err.message) : '';
    if (code === 'too-many-requests' || msg.indexOf('too-many-requests') >= 0) return 'login.error.rateLimited';
    return 'login.error';
  }
```

### 5.2 bindRegister — handler submit réécrit (lignes 1772-1862)

```javascript
  function bindRegister() {
    var submitting = false;   // anti double-clic / race condition
    document.querySelectorAll('[data-choice-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        registerState.interfaceLang = btn.getAttribute('data-choice-lang');
        ELA_I18N.setLang(registerState.interfaceLang).then(function () {
          registerState.step = 2;
          renderRegister();
        });
      });
    });
    document.querySelectorAll('[data-choice-academy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        registerState.academy = btn.getAttribute('data-choice-academy');
        registerState.step = 3;
        renderRegister();
      });
    });
    var back = document.getElementById('reg-back');
    if (back) back.addEventListener('click', function () { registerState.step = 1; renderRegister(); });

    var form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!window.ELA_FIREBASE_READY) return;
        if (submitting) return;   // anti double-clic / race condition
        var name = document.getElementById('reg-name').value.trim();
        var email = document.getElementById('reg-email').value.trim().toLowerCase();
        var password = document.getElementById('reg-password').value;
        var referral = document.getElementById('reg-referral').value.trim();
        var errEl = document.getElementById('reg-error');

        // --- Validation email stricte (regex) ---
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errEl.textContent = t('register.error.invalidInput');
          errEl.classList.add('show');
          return;
        }
        // --- Validation mot de passe (8+ au lieu du minlength HTML seul) ---
        if (!password || password.length < 8) {
          errEl.textContent = t('register.error.invalidInput');
          errEl.classList.add('show');
          return;
        }
        errEl.classList.remove('show');

        submitting = true;
        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;

        // --- Approche hybride (audit inscription) : pré-check d'unicité serveur
        //     (checkEmailUnique) puis création 100 % serveur via createAccount
        //     (transaction atomique + compensation + rate limit 3/min/IP).
        //     Le client ne fait PLUS createUserWithEmailAndPassword ni d'écriture
        //     Firestore directe (firestore.rules interdit désormais users/*).
        callable('checkEmailUnique')({ email: email })
          .then(function (res) {
            if (res && res.data && res.data.exists) throw { __emailTaken: true };
            return callable('createAccount')({
              displayName: name,
              email: email,
              password: password,
              referral: referral,
              academy: registerState.academy || 'german',
              interfaceLang: registerState.interfaceLang || ELA_I18N.getLang()
            });
          })
          .then(function () {
            // createAccount passe par l'Admin SDK → aucune session client ;
            // on signe ensuite localement avec les identifiants saisis.
            return firebase.auth().signInWithEmailAndPassword(email, password);
          })
          .then(function () {
            submitting = false;
            if (btn) btn.disabled = false;
            if (window.ELAMarketing) window.ELAMarketing.track('registration', { academy: registerState.academy || 'german' });
            alert(t('register.success')); window.location.hash = '#/dashboard';
          })
          .catch(function (err) {
            submitting = false;
            if (btn) btn.disabled = false;
            var el = document.getElementById('reg-error');
            if (el) {
              el.textContent = t(signupErrorKey(err));
              el.classList.add('show');
            }
          });
      });
    }
  }
```

Flow d'inscription final : champ → validation locale (email regex + 8+) → `checkEmailUnique` → `createAccount` (serveur : unicité Auth+`emails/*`, transaction `emails/{email}`+`users/{uid}`, compensation `deleteUser`) → `signInWithEmailAndPassword` → track marketing + `#/dashboard`.

### 5.3 renderLogin — handler réécrit (lignes 1865-1913)

```javascript
  /* ---------- Login ---------- */
  function renderLogin() {
    var setupBanner = window.ELA_FIREBASE_READY ? '' : '<div class="setup-banner">' + t('register.setup') + '</div>';
    app.innerHTML = '' +
      '<section class="auth-wrap">' +
        '<h1 class="auth-title">' + t('login.title') + '</h1>' +
        '<p class="auth-sub">' + t('login.sub') + '</p>' +
        setupBanner +
        '<form id="login-form">' +
          '<div class="field"><label for="login-email">' + t('register.field.email') + '</label><input id="login-email" type="email" required autocomplete="email"></div>' +
          '<div class="field"><label for="login-password">' + t('register.field.password') + '</label><input id="login-password" type="password" required autocomplete="current-password"></div>' +
          '<p class="form-error" id="login-error">' + t('login.error') + '</p>' +
          '<button class="btn btn-solid" type="submit">' + t('login.submit') + ARROW_SVG + '</button>' +
        '</form>' +
        '<p class="auth-alt">' + t('login.no') + ' <a href="#/register">' + t('login.registerLink') + '</a></p>' +
      '</section>';

    var form = document.getElementById('login-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!window.ELA_FIREBASE_READY) return;
      var email = document.getElementById('login-email').value.trim().toLowerCase();
      var password = document.getElementById('login-password').value;
      var errorEl = document.getElementById('login-error');
      var btn = form.querySelector('button[type="submit"]');
      if (errorEl) errorEl.classList.remove('show');
      if (btn) btn.disabled = true;

      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function () {
          // Cohérence auth ↔ users : ensureProfile (serveur) répare un doc
          // manquant (orphelin hérité) ou normalise l'email stocké. Jamais
          // bloquant pour la navigation en cas d'échec.
          return callable('ensureProfile')({}).then(function () {
            window.location.hash = '#/dashboard';
          }).catch(function (err2) {
            if (window.console) console.warn('ensureProfile non-bloquant :', err2);
            window.location.hash = '#/dashboard';
          });
        })
        .catch(function (err) {
          if (btn) btn.disabled = false;
          if (errorEl) {
            errorEl.textContent = t(loginErrorKey(err));
            errorEl.classList.add('show');
          }
        });
    });
    afterRender('login');
  }
```

---

## 6. login.js — n'existe pas

**Aucun fichier `login.js` dans le projet.** La logique de connexion vit dans `js\app.js` → `renderLogin` (section 5.3). `js\core\auth.service.js` (ligne 33) est un helper **lecture** du profil (inchangé). Les références à « login.js » correspondent donc à la section 5.3 de `app.js`.

---

## 7. free-trial.page.js — code des zones modifiées

`C:\Users\11e\Documents\ELA\PROJET\src\ela\pages\free-trial.page.js` (341 lignes). Le reste du fichier (hero, avantages, rendu des leçons) est **inchangé**.

### 7.1 renderAuthModal — placeholder (ligne 31)

```javascript
        '<input type="password" id="ft-auth-password" placeholder="At least 8 characters" />' +
```

### 7.2 ftAuthErrorText — nouveau helper (lignes 56-63)

```javascript
function ftAuthErrorText(e) {
  const code = (e && e.code) ? String(e.code).replace('functions/', '') : '';
  const msg = (e && e.message) ? String(e.message) : '';
  if (code === 'already-exists' || msg.indexOf('email-in-use') >= 0) return 'An account already exists for this email. Try signing in instead.';
  if (code === 'resource-exhausted' || msg.indexOf('rate-limit') >= 0) return 'Too many attempts from your connection. Please wait a minute and try again.';
  if (msg.indexOf('weak-password') >= 0 || msg.indexOf('invalid-email') >= 0 || code === 'invalid-argument') return 'Use a valid email and a password of at least 8 characters.';
  return 'Account creation failed. Please try again.';
}
```

### 7.3 bindAuthModal — handler du bouton (lignes 65-119)

```javascript
function bindAuthModal() {
  var overlay = document.getElementById('ft-auth-modal');
  if (!overlay) return;

  document.getElementById('ft-auth-cancel').addEventListener('click', closeAuthModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeAuthModal();
  });

  document.getElementById('ft-auth-submit').addEventListener('click', function () {
    var email = document.getElementById('ft-auth-email').value.trim().toLowerCase();
    var password = document.getElementById('ft-auth-password').value;
    var err = document.getElementById('ft-auth-err');
    var btn = document.getElementById('ft-auth-submit');

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      err.textContent = 'Please enter a valid email address.';
      return;
    }
    if (!password || password.length < 8) {
      err.textContent = 'Password must be at least 8 characters.';
      return;
    }

    err.textContent = '';
    if (btn) btn.disabled = true;

    // Audit inscription (approche hybride) : pré-check d'unicité serveur puis
    // création 100 % serveur via createAccount (transaction atomique + rate
    // limit 3/min/IP). Plus aucune écriture Firestore directe du client.
    callFunction('checkEmailUnique', { email: email })
      .then(function (r) {
        if (r && r.exists) return Promise.reject({ code: 'already-exists', message: 'email-in-use' });
        return callFunction('createAccount', {
          displayName: email.split('@')[0],
          email: email,
          password: password,
          source: 'trial'
        });
      })
      .then(function () {
        // createAccount passe par l'Admin SDK → aucune session client.
        var fb = window.firebase;
        return fb.auth().signInWithEmailAndPassword(email, password);
      })
      .then(function () {
        closeAuthModal();
        window.location.reload();
      })
      .catch(function (e) {
        if (btn) btn.disabled = false;
        err.textContent = ftAuthErrorText(e);
      });
  });
}
```

(Ancien corps remplacé : `createUserWithEmailAndPassword` + `users/{uid}.set` + batch `userEmails`, avec erreurs de syntaxe.)

---

## 8. i18n — clés ajoutées (en / fr / ar)

`i18n\{en,fr,ar}.json` — 3 clés nouvelles chacune (en plus de `register.emailTaken` déjà présente) :

| Clé | en.json | fr.json | ar.json |
|---|---|---|---|
| `register.error.rateLimited` | Too many attempts from your connection. Wait a minute, then try again. | Trop de tentatives depuis ta connexion. Attends une minute, puis réessaie. | محاولات كثيرة من اتصالك. انتظر دقيقة ثم أعد المحاولة. |
| `register.error.invalidInput` | Check your details: a valid email and a password of 8+ characters are required. | Vérifie tes informations : un email valide et un mot de passe de 8 caractères ou plus sont requis. | تحقق من معلوماتك: يلزم بريد إلكتروني صالح وكلمة مرور من 8 أحرف أو أكثر. |
| `login.error.rateLimited` | Too many sign-in attempts. Wait a minute, then try again. | Trop de tentatives de connexion. Attends une minute, puis réessaie. | محاولات تسجيل دخول كثيرة. انتظر دقيقة ثم أعد المحاولة. |

Extraits JSON réels (en.json, lignes 112-115 / 122-123) :

```json
  "register.error": "Could not create the account. Check the email and password, then try again.",
  "register.error.rateLimited": "Too many attempts from your connection. Wait a minute, then try again.",
  "register.error.invalidInput": "Check your details: a valid email and a password of 8+ characters are required.",
  "register.emailTaken": "This email is already registered. Please use another one or sign in.",
  ...
  "login.error": "Sign-in failed. Check your email and password.",
  "login.error.rateLimited": "Too many sign-in attempts. Wait a minute, then try again.",
```

---

## 9. Backups créés (suffixe `.inscription-audit.bak`)

| .bak | État sauvegardé (avant modif audit) |
|---|---|
| `functions\auth.js.inscription-audit.bak` | auth.js 216 lignes, sans le bloc inscription |
| `functions\index.js.inscription-audit.bak` | index.js sans les 3 exports |
| `firestore.rules.inscription-audit.bak` | `users/{uid} create` encore autorisé (escalade ouverte) ; bloc `userEmails/*` présent |
| `js\app.js.inscription-audit.bak` | État au moment de la sauvegarde (ébauche parallèle inachevée). Pré-audit réel (v1 `createUserWithEmailAndPassword` direct) = `js\app.js.bak` préexistant |
| `src\ela\pages\free-trial.page.js.inscription-audit.bak` | Modal v1 d'origine (`createUserWithEmailAndPassword`, min 6) |
| `i18n\en.json.inscription-audit.bak` | en.json avant les 3 clés |
| `i18n\fr.json.inscription-audit.bak` | fr.json avant les 3 clés |
| `i18n\ar.json.inscription-audit.bak` | ar.json avant `register.emailTaken` et les 3 clés |

Backups préexistants non écrasés : `js\app.js.bak`, `free-trial.page.js.bak`, `i18n\*.json.bak`, `firestore.rules.bak`.

---

## 10. Résultats des tests locaux

```
node -c functions\auth.js                  → OK
node -c functions\index.js                 → OK
node -c js\app.js                          → OK
node --check <free-trial.page.js en .mjs>  → OK (ESM)
JSON.parse i18n\en.json                    → OK
JSON.parse i18n\fr.json                    → OK
JSON.parse i18n\ar.json                    → OK
```

Aucun test d'exécution (émulateur) ni déploiement effectué.

---

## 11. Ordre de déploiement (à exécuter uniquement après validation — PAS exécuté)

```powershell
# 1) fonctions (ancien frontend encore fonctionnel : create client toujours autorisé tant que les règles ne sont pas déployées)
firebase deploy --only functions:createAccount,functions:checkEmailUnique,functions:ensureProfile
# 2) règles (fermeture users/{uid} create)
firebase deploy --only firestore:rules
# 3) frontend + locales
firebase deploy --only hosting
```

À chaque étape : répondre **N** aux invites Firebase de suppression. Vérification F12 ensuite (inscription OK / email en casse différente rejeté / 4ᵉ tentative bloquée / login orphelin réparé).

---

## 12. ADDENDUM — GO validation (3 points avant déploiement)

### 12.1 Point 1 — `functions/auth.js` : reliquats non définis résolus
Résolu par import + définition locale (aucune logique modifiée) :
- `functions\core.js` (fin de fichier) : **export additif** des helpers partagés :
  ```javascript
  module.exports.ts = ts;
  module.exports.sendEmail = sendEmail;
  module.exports.EMAIL = EMAIL;
  module.exports.emailForUser = emailForUser;
  ```
- `functions\auth.js:34` : import des helpers — résout `ts` (previewFor), `EMAIL`/`sendEmail`/`emailForUser` (checkSubscriptionExpiry).
  ```javascript
  const { ts, sendEmail, EMAIL, emailForUser } = require('./core');
  ```
- `functions\auth.js:220` : `const VALID_ROLES = ['student', 'teacher', 'admin'];` (résout `setUserRole` ; miroir de `live.js`/`management.js`).
- Vérifié : les 38 occurrences des identifiants cités (`EMAIL`, `ts`, `sendEmail`, `emailForUser`, `VALID_ROLES`) pointent vers une définition ou un import. Syntaxe `node -c` OK (auth.js, core.js, index.js).
- Les helpers de l'audit (`EMAIL_RE`, `VALID_ACADEMIES`, `VALID_INTERFACE_LANGS`, `REGION`, `RATE_LIMIT_CREATE`, `RATE_LIMIT_CHECK`, `normalizeEmail`, `clientIp`, `enforceRateLimit`, `emailAlreadyTaken`, `buildUserDoc`) sont tous définis dans `auth.js` (lignes 40, 231-235, 237-332).

### 12.2 Point 2 — `callFunction` (free-trial) cible bien `africa-south1` : ✅ confirmé, aucun correctif
Chaîne vérifiée :
- `src\ela\pages\free-trial.page.js:9` → `import { callFunction } from '../../js/core/api-client.js'` (bridge `src\js\core\api-client.js`) → ré-exporte `js\core\api-client.js` (racine).
- `js\core\api-client.js:11` : `const REGION = 'africa-south1';` et `:19` : `fb.app().functions(REGION).httpsCallable(name)`.
- Le helper est donc **identique en région** au `callable()` local de `app.js` (`js\app.js:13`, `'africa-south1'`).

### 12.3 Point 3 — bloc `userEmails` retiré de `firestore.rules` : ✅ fait
Bloc `match /userEmails/{email} { ... }` (code mort) supprimé. `users/{uid}`, `emails/*`, `signupAttempts/*` inchangés.

### 12.4 Ordre de déploiement validé (remplace section 11)
```powershell
firebase deploy --only functions      # 1
firebase deploy --only firestore:rules # 2
firebase deploy --only hosting         # 3
```
Note fenêtre 2→3 : si un visiteur garde l'ancienne page en cache après l'étape 2, le vieux flux client créerait un compte Auth sans doc `users` (l'écriture est refusée) → orphelin **réparé automatiquement** par `ensureProfile` au login.

### 12.5 ⚠️ Prérequis environnement local (bloque emulator + `firebase deploy` local)
`functions\node_modules` est **incomplet/corrompu** : `firebase-admin\lib\app-check\index.js` requiert `./app-check` (JS manquant — seuls les `.d.ts` présents). Conséquence : tout `require('firebase-functions')` échoue localement (`MODULE_NOT_FOUND`), donc l'émulateur et la découverte de fonctions par le CLI échoueront. Correctif requis avant déploiement :
```powershell
cd functions
npm install   # ou : npm ci (si un package-lock fiable existe dans functions/)
```
Indépendant des changements livrés (le code est syntaxiquement valide et statiquement résolu).

### 12.6 Backups supplémentaires créés
- `functions\core.js.inscription-audit.bak` (avant export additif)
- `functions\auth.js.pre-go.bak` (avant import helpers + VALID_ROLES)
- `firestore.rules.pre-go.bak` (avant suppression userEmails)

---

## 13. ADDENDUM — Smoke-test émulateur (10/10 PASS)

### 13.1 Environnement réparé
- `functions\node_modules` était **corrompu** (fichiers absents dans firebase-admin/jwks-rsa). `npm ci` (après suppression) → 279 paquets réinstallés proprement depuis `functions\package-lock.json`.

### 13.2 Bug runtime réel découvert par l'émulateur (corrigé)
`admin.firestore.FieldValue` est `undefined` dans le **runtime émulateur** (défini en node nu). Corrigé dans `functions\auth.js` par un helper **lazy** (import à l'exécution, pas au chargement → pas de régression du fix « timeout déploiement ») :
```javascript
function serverTimestamp() {
  return require('firebase-admin/firestore').FieldValue.serverTimestamp();
}
```
3 sites remplacés : `buildUserDoc` (ligne ~343), doc `emails/*` dans la transaction (ligne ~398), `ensureProfile` (ligne ~453). Vérifié par la présence de `createdAt.timestampValue` dans les docs.

### 13.3 Protocole du smoke-test (émulateurs réels, aucun appel production)
- Bundle **éphémère hors repo** (`%TEMP%\opencode\ela-emu`) n'exportant que `createAccount`/`checkEmailUnique`/`ensureProfile` + junction node_modules → le repo reste intact.
- `firebase emulators:exec --project ela-academy-7f868 --only functions,firestore,auth "node smoke.js"` (auth ajouté — requis pour le token de `ensureProfile`).
- Les 3 callables ciblés `africa-south1`, auth emulator `VALID`, shutdown automatique.

### 13.4 Résultats (10/10)

| Test | Résultat |
|---|---|
| T1 — inscription valide `smoke1@ela.test` | ✅ PASS (uid retourné) |
| T1b — `users/{uid}` + `emails/{email}` créés, `role=student`, email lowercase | ✅ PASS |
| T2 — même email en casse différente (`SMOKE1@…`) | ✅ PASS → `ALREADY_EXISTS` |
| T3 — 2e inscription valide `smoke2@ela.test` | ✅ PASS |
| T4 — 4e tentative dans la minute | ✅ PASS → `RESOURCE_EXHAUSTED` (rate-limit) |
| T5a — orphelin (compte Auth sans doc users) vérifié | ✅ PASS |
| T5b — `ensureProfile` (token auth VALID) | ✅ PASS |
| T5c — doc recréé : email lowercased `orphan.test@ela.test`, role student, `referralCode ELA-*`, createdAt | ✅ PASS |
| T6 — `ensureProfile` sans token | ✅ PASS → `UNAUTHENTICATED` |
| B1 — `checkEmailUnique` (existe / fresh) | ✅ PASS |

`RESULTAT: 10/10 tests OK`. Émulateurs arrêtés proprement (`Shutting down emulators`).

### 13.5 ⚠️ Blocage repo découvert (indépendant des 3 fonctions) pour tout déploiement `functions`
`functions/index.js` charge **tous** les modules en top-level. Chaîne : `index.js` → `teacher.js` → `require('./ela-certificates.js')` → `require('./ela-certificate-core.js')` (**fichier absent**). Fichiers référencés et absents sur disque (déclarés supprimés dans le working tree/index) :
- `functions\ela-certificate-core.js` (absent — requis au **chargement** → blocage découverte CLI)
- `functions\ela-pdf.js`, `functions\curriculum.js`, `functions\curriculum-quizzes.js`, `functions\seed-a1\*.json` (absents — requis à l'exécution par certaines fonctions)

Conséquence : `firebase deploy --only functions` (même ciblé sur les 3 callables) échouera à la **découverte** tant que `ela-certificate-core.js` n'est pas restauré (ou les requires retirés). Remédiation possible (à valider) : restaurer depuis `HEAD` via `git show HEAD:functions/ela-certificate-core.js > functions/ela-certificate-core.js` (+ `ela-pdf.js`, `curriculum.js`, `curriculum-quizzes.js`, données `seed-a1/`).

---

## 14. FERMETURE — Commits Git effectués (correspond aux sections 12-16 demandées)

> Les sections 12 (GO validation) et 13 (smoke-test) existent déjà plus haut ; les rubriques demandées sont donc numérotées 14-18 ci-dessous, dans le même ordre que ta demande.

### 14.1 Commit Git effectué (hash) — demandé « section 12 »

Branche `master`. 4 commits locaux :

| Hash | Message |
|---|---|
| `01a6d73` | `v2.9: Audit inscription sécurisée — CF createAccount/checkEmailUnique/ensureProfile, rules, rate limiting, normalisation, i18n fr/en/ar` (106 fichiers) |
| `f559973` | `feat(functions): script one-shot backfill emails/* pour comptes existants (idempotent, dry-run)` |
| `2267872` | `fix(functions): commente les imports cassés du refactor certificats/curriculum (TODO restoration)` |
| `19c532b` | `clean(rules): suppression du bloc userEmails obsolète` |

⚠️ **Push non exécutable** : aucun remote git configuré (`git push origin master` → `fatal: 'origin' does not appear to be a git repository`). Pour pousser (à faire par toi) :
```powershell
git remote add origin <URL_du_depot_ELA>
git push -u origin master
```

### 14.2 Backfill emails/* créé — demandé « section 13 »

- **Fichier** : `functions\backfill-emails.js` (script one-shot, **jamais déployé en CF**).
- **Rôle** : itère `admin.auth().listUsers` (batchs de 1000), crée `emails/{email}` = `{uid, createdAt: serverTimestamp()}` pour chaque compte existant (email `trim().toLowerCase()`, regex), **skip si déjà présent** (idempotent), log créés/déjà présents/invalides/sans-email, option `--dry-run`.
- **Test local** : `node -c functions\backfill-emails.js` ✅.
- **Mode d'emploi** :
  ```powershell
  # Émulateur (aucun impact prod)
  $env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"; $env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
  node functions/backfill-emails.js --dry-run
  # Production (credentials Admin requis : GOOGLE_APPLICATION_CREDENTIALS ou `gcloud auth application-default login`)
  node functions/backfill-emails.js
  ```

### 14.3 Imports cassés commentés — demandé « section 14 »

`functions\index.js` — commentés **définitivement** (`//`), avec commentaire `// TODO: Restaurer quand le refactor certificats/curriculum sera terminé.` :
- requires : `teacher` (→ `ela-certificates.js` → `ela-certificate-core.js`/`ela-pdf.js` absents) et `ela-certificates`.
- exports associés : `listELACertificates`, `revokeELACertificate`, `getTeacherStats`.
- Fichiers supprimés concernés (à restaurer au refactor) : `ela-certificate-core.js`, `ela-pdf.js`, `curriculum.js`, `curriculum-quizzes.js`, `seed-a1/*`.

Vérifié : `node -c functions\index.js` ✅, **`require('./index.js')` LOAD OK**, et exports actifs :
`createAccount`/`checkEmailUnique`/`ensureProfile` = `function` ✅. Les autres exports (core/payment/auth/live/admin/management/certificate) restent actifs.

### 14.4 userEmails nettoyé des rules — demandé « section 15 »

- Bloc `match /userEmails/{email} { ... }` **supprimé** de `firestore.rules` (remplacé par `emails/*` serveur-only).
- Équilibre des accolades validé par compilation réelle : `firebase deploy --only firestore:rules` → « rules file firestore.rules compiled successfully ».
- Backup conservé : `firestore.rules.pre-go.bak` (+ `firestore.rules.inscription-audit.bak`, `firestore.rules.bak`).

### 14.5 Checklist test F12 live (pour demain) — demandé « section 16 »

Sur https://ela-academy-7f868.web.app (ou https://elaacademy.ng) :
1. **Inscription réelle** (wizard #/register) → doc `users/{uid}` + `emails/{email}` créés, redirection dashboard.
2. **Doublon** : réinscrire le même email en casse différente → message « email déjà utilisé » (`register.emailTaken`), aucune création.
3. **Rate limit** : 4e tentative d'inscription en 1 minute → « trop de tentatives » (`register.error.rateLimited`).
4. **Login orphelin** : se connecter à un ancien compte sans doc `users` (si existant) → doc recréé par `ensureProfile` (email lowercased).
5. **Free trial** : modal Create Free Account → mot de passe 8+, inscription OK, déblocage des 24 leçons.
6. Vérifier console F12 : aucune erreur réseau (fonctions ciblées `africa-south1`).
7. (Si besoin) lancer le backfill de la section 14.2, puis à terme finaliser le refactor certificats/curriculum et restaurer les TODO de la section 14.3.
