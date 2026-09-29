# ELA — Certificate Model

**Status:** Implemented locally. Historical compatibility preserved.

## 1. Two authenticity generations

| Generation | schemaVersion | Mechanism | Notes |
|------------|---------------|-----------|-------|
| Historical | 1, 2 | SHA-256 **integrity hash** over certified fields | NOT a digital signature; labelled "integrity hash" |
| Institutional (new) | 3 | SHA-256 integrity hash **+ HMAC-SHA256 authenticity** | Server-only key `ELA_CERT_SIGNING_KEY` |

`verifyCertificateIntegrity(cert)` validates both: it recomputes the SHA-256 hash and, when a signature is present, verifies the HMAC. Historical certificates (no signature) remain valid and are never modified.

## 2. Document fields (certified)

`id`, `certificateType`, `institution`, `academyCode`, `academyLabel`, `language`, `studentId`, `studentName`, `cecrLevel`, `scoreGlobal`, `issueDate`, `expiryDate`, `signedBy`, `signatureAlgorithm`, `signatureHash`, `signature`, `authenticity`, `status`, `verificationUrl`, `sourceAttemptId`, `sourceResultId`, `programmeId`, `examinationId`, `schemaVersion`.

Certified fields are immutable (`IMMUTABLE_FIELDS`); only lifecycle fields (`status`, `supersededBy`, revocation metadata) may change.

## 3. Issuance paths

1. **Academic (preferred):** `certification.issueCertificateFromAcademicRecord` — requires eligibility from authoritative academic + examination facts; idempotent per (student, programme, examination).
2. **Result-based:** `eligibility.issueCertificateFromResult` — transactional, `certificate_grants/{attemptId}` guard.
3. **Historical/legacy:** `migrateLegacyCertificates` — non-destructive.

## 4. Lifecycle

- **Revocation:** `revokeCertificate` → `status='revoked'`, `REVOKED` event; idempotent; cannot reissue a revoked certificate.
- **Reissue:** `reissueCertificate` → new id, original preserved with `supersededBy`, `REISSUED` event with reason.
- **Audit reconciliation:** `reconcileCertificateAudit` adds `RECONCILED_ISSUED` quorum events and reports grant anomalies (orphan/duplicate/inconsistent) without modifying data.

## 5. PDF & QR

`ela-pdf.js` produces a landscape A4 PDF with institution, academy, level, student name, credential id, dates, integrity/authenticity line, and a QR code pointing to the public verification URL. QR payload is exactly the verification URL (no private data).

## 6. Public verification

`verifyELACertificate` (HTTP GET `?id=`) returns the privacy-safe `publicView` plus an explicit `verificationState` and integrity/authenticity status. It never exposes studentId, email, score, or hashes.

Verification states: `VALID`, `REVOKED`, `SUPERSEDED`, `REISSUED`, `EXPIRED`, `NOT_FOUND`, `INTEGRITY_FAILURE`. Classification is performed by `classifyVerification` (pure, tested).

## 7. Key management (documented)

- Key: `ELA_CERT_SIGNING_KEY` (server-only, functions environment).
- Rotation: set a new key and re-sign only newly issued certificates; historical signatures remain verifiable with the key version recorded out-of-band. A key-version field is a recommended future enhancement.
- Compromise response: revoke affected certificates and reissue under a new key (audited).
