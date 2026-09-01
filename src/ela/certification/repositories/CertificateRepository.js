/* ============================================================
   ELA — src/ela/certification/repositories/CertificateRepository.js
   ------------------------------------------------------------
   Accès Firestore à la collection centralisée "ela_certificates".
   LECTURE côté client (rules : titulaire OU admin/teacher).
   ÉCRITURE : JAMAIS directe — uniquement via Cloud Functions
   (voir CertificateService). Append-only events : "ela_certificate_events".
   ============================================================ */

export const CERTIFICATES_COLLECTION = 'ela_certificates';
export const EVENTS_COLLECTION = 'ela_certificate_events';

function fs() {
  var fb = typeof window !== 'undefined' ? window.firebase : null;
  if (!fb || !fb.firestore) throw new Error('firestore-not-ready');
  return fb.firestore();
}

export const CertificateRepository = {

  /** Lecture d'un certificat par son identifiant métier (= doc id). */
  getById: function (id) {
    return fs().collection(CERTIFICATES_COLLECTION).doc(String(id)).get()
      .then(function (snap) { return snap.exists ? snap.data() : null; });
  },

  /** Tous les certificats ELA d'un élève (privé — titulaire ou admin). */
  getByStudent: function (studentId) {
    return fs().collection(CERTIFICATES_COLLECTION)
      .where('studentId', '==', String(studentId))
      .orderBy('createdAt', 'desc')
      .get()
      .then(function (snap) {
        return snap.docs.map(function (d) {
          var data = d.data(); data.id = d.id; return data;
        });
      });
  },

  /** Certificats d'une académie (admin/teacher uniquement selon rules). */
  getByAcademy: function (academyCode) {
    return fs().collection(CERTIFICATES_COLLECTION)
      .where('academyCode', '==', String(academyCode).toUpperCase())
      .orderBy('createdAt', 'desc')
      .get()
      .then(function (snap) {
        return snap.docs.map(function (d) {
          var data = d.data(); data.id = d.id; return data;
        });
      });
  },

  /**
   * Liste paginée (admin). Page = batch de `pageSize` docs après `startAfterId`.
   * Note : le listage large est réservé admin/teacher par firestore.rules ;
   * côté client, un élève ne voit que ses propres documents (rules).
   */
  listAll: function (pageSize, startAfterId) {
    pageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
    var q = fs().collection(CERTIFICATES_COLLECTION).orderBy('createdAt', 'desc').limit(pageSize);
    if (startAfterId) {
      return fs().collection(CERTIFICATES_COLLECTION).doc(String(startAfterId)).get().then(function (snap) {
        return snap.exists
          ? q.startAfter(snap).get().then(function (s) { return mapSnap(s, pageSize); })
          : Promise.resolve([]);
      });
    }
    return q.get().then(function (s) { return mapSnap(s, pageSize); });
  },

  /**
   * Révocation : interdite en direct (rules : write = Cloud Function
   * uniquement). Passe par CertificateService.revokeCertificate().
   */
  revoke: function () {
    return Promise.reject(new Error('client-cannot-write-certificates'));
  },

  /** Sauvegarde : idem — l'écriture passe par le serveur. */
  save: function () {
    return Promise.reject(new Error('client-cannot-write-certificates'));
  },

  /** Journal d'audit (super admin ELA uniquement — cf. rules). */
  getEvents: function (certificateId) {
    return fs().collection(EVENTS_COLLECTION)
      .where('certificateId', '==', String(certificateId))
      .orderBy('performedAt', 'desc')
      .get()
      .then(function (snap) {
        return snap.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; });
      });
  }
};

function mapSnap(snap, pageSize) {
  var docs = snap.docs.map(function (d) { var data = d.data(); data.id = d.id; return data; });
  return docs.length === pageSize && docs.length ? docs : docs; // cursor = dernier id
}