/* ============================================================
   ELA — backfill-emails.js  (SCRIPT ONE-SHOT, PAS une CF)
   ------------------------------------------------------------
   Backfill de la collection d'unicité emails/{email} pour les
   comptes EXISTANTS (créés avant l'audit inscription) :
     emails/{email.toLowerCase().trim()} = { uid, createdAt }

   - Itère sur Firebase Auth par batchs de 1000 (listUsers).
   - Ignore les utilisateurs sans email / email invalide.
   - Skip les emails déjà présents (doublons) — jamais d'écrasement.
   - Log : créés / déjà présents / invalides / sans email.

   Exécution locale (jamais déployé en CF) :
     # Production (nécessite des credentials Admin : GOOGLE_APPLICATION_CREDENTIALS
     # ou `firebase login` + ADC ; console sécurisée type gcloud auth application-default login)
     node functions/backfill-emails.js

     # Émulateur local (aucun impact prod) :
     $env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"; $env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
     node functions/backfill-emails.js --project ela-academy-7f868

     # Simulation sans écriture :
     node functions/backfill-emails.js --dry-run

   Script idempotent : relançable sans risque.
   ============================================================ */

'use strict';

const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const BATCH_SIZE = 1000;
const LOG_EVERY = 500;

const args = process.argv.slice(2);
const projectId = argValue(args, '--project') || process.env.GCLOUD_PROJECT || 'ela-academy-7f868';
const dryRun = args.includes('--dry-run');

function argValue(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
}

function normalizeEmail(v) {
  return String(v || '').trim().toLowerCase();
}

async function main() {
  admin.initializeApp({ projectId: projectId });
  const db = admin.firestore();
  const fsCol = db.collection('emails');

  console.log('[backfill] project=' + projectId + (dryRun ? ' (DRY-RUN — aucune écriture)' : ''));

  let created = 0;
  let already = 0;
  let invalid = 0;
  let noEmail = 0;
  let total = 0;
  let nextPageToken = undefined;

  do {
    const page = await admin.auth().listUsers(BATCH_SIZE, nextPageToken);
    nextPageToken = page.pageToken;

    for (const user of page.users) {
      total++;
      const raw = user.email;
      if (!raw) { noEmail++; continue; }
      const email = normalizeEmail(raw);
      if (!EMAIL_RE.test(email)) { invalid++; continue; }

      if (dryRun) {
        const snap = await fsCol.doc(email).get();
        if (snap.exists) { already++; } else { created++; }
      } else {
        const ref = fsCol.doc(email);
        const snap = await ref.get();
        if (snap.exists) {
          already++;
        } else {
          await ref.set({
            uid: user.uid,
            email: email,
            createdAt: FieldValue.serverTimestamp()
          });
          created++;
        }
      }

      if (total % LOG_EVERY === 0) {
        console.log('[backfill] ' + total + ' parcourus | créés=' + created + ' déjà présents=' + already);
      }
    }

    console.log('[backfill] batch terminé (' + page.users.length + ' utilisateurs).');
  } while (nextPageToken);

  console.log('---');
  console.log('[backfill] TERMINÉ' + (dryRun ? ' (DRY-RUN)' : ''));
  console.log('[backfill] utilisateurs parcourus : ' + total);
  console.log('[backfill] docs emails créés      : ' + created);
  console.log('[backfill] docs déjà présents     : ' + already);
  console.log('[backfill] emails invalides       : ' + invalid);
  console.log('[backfill] comptes sans email     : ' + noEmail);
  process.exit(0);
}

main().catch(function (err) {
  console.error('[backfill] ERREUR:', err && err.stack ? err.stack : err);
  process.exit(1);
});
