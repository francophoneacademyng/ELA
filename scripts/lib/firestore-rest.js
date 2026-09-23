'use strict';
/* ============================================================
   ELA — scripts/lib/firestore-rest.js
   Lecture Firestore en LECTURE SEULE via l'API REST, en réutilisant
   le jeton OAuth du Firebase CLI (rafraîchi). Utilisé pour le DRY RUN
   uniquement. Aucune écriture.
   ============================================================ */

const fs = require('fs');
const os = require('os');
const path = require('path');

const CID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const CS = 'j9iVZfS8kkCEFUPaAeJV0sAi';
const PROJECT = process.env.ELA_PROJECT || 'ela-academy-7f868';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function tokenPath() {
  return process.env.FIREBASE_TOKEN_PATH ||
    path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
}

async function accessToken() {
  const cfg = JSON.parse(fs.readFileSync(tokenPath(), 'utf8'));
  const body = new URLSearchParams({
    client_id: CID, client_secret: CS,
    refresh_token: cfg.tokens.refresh_token, grant_type: 'refresh_token',
  });
  const tok = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
  }).then((r) => r.json());
  if (!tok.access_token) throw new Error('token refresh failed: ' + JSON.stringify(tok).slice(0, 120));
  return tok.access_token;
}

function fromValue(v) {
  if (!v || typeof v !== 'object') return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromValue);
  if ('mapValue' in v) { const o = {}; for (const [k, x] of Object.entries(v.mapValue.fields || {})) o[k] = fromValue(x); return o; }
  return null;
}

function docToObj(doc) {
  const o = { id: doc.name.split('/').pop() };
  for (const [k, v] of Object.entries(doc.fields || {})) o[k] = fromValue(v);
  return o;
}

async function listAll(collection, token) {
  const out = [];
  let pageToken = '';
  do {
    const url = `${BASE}/${collection}?pageSize=300${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`;
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } }).then((x) => x.json());
    (r.documents || []).forEach((d) => out.push(docToObj(d)));
    pageToken = r.nextPageToken || '';
  } while (pageToken);
  return out;
}

module.exports = { accessToken, listAll, PROJECT };
