# ============================================================
# ELA — Deploiement des Cloud Functions (production)
# Projet : ela-academy-7f868   |   Region principale : africa-south1
# ------------------------------------------------------------
# Pourquoi ce script ?
# Le require() du SDK firebase-functions (v2/https + v2/firestore)
# prend ~6-8 s sur ce poste. Le serveur de decouverte du Firebase CLI
# n'accorde que 10 s par defaut, d'ou l'erreur :
#   "User code failed to load. Cannot determine backend specification.
#    Timeout after 10000."
# On releve donc le delai de decouverte a 120 s via la variable
# d'environnement supportee par le CLI : FUNCTIONS_DISCOVERY_TIMEOUT
# (en secondes). Voir :
#   https://firebase.google.com/docs/functions/tips#avoid_deployment_timeouts_during_initialization
# Aucun code Functions n'est modifie et aucune securite n'est affaiblie.
#
# Le deploiement est STRICTEMENT limite aux Functions : les Rules
# Firestore (deja en production), le Hosting et le Storage ne sont
# jamais touches.
#
# La fonction historique getTeacherStats existe en production mais est
# volontairement commentee dans functions/index.js : on repond "non" a
# l'invite de suppression afin de la preserver.
# ============================================================
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$env:FUNCTIONS_DISCOVERY_TIMEOUT = "120"

Write-Host "Deploiement des Cloud Functions vers ela-academy-7f868 (discovery timeout = 120s)..."
"n`n30`n" | firebase deploy --only functions --project ela-academy-7f868 --interactive
