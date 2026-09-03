// ============================================================
// MIGRATE ACADEMY CODE — Passe academyCode de minuscules a majuscules
// Usage : node migrate-academy-code.js
// ============================================================

const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const ACADEMIES = {
  'fr': 'FR',
  'de': 'DE',
  'zh': 'ZH',
  'en': 'EN',
  'ar': 'AR',
  'ru': 'RU'
};

async function migrate() {
  console.log('');
  console.log('========================================');
  console.log('MIGRATION : academyCode minuscules → majuscules');
  console.log('========================================');
  console.log('');

  let updated = 0;
  let errors = 0;

  for (const [oldCode, newCode] of Object.entries(ACADEMIES)) {
    console.log(`Migration ${oldCode} → ${newCode}...`);

    try {
      const snapshot = await db.collection('lessons')
        .where('academyCode', '==', oldCode)
        .get();

      if (snapshot.empty) {
        console.log(`  WARN : Aucune lecon trouvee pour ${oldCode}`);
        continue;
      }

      for (const doc of snapshot.docs) {
        await doc.ref.update({ academyCode: newCode });
        console.log(`  OK    ${doc.id} → academyCode=${newCode}`);
        updated++;
      }
    } catch (err) {
      console.error(`  ERR   ${oldCode} : ${err.message}`);
      errors++;
    }
  }

  console.log('');
  console.log('========================================');
  console.log(`Resultat : ${updated} documents mis a jour`);
  console.log(`Erreurs  : ${errors}`);
  console.log('');
  console.log('>>> Rafraichissez https://ela-academy-7f868.web.app/#/free-trial');
  console.log('========================================');
  process.exit(0);
}

migrate();
