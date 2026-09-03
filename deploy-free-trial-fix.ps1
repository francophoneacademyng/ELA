# ============================================================
# FRANCOPHONE ACADEMY — Free Trial Deployment Fix Script
# Objectif : Libérer le quota CPU Cloud Run et redéployer
# les fonctions critiques pour la mission Free Trial.
# ============================================================
# Auteur : Kimi / Francophone Academy
# Date : 2026-09-03
# Projet : ela-academy-7f868
# Région : africa-south1
# ============================================================

$ErrorActionPreference = "Continue"
$projectDir = "C:\Users\11e\Documents\ELA\PROJET"
$region = "africa-south1"

function Write-Header($text) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $text -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Success($text) { Write-Host "✓ $text" -ForegroundColor Green }
function Write-Warning($text) { Write-Host "⚠ $text" -ForegroundColor Yellow }
function Write-Error($text) { Write-Host "✗ $text" -ForegroundColor Red }

Set-Location $projectDir

Write-Header "ETAPE 1/5 — Suppression des fonctions non critiques (libération CPU)"

# Groupe 1 : Certificats (non critiques pour Free Trial)
$certFunctions = @("getELACertificatePdfUrl", "listELACertificates", "migrateLegacyCertificates")
foreach ($fn in $certFunctions) {
    Write-Host "Suppression de $fn..." -NoNewline
    $result = npx firebase-tools functions:delete $fn --region $region --force 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$fn supprimée"
    } else {
        Write-Warning "$fn n'a pas pu etre supprimée (peut-etre deja absente)"
    }
}

# Groupe 2 : Paiements (non critiques pour le trial)
Write-Host "Suppression de verifyPaystackPayment..." -NoNewline
$result = npx firebase-tools functions:delete verifyPaystackPayment --region $region --force 2>&1
if ($LASTEXITCODE -eq 0) { Write-Success "verifyPaystackPayment supprimée" } 
else { Write-Warning "verifyPaystackPayment non supprimée" }

# Groupe 3 : Live & Admin (non critiques)
$adminFunctions = @("getLiveMeetingLink", "reviewContent")
foreach ($fn in $adminFunctions) {
    Write-Host "Suppression de $fn..." -NoNewline
    $result = npx firebase-tools functions:delete $fn --region $region --force 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Success "$fn supprimée" } 
    else { Write-Warning "$fn non supprimée" }
}

Write-Header "ETAPE 2/5 — Attente de liberation du CPU (30 secondes)"
Write-Host "Cloud Run met quelques secondes a liberer le quota CPU..."
Start-Sleep -Seconds 30

Write-Header "ETAPE 3/5 — Redeploiement des fonctions critiques"

# Critique 1 : seedCurriculum (pour marquer isTrial sur les leçons)
Write-Host "Deploiement de seedCurriculum..." -NoNewline
$result = npx firebase-tools deploy --only functions:seedCurriculum 2>&1
if ($LASTEXITCODE -eq 0) { Write-Success "seedCurriculum deployee" }
else { Write-Error "seedCurriculum a echoue — voir logs ci-dessus" }

Start-Sleep -Seconds 10

# Critique 2 : getCatalog (pour le catalogue academies)
Write-Host "Deploiement de getCatalog..." -NoNewline
$result = npx firebase-tools deploy --only functions:getCatalog 2>&1
if ($LASTEXITCODE -eq 0) { Write-Success "getCatalog deployee" }
else { Write-Error "getCatalog a echoue — voir logs ci-dessus" }

Start-Sleep -Seconds 10

# Critique 3 : getAcademyTree
Write-Host "Deploiement de getAcademyTree..." -NoNewline
$result = npx firebase-tools deploy --only functions:getAcademyTree 2>&1
if ($LASTEXITCODE -eq 0) { Write-Success "getAcademyTree deployee" }
else { Write-Error "getAcademyTree a echoue — voir logs ci-dessus" }

Start-Sleep -Seconds 10

# Critique 4 : getQuizCatalog
Write-Host "Deploiement de getQuizCatalog..." -NoNewline
$result = npx firebase-tools deploy --only functions:getQuizCatalog 2>&1
if ($LASTEXITCODE -eq 0) { Write-Success "getQuizCatalog deployee" }
else { Write-Error "getQuizCatalog a echoue — voir logs ci-dessus" }

Write-Header "ETAPE 4/5 — Verification des fonctions actives"
Write-Host "Fonctions qui DOIVENT etre actives pour Free Trial :"
Write-Host "  • getTrialLessons      → recupere les leçons trial"
Write-Host "  • seedAcademyA1        → seed les leçons A1"
Write-Host "  • seedCurriculum       → seed global (doit etre deploye ci-dessus)"
Write-Host "  • getCatalog           → catalogue academies (doit etre deploye ci-dessus)"
Write-Host "  • getAcademyTree       → arbre academie (doit etre deploye ci-dessus)"
Write-Host "  • getQuizCatalog       → quiz (doit etre deploye ci-dessus)"
Write-Host "  • getCourse            → contenu leçon"
Write-Host "  • getDashboardData     → dashboard utilisateur"
Write-Host "  • setUserRole          → gestion des roles"
Write-Host "  • initializePayment    → paiements"
Write-Host "  • previewPayment       → aperçu paiement"
Write-Host "  • paystackWebhook      → webhook Paystack"
Write-Host "  • healthCheck          → health check"
Write-Host "  • learningAssistant    → assistant IA"
Write-Host "  • getMyAcademies       → mes academies"
Write-Host "  • getAdminPanelData    → panel admin"
Write-Host "  • getAdminQueue        → file admin"
Write-Host "  • generateCertificate  → generation certificat"
Write-Host "  • issueELACertificate  → emission certificat"
Write-Host "  • verifyELACertificate → verification certificat"
Write-Host "  • generateELACertificatePdf → PDF certificat"
Write-Host "  • revokeELACertificate → revocation certificat"
Write-Host "  • checkSubscriptionExpiry → expiration abonnement"
Write-Host "  • getLiveCatalog       → catalogue live"
Write-Host "  • seedAcademyTree      → seed arbre"

Write-Header "ETAPE 5/5 — Seed des leçons en production"
Write-Host "Si seedCurriculum a ete deployee avec succes, executez :"
Write-Host "  npx firebase-tools functions:shell"
Write-Host "Puis dans le shell :"
Write-Host "  seedCurriculum()"
Write-Host ""
Write-Host "OU executez le script local :"
Write-Host "  node scripts/inject-legacy-a1.js"
Write-Host ""
Write-Host "OU appelez getTrialLessons depuis l'app pour verifier que les leçons sont bien marquees."

Write-Header "DEPLOIEMENT HOSTING"
Write-Host "Le hosting est deja deploye :"
Write-Host "  https://ela-academy-7f868.web.app/#/free-trial" -ForegroundColor Green

Write-Header "VERIFICATION FINALE"
Write-Host "Ouvrez l'URL ci-dessus et verifiez :"
Write-Host "  [ ] Hero avec gradient emerald→forest"
Write-Host "  [ ] 6 cartes academies (FR, DE, ZH, EN, AR, RU)"
Write-Host "  [ ] 2 leçons 'Free — Start Now' par carte"
Write-Host "  [ ] 4 leçons 'Free — Sign Up' avec overlay floute"
Write-Host "  [ ] Modal auth elegant au clic sur une leçon verrouillee"
Write-Host "  [ ] Formulaire newsletter en bas"
Write-Host ""
Write-Host "Si des leçons n'apparaissent pas, c'est que isTrial n'est pas seede en prod."
Write-Host "Relancez le seed (etape 5 ci-dessus)."

Write-Header "SCRIPT TERMINE"
Write-Host "Appuyez sur une touche pour fermer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
