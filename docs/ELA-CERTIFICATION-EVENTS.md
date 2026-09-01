# ELA — Audit trail des certificats (`ela_certificate_events`)

Collection **append-only** : aucun document n'est jamais modifié ni supprimé
(règles Firestore : `create, update, delete: if false` côté client ; écriture
uniquement via Cloud Functions / Admin SDK). Lecture réservée au super admin ELA.

## Structure du document

```json
{
  "certificateId": "ELA-FR-B1-8X92KD",
  "action": "ISSUED",
  "performedBy": "trigger:quiz",
  "performedAt": "2026-09-01T10:12:33.481Z",
  "reason": null,
  "academyCode": "FR",
  "metadata": {
    "certificateType": "achievement",
    "cecrLevel": "B1",
    "sourceQuizId": "q_123"
  }
}
```

## Actions

| action     | déclencheur                                        |
|------------|----------------------------------------------------|
| `ISSUED`   | `core.issueCertificate()` (trigger quiz ou callable) |
| `REVOKED`  | `revokeELACertificate` (super admin, motif obligatoire) |
| `REISSUED` | régénération future (réservé)                      |
| `MIGRATED` | `migrateLegacyCertificates` (migration one-shot)   |

## Implémentation

- Écriture : `functions/ela-certificate-core.js → appendEvent(evt)`
- Non bloquant : un échec d'audit est loggé mais ne casse jamais l'émission.
- Exemple d'événement de révocation :

```json
{
  "certificateId": "ELA-FR-B1-8X92KD",
  "action": "REVOKED",
  "performedBy": "admin-uid",
  "performedAt": "2026-09-01T12:00:00.000Z",
  "reason": "Fraude détectée lors de l'évaluation",
  "academyCode": "FR",
  "metadata": {}
}
```
