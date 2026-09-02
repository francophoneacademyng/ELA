/* ============================================================
   ELA — src/js/core/api-client.js  (BRIDGE / PONT)
   Pont d'import ES : les modules sous src/ importent callFunction
   depuis ce chemin (src/js/core/api-client.js). Le fichier source
   réel est à la racine (js/core/api-client.js) et expose à la fois
   l'export ES et window.ELA_API (compat legacy app.js).
   ============================================================ */

export { callFunction } from '../../../js/core/api-client.js';
