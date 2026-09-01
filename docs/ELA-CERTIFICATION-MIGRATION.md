# ELA — Migration des certificats legacy → `ela_certificates`

## Principe

- **Aucune donnée Firestore n'est supprimée.** Les anciens documents
  `certificates/{legacyId}` sont marqués `migratedToELA` + `migratedAt`.
- Migration **one-shot et idempotente** : un certificat déjà migré est ignoré.
- Chaque migration écrit un event `MIGRATED` dans `ela_certificate_events`.
- Le niveau CECRL est repris de `level` si valide, sinon `B1` ;
  le code académie est dérivé de `academy` (french/francophone → FR, etc.).

## Exécution

Le callable `migrateLegacyCertificates` (africa-south1) est réservé au
super admin ELA (`role == 'admin' | 'system'`) :

```js
// depuis la console navigateur, connecté en admin ELA :
const fn = firebase.app().functions('africa-south1')
  .httpsCallable('migrateLegacyCertificates');
const res = await fn();
// → { ok: true, scanned: N, migrated: N, skipped: N }
```

Par lots de 200 documents — ré-exécuter jusqu'à `scanned: 0`.

## Vérifications post-migration

1. `ela_certificates` contient les certificats au nouveau format
   (id `ELA-XX-Y-XXXXXX`, hash SHA-256, `credentialId`).
2. `certificates` : anciens docs marqués `migratedToELA` (intacts).
3. Dashboard élève : certificats visibles dans « Mes certificats ELA ».
4. `verify.html?id=ELA-XXX` : réponse `valid`/`status` correcte.

## Test end-to-end (checklist manuelle — nécessite un déploiement)

1. **Émission** : réussir un quiz ≥ 80 % → trigger `generateCertificate`
   → certificat dans `ela_certificates` + event `ISSUED` (+ PDF Storage).
2. **Dashboard élève** : section « Mes certificats ELA » affiche la carte
   (QR, badge Valid, boutons PDF / Vérifier).
3. **Vérification publique** : `https://elaacademy.ng/verify.html?id=ELA-…`
   → badge « Valid », aucune donnée sensible dans la réponse.
4. **Révocation admin** : `#/admin` → Certifications → Révoquer + motif →
   statut `revoked`, event `REVOKED`.
5. **Re-vérification** : `verify.html` affiche « Révoqué / invalide ».
6. **Ancien certificat** : après migration, il apparaît au nouveau format ;
   le doc legacy reste intact (marqué `migratedToELA`).

> Les étapes 1-6 s'exécutent après `firebase deploy --only functions,firestore.rules,hosting`
> (ou sur les émulateurs). Ce dépôt ne contient aucun identifiant de production ;
> le déploiement et le test live restent à la charge de l'opérateur.
