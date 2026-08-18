# GUIDE D'INSTALLATION — E-Learn Language Academy (Jalon 1)

## Ce que contient ce dossier

```
ELA-site/
├── index.html                  ← le site (page unique, navigation par routes)
├── assets/
│   ├── css/main.css            ← design émeraude/crème/or
│   └── img/ela-logo.svg        ← logo ELA
├── js/
│   ├── app.js                  ← routeur + pages (accueil, académies, tarifs, inscription, connexion)
│   ├── i18n.js                 ← moteur multi-langue (EN/FR/AR + RTL)
│   └── firebase-config.js      ← ⚠️ À REMPLIR sur ton PC
├── i18n/
│   ├── en.json / fr.json / ar.json   ← traductions de l'interface
├── firebase.json               ← config hosting Firebase
├── .firebaserc                 ← ⚠️ À REMPLIR (ID du projet Firebase)
└── functions/
    ├── index.js                ← squelette + healthCheck (Jalon 1)
    ├── package.json            ← Node 22
    └── .env.example            ← modèle pour les clés (copier en .env)
```

## Étape 1 — Le dossier du projet sur ton PC

Le projet vit dans :

```
C:\Users\11e\Documents\ELA\PROJET
```

Décompresse le ZIP et copie TOUT son contenu dans ce dossier (index.html, assets, js, i18n, functions, firebase.json, .firebaserc).

## Étape 2 — Créer le projet Firebase (gratuit)

1. Va sur https://console.firebase.google.com
2. « Add project » → nom : **ela-academy** (ou elearn-language-academy)
3. Désactive Google Analytics si proposé → Create project
4. Dans le projet : icône Web `</>` → « Add app » → nom : **ela-site** → coche « Firebase Hosting »
5. **Copie les valeurs de config affichées** (apiKey, authDomain, projectId...)

## Étape 3 — Remplir les 2 fichiers de configuration

**`js/firebase-config.js`** : remplace les 6 valeurs `A_REMPLIR_SUR_TON_PC` par les valeurs copiées à l'étape 2. (Ce sont des identifiants PUBLICS — pas des secrets.)

**`.firebaserc`** : remplace `A_REMPLIR_ID_PROJET_FIREBASE` par l'ID du projet (visible dans Project settings, ex. `ela-academy`).

## Étape 4 — Activer les services Firebase

Dans la console Firebase du nouveau projet :
1. **Authentication** → Get started → activer « Email/Password »
2. **Firestore Database** → Create database → mode production → région la plus proche
3. **Hosting** → sera déployé à l'étape 5

## Étape 5 — Déployer

Dans PowerShell, depuis le dossier du projet :

```powershell
cd "C:\Users\11e\Documents\ELA\PROJET"
firebase login
firebase use --add    # choisir le projet ela-academy
node_modules\.bin\firebase.cmd deploy
```

(Comme pour Francophone Academy : si `firebase.cmd` n'existe pas encore, fais d'abord `npm install firebase-tools` puis utilise `node_modules\.bin\firebase.cmd deploy`.)

⚠️ Réponds **N** à toute question proposant de supprimer des index ou des fonctions.

## Étape 6 — Vérifier

- Le site : https://TON-PROJET.web.app
- Le health check : https://TON-REGION-TON-PROJET.cloudfunctions.net/healthCheck

## Règles permanentes (identiques à FA)

- Jamais le mot « AI » sur le site → « Learning Assistant »
- Aucun emoji standard → SVG uniquement
- Aucune clé secrète dans le code → functions/.env uniquement
- Sauvegarde avant toute modification
- Répondre **N** aux invites de suppression Firebase

## Jalons suivants (déjà prévus dans functions/index.js)

- **Jalon 2** : paiements Paystack (grille 75k/120k/150k + réductions 3/6 mois)
- **Jalon 3** : Learning Assistant multi-langue (OpenRouter côté serveur)
- **Jalon 4** : parrainage (−₦15,000 filleul / ₦10,000 crédit parrain)
- **Jalon 5** : expiration d'abonnement + notifications
