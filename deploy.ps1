$ErrorActionPreference = 'Continue'
$LogFile = 'C:\Users\11e\Documents\ELA\PROJET\deploy-log.txt'

function Write-Log($msg) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    "$timestamp - $msg" | Out-File -FilePath $LogFile -Append -Encoding utf8
    Write-Host $msg
}

Set-Location 'C:\Users\11e\Documents\ELA\PROJET'

Write-Log '=== Starting ELA Deployment ==='

$functions = @('updateUserProfile', 'getContentStats', 'createCustomInvoice', 'getInvoiceList', 'getWhatsAppLogs')
$successCount = 0

foreach ($func in $functions) {
    Write-Log "Deploying functions:$func ..."
    try {
        $output = & firebase deploy --only "functions:$func" 2>&1
        $output | Out-File -FilePath $LogFile -Append -Encoding utf8
        if ($LASTEXITCODE -eq 0) {
            Write-Log "functions:$func - SUCCESS"
            $successCount++
        } else {
            Write-Log "functions:$func - FAILED (exit code: $LASTEXITCODE)"
        }
    } catch {
        Write-Log "functions:$func - ERROR: $_"
    }
    Start-Sleep -Seconds 5
}

Write-Log "Deploying hosting..."
try {
    $output = & firebase deploy --only hosting 2>&1
    $output | Out-File -FilePath $LogFile -Append -Encoding utf8
    if ($LASTEXITCODE -eq 0) {
        Write-Log "hosting - SUCCESS"
    } else {
        Write-Log "hosting - FAILED (exit code: $LASTEXITCODE)"
    }
} catch {
    Write-Log "hosting - ERROR: $_"
}

Write-Log "=== Deployment Complete: $successCount/$($functions.Count) functions deployed ==="
Write-Host "DONE"