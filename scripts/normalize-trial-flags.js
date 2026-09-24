'use strict';
/* ============================================================
   ELA — scripts/normalize-trial-flags.js
   ------------------------------------------------------------
   Normalise les drapeaux d'essai (isTrial / trialAccess) pour
   que l'essai gratuit ne pointe QUE vers des leçons réelles :
     - 2 leçons instantanées + 4 sur inscription par académie
       (premières leçons du cours d'entrée A1).
     - toute autre leçon (y compris les legacy scheme-A sans
       courseId et les FR A2–B2) → isTrial = false.
   Upsert idempotent, AUCUNE suppression. Sauvegarde `lessons`.
   Usage: node scripts/normalize-trial-flags.js --confirm
   ============================================================ */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const admin = require(path.join(ROOT, 'functions', 'node_modules', 'firebase-admin'));
const rest = require('./lib/firestore-rest.js');

const args = process.argv.slice(2);
if (!args.includes('--confirm')) { console.log('ABORT: --confirm required.'); process.exit(2); }
const SA_PATH = process.env.ELA_SA || path.join(ROOT, 'service-account.json.json');
if (!fs.existsSync(SA_PATH)) { console.log('ABORT: service account not found.'); process.exit(2); }

const ENTRY = {
  FR: { courseId: 'french-foundations-a1', instant: 2, signup: 4 },
  DE: { courseId: 'german-german-a1-foundations', instant: 2, signup: 4 },
  ZH: { courseId: 'mandarin-mandarin-hsk-1-foundations', instant: 2, signup: 4 },
  EN: { courseId: 'english-english-essential-foundations', instant: 2, signup: 4 },
  AR: { courseId: 'arabic-arabic-a1-foundations', instant: 2, signup: 4 },
  RU: { courseId: 'russian-russian-a1-foundations', instant: 2, signup: 4 }
};

async function main() {
  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  const db = admin.firestore();

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'data', 'backup', stamp + '-trial-flags');
  fs.mkdirSync(backupDir, { recursive: true });
  const token = await rest.accessToken();
  const lessons = await rest.listAll('lessons', token);
  fs.writeFileSync(path.join(backupDir, 'lessons.json'), JSON.stringify(lessons, null, 2));
  console.log('BACKUP:', backupDir, '(lessons=' + lessons.length + ')');

  const now = admin.firestore.FieldValue.serverTimestamp();
  const trialSet = {};
  for (const ac of Object.keys(ENTRY)) {
    const e = ENTRY[ac];
    for (let i = 1; i <= e.instant + e.signup; i++) {
      trialSet[e.courseId + '-l' + i] = { isTrial: true, trialAccess: i <= e.instant ? 'instant' : 'signup' };
    }
  }

  const updates = [];
  for (const l of lessons) {
    const t = trialSet[l.id];
    const wantTrial = !!t;
    const wantAccess = t ? t.trialAccess : null;
    if (l.isTrial !== wantTrial || (l.trialAccess || null) !== wantAccess) {
      updates.push({ id: l.id, isTrial: wantTrial, trialAccess: wantAccess });
    }
  }

  const CHUNK = 450;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const batch = db.batch();
    for (const u of updates.slice(i, i + CHUNK)) {
      const patch = { isTrial: u.isTrial, seedUpdatedAt: now };
      if (u.isTrial) patch.trialAccess = u.trialAccess;
      else patch.trialAccess = admin.firestore.FieldValue.delete();
      batch.update(db.collection('lessons').doc(u.id), patch);
    }
    await batch.commit();
  }

  const audit = { timestamp: new Date().toISOString(), updates: updates.length, trialNow: Object.keys(trialSet).length };
  fs.writeFileSync(path.join(__dirname, 'data', 'trial-flags-audit-' + stamp + '.json'), JSON.stringify(audit, null, 2));
  console.log('UPDATED LESSONS:', updates.length);
  console.log('TRIAL LESSONS NOW:', Object.keys(trialSet).length);
}

main().then(() => { console.log('DONE.'); process.exit(0); }).catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
