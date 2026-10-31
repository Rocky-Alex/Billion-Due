@echo off
echo ===================================================
echo   Installing "Team BC Dev" Code Signing Certificate
echo ===================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Administrator privileges required.
    echo Please right-click this file and choose "Run as administrator".
    echo.
    pause
    exit /b 1
)

certutil -addstore "TrustedPublisher" "%~dp0build\cert.cer"
certutil -addstore "Root" "%~dp0build\cert.cer"

echo.
echo [SUCCESS] "Team BC Dev" is now trusted on this computer!
echo When launching the installer, UAC will display:
echo   Verified publisher: Team BC Dev
echo.
pause

