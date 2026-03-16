param(
    [switch]$BuildOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location $repoRoot

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example."
    Write-Host "Update .env with your real GEMINI_API_KEY and RESEND_API_KEY, then rerun this script."
    exit 1
}

Write-Host "Checking Docker availability..."
docker info | Out-Null

$composeArgs = @("-f", "docker-compose.yml", "-f", "docker-compose.prod.yml")

if ($BuildOnly) {
    Write-Host "Building production images..."
    docker compose @composeArgs build
    exit $LASTEXITCODE
}

Write-Host "Starting production stack..."
docker compose @composeArgs up -d --build --remove-orphans
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Deployment status:"
docker compose @composeArgs ps
