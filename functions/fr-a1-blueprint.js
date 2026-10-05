/* ============================================================
   ELA — functions/fr-a1-blueprint.js   (PUR, sans accès base)
   ------------------------------------------------------------
   Consolidation du curriculum Français A1.
   Fait converger les DEUX sources existantes du code sans rien
   inventer ni supprimer :

   1. SOURCE ACTIVE (canonical content) :
        curriculum-content.js buildLevelContent('FR','A1')
        → vocabulaire RÉEL (mots + traductions), exemples réels,
          dialogues réels, grammaire nivelée, corps de leçon complet,
          IDs `prog_FR_A1-M{mm}-U{uu}-L{ll}`.
   2. BLUEPRINT HUMAIN (pédagogie spécifique) :
        academic-framework.js buildFrenchA1Curriculum()
        → titres/objectifs/activités spécifiques par leçon.

   PRINCIPE DE SÉCURITÉ :
   - Les IDs actifs (`prog_FR_A1-…`) sont PRÉSERVÉS (aucune
     conversion `FR-A1-…` ↔ `prog_FR_A1-…`).
   - Le contenu réel (vocabulaire, exemples, dialogues, grammaire,
     explication, pratique, évaluation) est PRÉSERVÉ.
   - Seuls les éléments « plus forts » du blueprint (titres de
     module, objectifs et activités de leçon) sont fusionnés, ET
     UNIQUEMENT là où la thématique CORRESPOND au contenu réel.
   - Le résultat reste `DRAFT` (jamais READY/published).
   ============================================================ */

'use strict';

const { buildFrenchA1Curriculum } = require('./academic-framework.js');

/* Mise en correspondance des MODULES par thème :
   index module générateur → index module blueprint.
   générateur (curriculum-content.js)          blueprint (FR_A1_MODULES)
     0 Salutations et présentations           → 0 Se présenter et saluer
     1 Identité personnelle                   → 1 Identité personnelle
     2 Vie quotidienne                        → 2 Vie quotidienne
     3 Environnement immédiat                 → 4 Environnement immédiat
     4 Travail et loisirs                     → 3 Loisirs et goûts
     5 Culture et intégration                 → 5 Intégration et évaluation
*/
const MODULE_MAP = [0, 1, 2, 4, 3, 5];

/* Modules dont le titre/description blueprint correspond au contenu
   réel (les modules 4 et 5 ont un écart thématique : « travail » vs
   « loisirs », et « culture » vs « intégration/évaluation » — ils ne
   sont donc PAS renommés pour rester exacts). */
const ENRICH_MODULE_META = [0, 1, 2, 3];

/* Leçons dont le titre/objectif/activités blueprint CORRESPONDENT au
   vocabulaire réel du module générateur (correspondance vérifiée).
   Format : [moduleIndex, unitIndex, lessonIndex]. Les autres leçons
   conservent le titre/objectif générateur (plus exact pour leur contenu). */
const CURATED_LESSONS = [
  [0, 0, 0], [0, 0, 1],                             // Bonjour et au revoir
  [1, 0, 0],                                        // Dire son âge
  [1, 1, 0], [1, 1, 1],                             // Famille et amis
  [2, 0, 0], [2, 0, 1],                             // L'heure et l'emploi du temps
  [2, 1, 0], [2, 1, 1],                             // Nourriture et boissons
  [3, 0, 0], [3, 0, 1],                             // Logement
  [4, 0, 0], [4, 0, 1]                              // Activités et sports
];

function lessonKey(mi, ui, li) { return mi + ':' + ui + ':' + li; }

/**
 * Fusionne les éléments pédagogiques plus forts du blueprint humain
 * dans le curriculum FR-A1 actif, SANS modifier les IDs ni le contenu
 * réel. PURE : ne mute pas l'entrée, renvoie une copie enrichie.
 */
function enrichFrA1Curriculum(content) {
  if (!content || content.academyCode !== 'FR' || content.level !== 'A1') return content;

  const bp = buildFrenchA1Curriculum();
  const curated = {};
  for (const t of CURATED_LESSONS) curated[lessonKey(t[0], t[1], t[2])] = true;

  const modules = (content.modules || []).map((m, mi) => {
    const bm = (bp.modules && bp.modules[MODULE_MAP[mi]]) || null;
    const nextModule = Object.assign({}, m);

    if (bm && ENRICH_MODULE_META.indexOf(mi) >= 0) {
      nextModule.title = bm.title;
      nextModule.description = bm.description;
    }

    nextModule.units = (m.units || []).map((u, ui) => {
      const bu = (bm && bm.units) ? (bm.units[ui] || null) : null;
      const nextUnit = Object.assign({}, u);

      if (bu && ENRICH_MODULE_META.indexOf(mi) >= 0) {
        nextUnit.title = bu.title;
      }

      nextUnit.lessons = (u.lessons || []).map((l, li) => {
        const bl = (bu && bu.lessons) ? (bu.lessons[li] || null) : null;
        if (bl && curated[lessonKey(mi, ui, li)]) {
          return Object.assign({}, l, {
            title: bl.title,
            objective: bl.objective,
            activities: Array.isArray(bl.activities) ? bl.activities.slice() : l.activities
          });
        }
        return l;
      });

      return nextUnit;
    });

    return nextModule;
  });

  return Object.assign({}, content, {
    modules: modules,
    note: 'Consolidated French A1: human-authored blueprint structure merged with ELA-authored vocabulary, examples, dialogues and lesson scaffolding where thematically corresponding. Per-unit vocabulary for non-corresponding sub-themes (numbers, nationalities, months, weather, directions, etc.) remains pending authoring. Pending academic review.'
  });
}

module.exports = {
  MODULE_MAP,
  ENRICH_MODULE_META,
  CURATED_LESSONS,
  enrichFrA1Curriculum
};
