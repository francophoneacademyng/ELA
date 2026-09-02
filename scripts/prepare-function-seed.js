/* ============================================================
   prepare-function-seed.js — Copie data/seed/*.json vers
   functions/seed-a1/ (bundle du déploiement Cloud Functions).
   Le runtime Cloud Functions ne voit que le dossier functions/,
   les copies permettent au callable seedAcademyA1 de lire le contenu.
   Usage : node scripts/prepare-function-seed.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'data', 'seed');
const dstDir = path.join(__dirname, '..', 'functions', 'seed-a1');

fs.mkdirSync(dstDir, { recursive: true });

const files = [
  'germanophone-a1.json',
  'sinophone-a1.json',
  'anglophone-a1.json',
  'arabophone-a1.json',
  'russophone-a1.json'
];

let copied = 0;
files.forEach((f) => {
  const s = path.join(srcDir, f);
  if (!fs.existsSync(s)) {
    console.log(`[skip] ${f} : introuvable dans data/seed`);
    return;
  }
  // Valide la copie.
  const parsed = JSON.parse(fs.readFileSync(s, 'utf8'));
  fs.writeFileSync(path.join(dstDir, f), JSON.stringify(parsed, null, 2), 'utf8');
  copied++;
  console.log(`[ok] ${f} -> functions/seed-a1/`);
});
if (copied === 0) {
  console.log('Aucun fichier copié.');
  process.exit(1);
}