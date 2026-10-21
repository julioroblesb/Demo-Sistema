$ErrorActionPreference = 'Stop'
Write-Host 'Nexo · Obtener refresh token de Zoho Mail' -ForegroundColor Green
Write-Host 'No compartas los valores que introduzcas en esta ventana.'
$code = Read-Host 'Pega el código temporal de Zoho'
$clientId = Read-Host 'Pega tu Client ID'
$clientSecret = Read-Host 'Pega tu Client Secret'
if ([string]::IsNullOrWhiteSpace($code) -or [string]::IsNullOrWhiteSpace($clientId) -or [string]::IsNullOrWhiteSpace($clientSecret)) { throw 'Falta uno de los valores.' }
$response = Invoke-RestMethod -Method Post -Uri 'https://accounts.zoho.com/oauth/v2/token' -Body @{
  code = $code.Trim()
  client_id = $clientId.Trim()
  client_secret = $clientSecret.Trim()
  grant_type = 'authorization_code'
}
if (-not $response.refresh_token) { throw ('Zoho no devolvió refresh_token. Respuesta: ' + ($response | ConvertTo-Json -Compress)) }
Set-Clipboard -Value ([string]$response.refresh_token)
Write-Host ''
Write-Host 'Listo. El refresh token está copiado al portapapeles.' -ForegroundColor Green
Write-Host 'Pégalo en Supabase como valor de ZOHO_REFRESH_TOKEN.'
Read-Host 'Pulsa Enter para cerrar'
