/* ============================================================
   ELA — Firebase configuration (PUBLIC config, safe to expose)
   ------------------------------------------------------------
   ⚠️ À REMPLIR SUR TON PC après création du projet Firebase :
   Firebase Console → Project settings → Your apps → Web app
   Copie les valeurs ci-dessous. Ce ne sont PAS des secrets :
   ce sont des identifiants publics (comme pour Francophone Academy).
   Tant que ce fichier n'est pas rempli, le site fonctionne en
   "mode présentation" (inscription/connexion désactivées).
   ============================================================ */

window.ELA_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBk59XxsLAQzMvhz7LCmQ2g7dOXxdql-2s",
  authDomain: "ela-academy-7f868.firebaseapp.com",
  projectId: "ela-academy-7f868",
  storageBucket: "ela-academy-7f868.firebasestorage.app",
  messagingSenderId: "590719563330",
  appId: "1:590719563330:web:e04dcb24f7c5ea45411fdb"
};

window.ELA_FIREBASE_READY =
  window.ELA_FIREBASE_CONFIG.apiKey !== "A_REMPLIR_SUR_TON_PC";
