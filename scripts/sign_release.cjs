const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const setupExe = path.resolve('release/BillionDue Setup 0.1.0.exe');
const portableExe = path.resolve('release/BillionDue-Portable-0.1.0.exe');
const unpackedExe = path.resolve('release/win-unpacked/BillionDue.exe');
const websiteDest = path.resolve('website/release/BillionDue Setup 0.1.0.exe');

const filesToSign = [setupExe, portableExe, unpackedExe].filter(f => fs.existsSync(f));

if (filesToSign.length > 0) {
  const fileArgs = filesToSign.map(f => `'${f.replace(/'/g, "''")}'`).join(', ');
  const psCmd = [
    `Start-Sleep -Seconds 1`,
    `$cert = Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Subject -like '*Team BC Dev*' } | Select-Object -First 1`,
    `if (-not $cert) { $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject 'CN=Team BC Dev' -CertStoreLocation 'Cert:\\CurrentUser\\My' -NotAfter (Get-Date).AddYears(5) }`,
    `@(${fileArgs}) | ForEach-Object { $filePath = $_; Write-Host "Signing $filePath with Team BC Dev..."; $signed = $false; for ($attempt = 1; $attempt -le 5; $attempt++) { try { $res = Set-AuthenticodeSignature -FilePath $filePath -Certificate $cert -TimestampServer 'http://timestamp.digicert.com' -ErrorAction Stop; $signed = $true; Write-Host "  Success on attempt $attempt"; break } catch { Start-Sleep -Milliseconds 800 } }; if (-not $signed) { Write-Warning "Could not sign $filePath after 5 attempts" } }`
  ].join('; ');

  execSync(`powershell.exe -NoProfile -NonInteractive -Command "${psCmd}"`, { stdio: 'inherit' });
}

if (fs.existsSync(setupExe)) {
  fs.mkdirSync(path.dirname(websiteDest), { recursive: true });
  fs.copyFileSync(setupExe, websiteDest);
  console.log(`Copied updated signed installer to ${websiteDest}`);
}
