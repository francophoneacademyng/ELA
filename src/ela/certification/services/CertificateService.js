/* ============================================================
   ELA — src/ela/certification/services/CertificateService.js
   ------------------------------------------------------------
   Service façade des certificats centralisés ELA (côté client).
   Tout passe par les Cloud Functions (issue / verify / revoke /
   pdf) ou le repository en lecture — jamais d'écriture Firestore
   directe. Aucun secret, aucune donnée sensible exposée ici.
   ============================================================ */

import { CertificateRepository, CERTIFICATES_COLLECTION } from '../repositories/CertificateRepository.js';
import { ownerView, publicView } from '../models/ELACertificate.js';

function callFunction(name, data) {
  var api = typeof window !== 'undefined' ? window.ELA_API : null;
  if (!api || !api.callFunction) return Promise.reject(new Error('api-client-not-ready'));
  return api.callFunction(name, data || {});
}

/** URL publique de vérification (HTTPS onRequest, sans auth). */
export function verifyEndpoint() {
  return '/verifyELACertificate'; // rewrite hosting → fonction africa-south1
}

export const CertificateService = {

  /**
   * Émission d'un certificat (réservée aux callables côté serveur ;
   * le rôle academy_admin/system est vérifié par la fonction).
   * @param {{academyCode, studentId, studentName, cecrLevel, skills?, score?, certificateType?}} input
   */
  issueCertificate: function (input) {
    return callFunction('issueELACertificate', input).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || 'issue-failed');
      return res.certificate; // vue publique-safe renvoyée par le serveur
    });
  },

  /**
   * Vérification publique via l'endpoint HTTPS (jamais de read
   * Firestore direct). Résout la vue publique uniquement.
   */
  verifyCertificate: function (id) {
    var clean = String(id || '').trim().toUpperCase();
    if (!/^ELA-[A-Z]{2}-[A-C][1-2]-[A-Z0-9]{4,8}$/.test(clean)) {
      return Promise.resolve({ valid: false, error: 'invalid-format' });
    }
    return fetch(verifyEndpoint() + '?id=' + encodeURIComponent(clean))
      .then(function (r) { return r.json(); })
      .then(function (data) { return data && data.found ? publicView(data) : { valid: false, found: false }; });
  },

  /** Certificats de l'élève connecté (privé). */
  getStudentCertificates: function (studentId) {
    return CertificateRepository.getByStudent(studentId).then(function (list) {
      return list.map(ownerView);
    });
  },

  /** Liste paginée admin (filtres optionnels passés au callable). */
  listCertificates: function (opts) {
    return callFunction('listELACertificates', opts || {});
  },

  /**
   * Révocation (super admin ELA uniquement, vérifié côté serveur).
   * @param {string} id identifiant ELA-XXX
   * @param {string} reason motif obligatoire
   */
  revokeCertificate: function (id, reason) {
    return callFunction('revokeELACertificate', { id: id, reason: reason }).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || 'revoke-failed');
      return true;
    });
  },

  /** URL signée temporaire du PDF officiel (Storage). */
  getCertificatePdfUrl: function (id) {
    return callFunction('getELACertificatePdfUrl', { id: id }).then(function (res) {
      if (!res || !res.ok || !res.url) throw new Error('pdf-not-available');
      return res.url;
    });
  },

  /** Génération (ou régénération) du PDF officiel ELA. */
  generatePdf: function (id) {
    return callFunction('generateELACertificatePdf', { id: id }).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || 'pdf-generation-failed');
      return res; // { ok, url }
    });
  }
};

export { CERTIFICATES_COLLECTION };