/* ============================================================
   ELA — core/ai.service.js
   ------------------------------------------------------------
   Facade AIService : tout le code métier consommant l'IA passe
   par ce module (aucun appel direct à la Cloud Function ailleurs).
   En coulisse : callable 'learningAssistant' (OpenRouter côté
   serveur, clé jamais exposée au client).
   ============================================================ */

import { callFunction, normalizeError } from './api-client.js';

const MAX_HISTORY = 20;
const MAX_LEN = 2000;

/** Historique { role, content }[] → version assainie (mêmes garde-fous que le serveur). */
export function sanitizeHistory(history) {
  const out = [];
  if (!Array.isArray(history)) return out;
  for (const m of history) {
    if (out.length >= MAX_HISTORY) break;
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
    const content = String(m.content || '').slice(0, MAX_LEN);
    if (!content) continue;
    out.push({ role: m.role, content: content });
  }
  return out;
}

/**
 * Pose une question au tuteur (Learning Assistant).
 * Résout { reply, degraded } — rejette { code, messageKey }.
 */
export function askTutor(message, history) {
  const msg = String(message || '').trim().slice(0, MAX_LEN);
  if (!msg) return Promise.reject({ code: 'empty-message', messageKey: null });
  return callFunction('learningAssistant', {
    message: msg,
    history: sanitizeHistory(history || [])
  }).then(function (d) {
    d = d || {};
    return { reply: d.reply || '', degraded: !!d.degraded };
  }).catch(function (e) {
    throw normalizeError(e);
  });
}

if (typeof window !== 'undefined') {
  window.ELA_AI = { askTutor: askTutor, sanitizeHistory: sanitizeHistory };
}
