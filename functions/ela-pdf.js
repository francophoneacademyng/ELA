/* ============================================================
   ELA — functions/ela-pdf.js
   ------------------------------------------------------------
   Template UNIQUE du PDF officiel ELA (toutes académies).
   Utilisé par generateELACertificatePdf (callable) et par le
   trigger generateCertificate. pdfkit + QR code.

   Design institutionnel (v6 — fidélité au MASTER) :
   - Le décor statique est issu de ELA_CERTIFICATE_REFERENCE.png
     (nettoyé de toute donnée dynamique) : cadre, liserés or,
     ornements d'angle, emblèmes ELA, carte du monde, monuments,
     titre, séparateurs, signatures, devise — réutilisés TELS QUELS.
   - Seuls les champs DYNAMIQUES sont surimprimés par PDFKit :
     nom, programme, niveau, dates, n°, résultat, QR, URL, hash.

   Polices Unicode embarquées (OFL). Aucun secret : JAMAIS
   ELA_CERT_SIGNING_KEY ni signature HMAC. QR = verificationUrl.
   ============================================================ */

const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const W = 841.89;
const H = 595.28;

/* Référence : 1448×1086 → A4 paysage (ajusté en hauteur, sans distorsion). */
const REF_W = 1448;
const REF_H = 1086;
const SCALE = H / REF_H;               // ≈ 0.5481
const IMG_W = REF_W * SCALE;           // ≈ 793.6
const OX = (W - IMG_W) / 2;            // ≈ 24.1  (barres vertes latérales)

const STATIC_BG = path.join(__dirname, 'ela-certificate-static.png');
let _bg = null;
function bgBuffer() {
  if (!_bg) _bg = fs.readFileSync(STATIC_BG);
  return _bg;
}

const rx = (x) => OX + x * SCALE;
const ry = (y) => y * SCALE;
const rs = (s) => s * SCALE;

/* Couleurs dynamiques mesurées sur la référence. */
const COLORS = {
  forest: '#043732',
  gold: '#D79D39',
  goldName: '#A87B1E',
  goldLight: '#E8D9A8',
  bronze: '#835712',
  infoGreen: '#06352F',
  muted: '#6B746E',
  hashGreen: '#5F7D70'
};

/* ---------- Polices embarquées (OFL) ---------- */
const FONT_DIR = path.join(__dirname, 'fonts');
const FONTS = {
  serif:      { file: 'PlayfairDisplay-Regular.ttf', name: 'ELA-Serif' },
  serifBold:  { file: 'PlayfairDisplay-Bold.ttf',    name: 'ELA-SerifBold' },
  arabic:     { file: 'Amiri-Regular.ttf',           name: 'ELA-Arabic' },
  arabicBold: { file: 'Amiri-Bold.ttf',              name: 'ELA-ArabicBold' },
  cjk:        { file: 'NotoSerifSC-Regular.ttf',     name: 'ELA-CJK' },
  cjkBold:    { file: 'NotoSerifSC-Bold.ttf',        name: 'ELA-CJKBold' }
};
const FONT_BY_NAME = {};
for (const k in FONTS) FONT_BY_NAME[FONTS[k].name] = FONTS[k];

function scriptOf(text) {
  const s = String(text || '');
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(s)) return 'arabic';
  if (/[\u3000-\u303F\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(s)) return 'cjk';
  return 'latin';
}
function fontFor(text, bold) {
  const sc = scriptOf(text);
  if (sc === 'arabic') return bold ? FONTS.arabicBold.name : FONTS.arabic.name;
  if (sc === 'cjk') return bold ? FONTS.cjkBold.name : FONTS.cjk.name;
  return bold ? FONTS.serifBold.name : FONTS.serif.name;
}
function useFont(doc, name) {
  if (!doc._elaFonts) doc._elaFonts = {};
  if (!doc._elaFonts[name]) {
    doc.registerFont(name, path.join(FONT_DIR, FONT_BY_NAME[name].file));
    doc._elaFonts[name] = true;
  }
  return doc.font(name);
}

function capOffset(doc, size) {
  return ((doc._font.capHeight || 700) / 1000) * size;
}

/* Positionnement : `y` est le haut des capitales (aligné sur le master).
   PDFKit positionne par défaut sur l'ascendante — on ramène via baseline
   alphabétique décalée de la hauteur de capitales. */
function drawText(doc, text, x, y, opts) {
  opts = opts || {};
  const size = opts.size || 10;
  useFont(doc, fontFor(text, !!opts.bold));
  doc.fontSize(size);
  doc.fillColor(opts.color || COLORS.infoGreen);
  const o = { width: opts.width, align: opts.align, baseline: 'alphabetic' };
  if (opts.spacing) o.characterSpacing = opts.spacing;
  doc.text(String(text), x, y + capOffset(doc, size), o);
}
function centeredAt(doc, text, cx, y, opts) {
  drawText(doc, text, cx - (opts.width || 0) / 2, y, Object.assign({}, opts, { align: 'center', width: opts.width || 0 }));
}

/* Nom : centré, réduction automatique (vert institutionnel — fidèle au master). */
function drawName(doc, name, y) {
  useFont(doc, fontFor(name, true));
  let size = rs(56);
  doc.fontSize(size);
  const maxWidth = rs(560);
  while (size > rs(20) && doc.widthOfString(name) > maxWidth) {
    size -= 0.5; doc.fontSize(size);
  }
  doc.fillColor(COLORS.forest);
  doc.text(name, 0, y + capOffset(doc, size), { align: 'center', width: W, baseline: 'alphabetic' });
}

/* Terminologie programme / niveau. */
const LANGUAGE_NAMES = {
  fr: 'French', en: 'English', de: 'German', zh: 'Mandarin', ar: 'Arabic', ru: 'Russian',
  french: 'French', english: 'English', german: 'German', chinese: 'Mandarin',
  mandarin: 'Mandarin', 'mandarin chinese': 'Mandarin', arabic: 'Arabic', russian: 'Russian'
};
function languageName(lang) {
  if (!lang) return '';
  const key = String(lang).trim().toLowerCase();
  return LANGUAGE_NAMES[key] || String(lang).trim();
}
function programmeTitle(cert) {
  const lang = languageName(cert.language || cert.academyCode);
  const lvl = String(cert.cecrLevel || '').toUpperCase();
  return (lang ? lang + ' ' : '') + lvl + ' Programme';
}

const SIGNED_BY_DEFAULT = 'ELA Certification Authority';
const VERIFY_LABEL = 'Verify this certificate at ';

const TITLES = {
  completion: 'CERTIFICATE OF COMPLETION',
  achievement: 'CERTIFICATE OF ACHIEVEMENT',
  certification: 'CERTIFICATE OF PROFICIENCY'
};

/* Bloc signature (ligne + rôle + institution). */
function drawSignatureBlock(doc, cx, lineY, roleY, instY, role, institution) {
  doc.strokeColor(COLORS.forest).lineWidth(0.9);
  doc.moveTo(cx - 90, lineY).lineTo(cx + 90, lineY).stroke();
  drawText(doc, role, cx - 130, roleY, { bold: true, size: rs(18), color: COLORS.forest, align: 'center', width: rs(260) });
  drawText(doc, institution, cx - 130, instY, { size: rs(13), color: COLORS.muted, align: 'center', width: rs(260) });
}

async function makeOfficialPdfBuffer(cert) {
  const PDFDocument = require('pdfkit');
  const qrDataUrl = await QRCode.toDataURL(cert.verificationUrl, { margin: 1, width: 220 });
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    drawOfficialPdf(doc, cert, qrDataUrl);
    doc.end();
  });
}

function drawOfficialPdf(doc, cert, qrDataUrl) {
  const name = String(cert.studentName || 'Student');
  const academy = String(cert.academyLabel || '');
  const programme = programmeTitle(cert);
  const signedBy = String(cert.signedBy || SIGNED_BY_DEFAULT);
  const title = TITLES[cert.certificateType] || TITLES.completion;

  /* Cadre vert + décor statique (référence nettoyée). */
  doc.rect(0, 0, W, H).fill(COLORS.forest);
  try {
    doc.image(bgBuffer(), OX, 0, { width: IMG_W, height: H });
  } catch (e) {
    console.error('[ELA-Cert] static background missing:', e.message);
  }

  /* Titre (dynamique, or — position master). */
  drawText(doc, title, 0, ry(322), { bold: true, size: rs(50), color: COLORS.gold, align: 'center', width: W, spacing: 3 });

  /* Nom (vert institutionnel). */
  drawName(doc, name, ry(446));

  /* Académie • programme (une ligne, vert) + niveau (or). */
  drawText(doc, academy + '  •  ' + programme, 0, ry(561), { bold: true, size: rs(34), color: COLORS.forest, align: 'center', width: W });
  drawText(doc, 'Level ' + String(cert.cecrLevel || '').toUpperCase() + '  •  CEFR', 0, ry(612), { bold: true, size: rs(24), color: COLORS.gold, align: 'center', width: W });

  /* Rangée d'informations (4 colonnes, positions master). */
  const info = [
    { label: 'ISSUE DATE', value: String(cert.issueDate || ''), cx: 312, w: rs(130) },
    { label: 'VALID UNTIL', value: String(cert.expiryDate || ''), cx: 560, w: rs(130) },
    { label: 'CERTIFICATE NO.', value: String(cert.id), cx: 845, w: rs(220) },
    { label: 'OVERALL RESULT', value: (Number(cert.scoreGlobal) > 0) ? String(cert.scoreGlobal) + '%' : '—', cx: 1114, w: rs(160) }
  ];
  for (let i = 0; i < info.length; i++) {
    const x = rx(info[i].cx) - info[i].w / 2;
    drawText(doc, info[i].label, x, ry(742), { bold: true, size: rs(18), color: COLORS.gold, align: 'center', width: info[i].w });
    drawText(doc, info[i].value, x, ry(770), { bold: false, size: rs(22), color: COLORS.forest, align: 'center', width: info[i].w });
  }

  /* Signatures (dynamiques) : gauche + droite. */
  drawSignatureBlock(doc, rx(295), ry(905), ry(905), ry(925), 'Programme Director', 'E-Learn Language Academy (ELA)');
  drawSignatureBlock(doc, rx(1068), ry(905), ry(905), ry(925), signedBy, 'E-Learn Language Academy (ELA)');

  /* QR (dynamique, bas droite — une seule fois). */
  try {
    const qrBuf = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    doc.image(qrBuf, rx(1225), ry(810), { width: rs(106), height: rs(106) });
  } catch (qrErr) {
    console.error('[ELA-Cert] QR embed failed:', qrErr.message);
  }

  /* Pied (base-14, extractible) : URL + intégrité. */
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted);
  doc.text(VERIFY_LABEL + String(cert.verificationUrl || ''), rx(130), ry(968), { width: rs(1040) });
  doc.font('Courier').fontSize(6).fillColor(COLORS.hashGreen);
  doc.text('Digital verification: ' + String(cert.signatureAlgorithm || 'SHA-256') + ' integrity hash — ' + String(cert.signatureHash || ''), rx(130), ry(987), { width: rs(1040) });
}

module.exports = { makeOfficialPdfBuffer, drawOfficialPdf };
