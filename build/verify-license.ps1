[CmdletBinding()]
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingPlainTextForPassword', '')]
param(
    [string]$email,
    [string]$authSecret,
    [string]$otp,
    [string]$key
)

$ErrorActionPreference = "Stop"
try {
    $apiBase = if ($env:BILLIONDUE_API_URL) { $env:BILLIONDUE_API_URL.TrimEnd('/') } elseif ($env:LEDGERSHIELD_API_URL) { $env:LEDGERSHIELD_API_URL.TrimEnd('/') } else { "http://localhost:8787/api" }
    $serial = (Get-CimInstance Win32_BIOS).SerialNumber
    if (-not $serial -or $serial.Trim() -eq "") {
        $serial = (Get-CimInstance Win32_BaseBoard).SerialNumber
    }
    if (-not $serial -or $serial.Trim() -eq "") {
        $serial = "SN-WIN-" + [Guid]::NewGuid().ToString().Substring(0,8).ToUpper()
    }
    $pc = $env:COMPUTERNAME

    $body = @{
        emailOrUser = $email
        password = $authSecret
        otp = $otp
        installationKey = $key
        deviceName = $pc
        serialNumber = $serial.Trim()
        fingerprint = "fp:win-" + $serial.Trim()
        os = "Windows 11 Pro 64-bit"
    } | ConvertTo-Json -Compress

    $res = Invoke-RestMethod -Uri "$apiBase/client/install-verify" -Method Post -ContentType "application/json" -Body $body

    # Persist activation into Windows Registry (BillionDue & legacy LedgerShield)
    foreach ($rk in @("HKCU:\Software\BillionDue", "HKCU:\Software\LedgerShield")) {
        if (-not (Test-Path $rk)) {
            New-Item -Path $rk -Force | Out-Null
        }
        Set-ItemProperty -Path $rk -Name "CompanyId" -Value $res.company.id
        Set-ItemProperty -Path $rk -Name "CompanyName" -Value $res.company.name
        Set-ItemProperty -Path $rk -Name "SerialNumber" -Value $res.device.serialNumber
        Set-ItemProperty -Path $rk -Name "Fingerprint" -Value $res.device.fingerprint
        Set-ItemProperty -Path $rk -Name "InstallationKey" -Value $key
        Set-ItemProperty -Path $rk -Name "Activated" -Value "1"
    }

    # Persist activation into AppData (BillionDue & legacy LedgerShield)
    foreach ($sub in @("BillionDue", "LedgerShield")) {
        $appDataDir = Join-Path $env:APPDATA $sub
        if (-not (Test-Path $appDataDir)) {
            New-Item -ItemType Directory -Path $appDataDir -Force | Out-Null
        }
        $licFile = Join-Path $appDataDir "license.json"
        $licJson = @{
            mode = "commercial"
            companyId = $res.company.id
            companyName = $res.company.name
            authenticatedUser = $res.company.super_admin_user
            deviceId = $res.device.id
            serialNumber = $res.device.serialNumber
            fingerprint = $res.device.fingerprint
            installationKey = $key
            activated = $true
            verifiedAt = $res.device.verifiedAt
            expiresAt = $res.device.leaseExpiresAt
        } | ConvertTo-Json
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($licFile, $licJson, $utf8NoBom)
    }

    Write-Output "OK_VERIFIED:$($res.device.serialNumber):$($res.company.name)"
} catch {
    $errDetail = $_.Exception.Message
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $respBody = $reader.ReadToEnd()
            $jsonErr = $respBody | ConvertFrom-Json
            if ($jsonErr.error) {
                $errDetail = $jsonErr.error
            }
        } catch {}
    }
    Write-Output "ERR_VERIFIED:$errDetail"
}
