/* ============================================================
   ELA — teacher/repositories/content.repository.js
   Accès données enseignant :
   - ÉCRITURE : callable submitContent (jamais Firestore direct).
   - LECTURE : ses propres soumissions (3 queries where teacherUid,
     autorisées par firestore.rules — inchangées).
   ============================================================ */

import { callFunction } from '../../core/api-client.js';
import { Submission } from '../models/submission.model.js';

/**
 * Soumet un contenu. Le serveur impose l'académie, le statut
 * 'pending' et la validation des champs.
 * @param {'lesson'|'quiz'|'live'} type
 * @param {object} payload payload validé par le model (toPayload())
 */
export function submitContent(type, payload) {
  return callFunction('submitContent', { type: type, payload: payload })
    .then(function (d) { return d || {}; });
}

/** Liste les soumissions de l'enseignant → Submission[] (anti-chrono). */
export function fetchMySubmissions(uid) {
  const db = (typeof window !== 'undefined' && window.firebase && window.firebase.firestore)
    ? window.firebase.firestore() : null;
  if (!db || !uid) return Promise.resolve([]);

  const types = [
    { type: 'lesson', collection: 'lessons' },
    { type: 'quiz', collection: 'quizzes' },
    { type: 'live', collection: 'liveClasses' }
  ];

  return Promise.all(types.map(function (t) {
    return db.collection(t.collection).where('teacherUid', '==', uid).get()
      .then(function (snap) {
        return snap.docs.map(function (doc) { return Submission.fromDoc(t.type, doc); });
      })
      .catch(function () { return []; });
  })).then(function (groups) {
    const all = [];
    groups.forEach(function (g) { all.push.apply(all, g); });
    return all.sort(Submission.compareByDate);
  });
}
