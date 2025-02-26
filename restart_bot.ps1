Write-Host "Stopping existing FastAPI and ngrok..."
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Starting FastAPI..."
Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "uvicorn main:app --reload"


Write-Host "Restarting ngrok..."
Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "ngrok http 8000"
Start-Sleep -Seconds 5


Write-Host "Loading .env file..."
$envFile = ".env"
$lines = Get-Content $envFile
$envVarsHash = @{}

foreach ($line in $lines) {
    if ($line -match "^(.*?)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVarsHash[$key] = $value
    }
}

$ngrok_url = (Invoke-WebRequest -Uri "http://127.0.0.1:4040/api/tunnels" -UseBasicParsing | ConvertFrom-Json).tunnels[0].public_url
Write-Host "New ngrok URL: $ngrok_url"
