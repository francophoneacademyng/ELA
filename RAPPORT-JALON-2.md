# RAPPORT FINAL — JALON 2 (PAYSTACK) — ELA ACADEMY

Projet : `ela-academy-7f868`
Commit : `57f5ffb` — « milestone 2 paystack integration (functions, rules, checkout, i18n) - not deployed »
Région des fonctions Paystack : `africa-south1`
Fichier principal : `functions/index.js`

---

## 1. Fichiers créés / modifiés

Aucun fichier **créé**. Huit fichiers **modifiés** :

| Fichier | Modification |
|---|---|
| `functions/index.js` | + `admin.initializeApp()` + 3 fonctions Paystack + table de prix canonique |
| `functions/.env.example` | + `PAYSTACK_CALLBACK_URL` (optionnel) |
| `firestore.rules` | + règles `subscriptions/{uid}` et `transactions/{reference}` |
| `index.html` | + script `firebase-functions-compat.js` |
| `js/app.js` | + table `PRICING` (affichage), page `#/checkout`, page `#/payment/result`, routeur renforcé, bouton « Subscribe now » |
| `i18n/en.json` | + clés `checkout.*`, `payment.*`, `pricing.subscribe` |
| `i18n/fr.json` | idem (FR) |
| `i18n/ar.json` | idem (AR) |

`functions/.env` (le secret) n'est **pas** versionné et reste ignoré par `.gitignore`.

---

## 2. Rôle des 4 fonctions

| Fonction | Type | Auth | Région | Rôle |
|---|---|---|---|---|
| `healthCheck` | `onRequest` | non | `us-central1` (défaut, non modifiée) | Santé du système (Jalon 1, conservée) |
| `initializePayment` | `onCall` | oui | `africa-south1` | Initie le paiement **côté serveur** : recalcule le montant (jamais depuis le client), appelle `POST /transaction/initialize`, crée `transactions/{reference}` en `pending`, renvoie `authorizationUrl` + `reference`. |
| `verifyPaystackPayment` | `onCall` | oui | `africa-south1` | Vérifie le paiement : `GET /transaction/verify/{reference}`, contrôle `status == success`, **revalide montant + appartenance**, puis active l'abonnement. |
| `paystackWebhook` | `onRequest` | non (serveur→serveur) | `africa-south1` | Reçoit `charge.success`, **vérifie la signature HMAC SHA-512**, active l'abonnement de façon idempotente. |

Le frontend appelle les callables via `firebase.functions().httpsCallable('initializePayment')` et `('verifyPaystackPayment')`.

**Flux complet** : choix plan/durée → `initializePayment` → redirection `authorization_url` → retour `#/payment/result` → `verifyPaystackPayment`. Le webhook est le chemin de secours fiable (fonctionne même si l'utilisateur ferme le navigateur).

---

## 3. Table de prix serveur (montants exacts en kobo)

Source de vérité côté serveur (`PRICE_TABLE` dans `functions/index.js`), montants en NGN convertis en kobo par `amount × 100` :

```js
const PRICE_TABLE = {
  general:  { 1: 75000,  3: 200000, 6: 405000 },
  premium:  { 1: 120000, 3: 320000, 6: 648000 },
  business: { 1: 150000, 3: 420000, 6: 840000 }
};

function getAmountNaira(plan, duration) {
  const p = PRICE_TABLE[plan];
  if (!p) return null;
  const amount = p[duration];
  return amount ? amount : null;
}
```

Montants envoyés à Paystack (`amount: amount * 100`, `currency: 'NGN'`) :

| Path | 1 mois | 3 mois | 6 mois |
|---|---|---|---|
| **general** | ₦75,000 → **7,500,000 kobo** | ₦200,000 → **20,000,000 kobo** | ₦405,000 → **40,500,000 kobo** |
| **premium** | ₦120,000 → **12,000,000 kobo** | ₦320,000 → **32,000,000 kobo** | ₦648,000 → **64,800,000 kobo** |
| **business** | ₦150,000 → **15,000,000 kobo** | ₦420,000 → **42,000,000 kobo** | ₦840,000 → **84,000,000 kobo** |

La table `PRICING` dans `js/app.js` ne sert qu'à l'affichage ; le serveur recalcule toujours le montant.

---

## 4. Vérification de la signature HMAC du webhook

Extrait du code (`functions/index.js`) :

```js
const signature = req.headers['x-paystack-signature'];
if (!signature) {
  res.status(400).send('missing signature');
  return;
}

const rawBody = req.rawBody ? req.rawBody : Buffer.from(req.body ? JSON.stringify(req.body) : '');
const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
if (hash !== signature) {
  res.status(401).send('invalid signature');
  return;
}
```

Points clés :
- Paystack signe le **corps brut** de la requête en HMAC **SHA-512** avec la clé secrète, transmise dans l'en-tête `x-paystack-signature`.
- On recalcule le HMAC sur `req.rawBody` (Buffer fourni par Firebase Functions) puis comparaison par **égalité stricte** (`!==`).
- Codes de réponse : `500` secret absent · `400` en-tête absent · `401` signature invalide · `200` OK.
- Le webhook **revalide aussi le montant** contre la table canonique avant d'accorder l'abonnement.

---

## 5. Mécanisme d'idempotence (anti double-paiement)

Référence unique générée côté serveur dans `initializePayment` :

```js
const reference = `ela-${uid.slice(0, 8)}-${Date.now()}`;
```

Document créé en `pending` à l'init :

```js
await db.collection('transactions').doc(reference).set({
  uid, email, amount, plan, duration,
  status: 'pending',
  createdAt: admin.firestore.FieldValue.serverTimestamp()
});
```

Activation transactionnelle et idempotente :

```js
async function grantSubscription({ uid, plan, duration, amount, reference }) {
  const txRef = db.collection('transactions').doc(reference);
  const subRef = db.collection('subscriptions').doc(uid);

  await db.runTransaction(async (t) => {
    const txDoc = await t.get(txRef);
    if (txDoc.exists && txDoc.data().status === 'success') {
      return; // déjà accordé — idempotent
    }

    const now = new Date();
    let start = now;
    const subDoc = await t.get(subRef);
    if (subDoc.exists) {
      const existing = subDoc.data();
      if (existing.status === 'active' && existing.endDate && existing.endDate.toDate() > now) {
        start = existing.endDate.toDate();
      }
    }
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);

    t.set(subRef, {
      plan, duration, status: 'active',
      startDate: admin.firestore.Timestamp.fromDate(start),
      endDate: admin.firestore.Timestamp.fromDate(end),
      amount, reference,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    t.set(txRef, {
      uid, plan, duration, amount, status: 'success',
      paidAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
}
```

Mécanisme :
- Le `transactions/{reference}` sert de verrou : si le statut est déjà `success`, la transaction **ne fait rien**.
- `verifyPaystackPayment` **et** `paystackWebhook` appellent la **même** `grantSubscription()` → un retour utilisateur + un webhook simultanés n'accordent qu'**une seule fois** l'abonnement.
- L'écriture est atomique (`runTransaction`) : lecture du verrou + écriture abonnement + passage en `success` dans une seule transaction.
- **Extension** : si un abonnement actif non expiré existe, la nouvelle période démarre à l'`endDate` existante (le temps restant n'est pas écrasé).

---

## 6. Règles Firestore ajoutées

```rules
match /subscriptions/{uid} {
  allow read: if request.auth != null
              && request.auth.uid == uid;
  allow write: if false;
}

match /transactions/{reference} {
  allow read: if request.auth != null
              && resource.data.uid == request.auth.uid;
  allow write: if false;
}
```

- Écritures **réservées au serveur** (Admin SDK contourne les règles) → le client ne peut pas forger un abonnement actif.
- Lecture limitée au propriétaire.
- `users/{uid}` et le deny-all générique restent inchangés.

---

## 7. Points d'attention / limites restantes

1. `healthCheck` en `us-central1` (défaut) vs fonctions Paystack en `africa-south1` — conservé volontairement, sans impact.
2. Signature HMAC à confirmer en production : le code privilégie `req.rawBody` (correct), le repli `JSON.stringify(req.body)` est fragile — à valider avec un vrai événement Paystack test.
3. Réduction parrainage (−₦15,000) **non déduite** du montant facturé (prévu au Jalon 4).
4. Pas d'expiration automatique des abonnements (`status` reste `active`) — Jalon 5.
5. Devise figée en `NGN` ; callback URL par défaut codée, surchargeable via `PAYSTACK_CALLBACK_URL`.
6. Pas d'App Check sur les callables (durcissement optionnel avant production).
7. `verifyPaystackPayment` exige l'authentification ; si l'utilisateur revient déconnecté, le webhook active quand même l'abonnement côté serveur.
8. `functions/.env` doit être créé manuellement (jamais commité) avec `PAYSTACK_SECRET`.

---

## Verdict technique

Code du Jalon 2 complet, sécurisé (secret serveur uniquement, montants recalculés côté serveur, HMAC SHA-512, idempotence transactionnelle) et commité proprement. Reste à prouver par des tests réels en clé test (émulateur ou production) — non effectués à ce stade.
