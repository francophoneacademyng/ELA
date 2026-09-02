/* ============================================================
   ELA — shared/config/academies.config.js
   Registre unique des 6 académies immersives.
   Source de vérité front : codes, libellés, niveaux, couleurs,
   filtres de catégorie. Le backend garde le mappage interne
   (german/mandarin/… → DE/ZH/…) dans ela-certificate-core.js.
   ============================================================ */

export const ACADEMY_ORDER = ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'];

/** Filtres de catégorie communs à toutes les académies. */
export const CATEGORY_FILTERS = ['All', 'Grammar', 'Vocabulary', 'Pronunciation', 'Culture', 'Business'];

export const ACADEMIES = {
  FR: {
    code: 'FR', key: 'french',
    label: 'Francophone Academy', native: 'Français', flag: '🇫🇷',
    color: '#1D4ED8', certification: 'CECRL',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    levelNames: {
      A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
      B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery'
    }
  },
  DE: {
    code: 'DE', key: 'german',
    label: 'Germanophone Academy', native: 'Deutsch', flag: '🇩🇪',
    color: '#C9A227', certification: 'Goethe-Zertifikat',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    levelNames: {
      A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
      B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery'
    }
  },
  ZH: {
    code: 'ZH', key: 'mandarin',
    label: 'Sinophone Academy', native: '中文', flag: '🇨🇳',
    color: '#C0372F', certification: 'HSK',
    levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
    levelNames: {
      HSK1: 'Beginner', HSK2: 'Elementary', HSK3: 'Intermediate',
      HSK4: 'Upper Intermediate', HSK5: 'Advanced', HSK6: 'Mastery'
    }
  },
  EN: {
    code: 'EN', key: 'english',
    label: 'Anglophone Pro Academy', native: 'English', flag: '🇬🇧',
    color: '#1E3A5F', certification: 'IELTS',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    levelNames: {
      A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
      B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery'
    }
  },
  AR: {
    code: 'AR', key: 'arabic',
    label: 'Arabophone Academy', native: 'العربية', flag: '🇸🇦',
    color: '#0F766E', certification: 'ALPT',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    levelNames: {
      A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
      B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery'
    }
  },
  RU: {
    code: 'RU', key: 'russian',
    label: 'Russophone Academy', native: 'Русский', flag: '🇷🇺',
    color: '#B22234', certification: 'TORFL',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    levelNames: {
      A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
      B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery'
    }
  }
};

/** Retourne la config d'une académie ou null. */
export function getAcademy(code) {
  const c = String(code || '').toUpperCase();
  return ACADEMIES[c] || null;
}

/** Code valide ? */
export function isValidAcademyCode(code) {
  return !!getAcademy(code);
}

/** Clé interne (german/mandarin/…) → code ELA (DE/ZH/…). */
export const KEY_TO_CODE = {
  french: 'FR', francophone: 'FR', fr: 'FR',
  german: 'DE', de: 'DE',
  mandarin: 'ZH', chinese: 'ZH', zh: 'ZH',
  english: 'EN', en: 'EN',
  arabic: 'AR', ar: 'AR',
  russian: 'RU', ru: 'RU'
};

export function codeFromKey(key) {
  return KEY_TO_CODE[String(key || '').toLowerCase()] || null;
}

/** Quiz de niveau : 20 questions, certificat à 80 %. */
export const QUIZ_QUESTIONS = 20;
export const QUIZ_PASS_SCORE = 80;
