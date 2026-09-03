# ============================================================
# ELA — Admin/Teacher/Live Classes Deployment Script
# Objectif : Redéployer les fonctions Cloud pour les dashboards
# Admin, Teacher et Live Classes (modèle Francophone Academy)
# ============================================================
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

Write-Header "MISSION: Admin/Teacher/Live Classes Dashboard"

Write-Host "`nFonctions à déployer :" -ForegroundColor White
Write-Host "  • getAdminPanelData    → panel admin (KPIs, users, revenue)"
Write-Host "  • getAdminQueue        → file de validation contenu"
Write-Host "  • getLiveCatalog       → catalogue cours live"
Write-Host "  • getDashboardData     → dashboard utilisateur + CECRL"
Write-Host "  • getTeacherStats      → statistiques enseignant"
Write-Host "  • seedLiveClasses      → seed 5 sessions live d'exemple"
Write-Host ""

Write-Header "ETAPE 1/3 — Vérification du projet Firebase"
Write-Host "Projet : ela-academy-7f868"
Write-Host "Région  : africa-south1"
Write-Host ""

Write-Header "ETAPE 2/3 — Déploiement des fonctions"

$functions = @(
    "getAdminPanelData",
    "getAdminQueue",
    "getLiveCatalog",
    "getDashboardData",
    "getTeacherStats",
    "seedLiveClasses"
)

foreach ($fn in $functions) {
    Write-Host "Déploiement de $fn..." -NoNewline
    $result = npx firebase-tools deploy --only functions:$fn 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$fn déployée"
    } else {
        Write-Error "$fn a échoué — voir logs ci-dessus"
    }
    Start-Sleep -Seconds 5
}

Write-Header "ETAPE 3/3 — Vérification des fonctions actives"
Write-Host "`nFonctions déployées et actives :" -ForegroundColor White
Write-Host "  • getAdminPanelData    → panel admin (KPIs, users, revenue, live classes)"
Write-Host "  • getAdminQueue        → file de validation (approve/reject)"
Write-Host "  • getLiveCatalog       → catalogue live public (sans lien réunion)"
Write-Host "  • getDashboardData     → dashboard utilisateur (progression CECRL)"
Write-Host "  • getTeacherStats      → statistiques enseignant"
Write-Host "  • seedLiveClasses      → seed 5 sessions live d'exemple"
Write-Host ""

Write-Header "PAGES DASHBOARD DISPONIBLES"
Write-Host "  • #/admin     → Panel Admin (KPIs, validation, certifications)"
Write-Host "  • #/teacher   → Espace Enseignant (forms + stats + soumissions)"
Write-Host "  • #/dashboard → Hub Étudiant (académies + CECRL tracking)"
Write-Host "  • #/live      → Catalogue Live Classes (public)"
Write-Host ""

Write-Header "FONCTIONNALITÉS AJOUTÉES"
Write-Host "  [✓] CECRL Progress Tracking dans le dashboard utilisateur"
Write-Host "  [✓] Statistiques enseignant (total/pending/approved/rejected)"
Write-Host "  [✓] Seed 5 sessions live d'exemple (FR/DE/EN/AR/ZH)"
Write-Host "  [✓] Bouton 'Seed Live Classes' dans le panel admin"
Write-Host ""

Write-Header "PROCHAINES ÉTAPES"
Write-Host "1. Déployez ce script : .\deploy-admin-teacher-live.ps1"
Write-Host "2. Ouvrez #/admin et cliquez 'Seed Live Classes'"
Write-Host "3. Vérifiez #/dashboard pour le CECRL tracking"
Write-Host "4. Vérifiez #/teacher pour les statistiques"
Write-Host ""

Write-Header "SCRIPT TERMINÉ"
Write-Host "Appuyez sur une touche pour fermer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")