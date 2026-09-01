/* Script one-shot : rend la DB lazy dans ela-certificate-core.js */
const fs = require('fs');
const p = 'functions/ela-certificate-core.js';
let c = fs.readFileSync(p, 'utf8');
const oldLine = "const db = require('firebase-admin').firestore();";
const newBlock = [
  "const admin = require('firebase-admin');",
  "// DB lazy : permet le test unitaire des fonctions pures sans Firebase.",
  'let _db = null;',
  'function getDb() {',
  '  if (!_db) {',
  '    if (!admin.apps.length) admin.initializeApp();',
  '    _db = admin.firestore();',
  '  }',
  '  return _db;',
  '}'
].join('\n');
if (c.indexOf(oldLine) >= 0) {
  c = c.replace(oldLine, newBlock);
}
c = c.split('db.collection(').join('getDb().collection(');
fs.writeFileSync(p, c);
console.log('core lazy OK');
