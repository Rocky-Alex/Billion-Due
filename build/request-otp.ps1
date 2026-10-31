[CmdletBinding()]
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingPlainTextForPassword', '')]
param(
    [string]$email,
    [string]$authSecret
)

$ErrorActionPreference = "Stop"
try {
    $apiBase = if ($env:BILLIONDUE_API_URL) { $env:BILLIONDUE_API_URL.TrimEnd('/') } elseif ($env:LEDGERSHIELD_API_URL) { $env:LEDGERSHIELD_API_URL.TrimEnd('/') } else { "http://localhost:8787/api" }
    $body = @{
        emailOrUser = $email
        password = $authSecret
    } | ConvertTo-Json -Compress

    $res = Invoke-RestMethod -Uri "$apiBase/client/install-request-otp" -Method Post -ContentType "application/json" -Body $body
    if ($res.emailSent) {
        Write-Output "SENT:$($res.maskedEmail):$($res.email)"
    } elseif ($res.otpPreview) {
        Write-Output "DEV:$($res.maskedEmail):$($res.otpPreview)"
    } else {
        Write-Output "OK:$($res.maskedEmail)"
    }
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
    Write-Output "ERR:$errDetail"
}
