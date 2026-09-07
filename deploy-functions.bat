@echo off
cd /d C:\Users\11e\Documents\ELA\PROJET
echo Starting deployment at %date% %time% > deploy-all.log

echo.
echo [1/5] Deploying updateUserProfile...
firebase deploy --only functions:updateUserProfile >> deploy-all.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo updateUserProfile: SUCCESS >> deploy-all.log
) else (
    echo updateUserProfile: FAILED >> deploy-all.log
)

echo.
echo [2/5] Deploying getContentStats...
firebase deploy --only functions:getContentStats >> deploy-all.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo getContentStats: SUCCESS >> deploy-all.log
) else (
    echo getContentStats: FAILED >> deploy-all.log
)

echo.
echo [3/5] Deploying createCustomInvoice...
firebase deploy --only functions:createCustomInvoice >> deploy-all.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo createCustomInvoice: SUCCESS >> deploy-all.log
) else (
    echo createCustomInvoice: FAILED >> deploy-all.log
)

echo.
echo [4/5] Deploying getInvoiceList...
firebase deploy --only functions:getInvoiceList >> deploy-all.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo getInvoiceList: SUCCESS >> deploy-all.log
) else (
    echo getInvoiceList: FAILED >> deploy-all.log
)

echo.
echo [5/5] Deploying getWhatsAppLogs...
firebase deploy --only functions:getWhatsAppLogs >> deploy-all.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo getWhatsAppLogs: SUCCESS >> deploy-all.log
) else (
    echo getWhatsAppLogs: FAILED >> deploy-all.log
)

echo.
echo Deploying hosting...
firebase deploy --only hosting >> deploy-all.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo hosting: SUCCESS >> deploy-all.log
) else (
    echo hosting: FAILED >> deploy-all.log
)

echo.
echo Deployment completed at %date% %time% >> deploy-all.log
pause