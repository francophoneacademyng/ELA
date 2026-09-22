/* ============================================================
   ELA — functions/institution.js
   ------------------------------------------------------------
   Référentiel institutionnel partagé (PUR, sans accès base).
   Source de vérité pour :
     - les six académies et leur référentiel de niveaux déclaré
     - les rôles institutionnels
     - les compétences d'examen (4 aptitudes)
   Aucune affirmation d'agrément : les référentiels externes sont
   décrits comme « aligné sur » (aligned with), jamais comme une
   accréditation ou une qualité de centre d'examen officiel.
   ============================================================ */

const INSTITUTION = 'E-Learn Language Academy';
const INSTITUTION_SHORT = 'ELA';

/* Cadre de niveaux par académie. `framework` = référentiel EXTERNE auquel
   le programme est ALIGNÉ (aucune autorisation officielle n'est impliquée). */
const ACADEMIES = {
  FR: { code: 'FR', label: 'Francophone Academy', language: 'French', framework: 'CEFR', frameworkLabel: 'CEFR (aligned with)', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  DE: { code: 'DE', label: 'German Academy', language: 'German', framework: 'Goethe-aligned', frameworkLabel: 'Goethe-Institut levels (aligned with)', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  ZH: { code: 'ZH', label: 'Mandarin Academy', language: 'Mandarin Chinese', framework: 'HSK', frameworkLabel: 'HSK (aligned with)', levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'] },
  EN: { code: 'EN', label: 'English Academy', language: 'English', framework: 'IELTS-aligned', frameworkLabel: 'IELTS bands (aligned with)', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  AR: { code: 'AR', label: 'Arabic Academy', language: 'Arabic', framework: 'ALPT', frameworkLabel: 'ALPT (aligned with)', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  RU: { code: 'RU', label: 'Russian Academy', language: 'Russian', framework: 'TORFL', frameworkLabel: 'TORFL (aligned with)', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] }
};

const ACADEMY_CODES = Object.keys(ACADEMIES);

/* Rôles institutionnels. `system` est réservé aux Cloud Functions. */
const ROLES = ['student', 'teacher', 'examiner', 'admin', 'system'];

/* Compétences de l'examen final de certification. */
const EXAM_SKILLS = ['listening', 'reading', 'writing', 'speaking'];

/* Types de contenu pédagogique (hiérarchie académique). */
const NODE_TYPES = ['course', 'module', 'unit', 'lesson', 'activity', 'assessment'];

/* Niveaux de contenu : distinction READY / DRAFT / REVIEW_REQUIRED / MISSING. */
const CONTENT_STATES = ['READY', 'DRAFT', 'REVIEW_REQUIRED', 'MISSING'];

function academy(code) {
  return ACADEMIES[String(code || '').toUpperCase()] || null;
}

function isValidAcademy(code) {
  return !!academy(code);
}

function validLevels(code) {
  const a = academy(code);
  return a ? a.levels : [];
}

function isValidLevel(code, level) {
  return validLevels(code).indexOf(String(level || '').toUpperCase()) >= 0;
}

/* Alignement vers le niveau CEFR utilisé par le moteur de certificat.
   Le certificat ELA est exprimé en CEFR ; les référentiels externes
   (HSK, Goethe, IELTS, ALPT, TORFL) sont ALIGNÉS, pas remplacés.
   Table d'alignement documentée, sans prétention d'équivalence officielle. */
const LEVEL_ALIGNMENT = {
  ZH: { HSK1: 'A1', HSK2: 'A2', HSK3: 'B1', HSK4: 'B2', HSK5: 'C1', HSK6: 'C2' }
};

function levelToCefr(code, level) {
  const lv = String(level || '').toUpperCase();
  const map = LEVEL_ALIGNMENT[String(code || '').toUpperCase()];
  if (map && map[lv]) return map[lv];
  return lv;
}

module.exports = {
  INSTITUTION,
  INSTITUTION_SHORT,
  ACADEMIES,
  ACADEMY_CODES,
  ROLES,
  EXAM_SKILLS,
  NODE_TYPES,
  CONTENT_STATES,
  academy,
  isValidAcademy,
  validLevels,
  isValidLevel,
  LEVEL_ALIGNMENT,
  levelToCefr
};
