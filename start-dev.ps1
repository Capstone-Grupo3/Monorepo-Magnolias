# Script de inicio rapido para APT - Development Mode
# Ejecuta todo el stack con Docker Compose

Write-Host "Iniciando APT - Advanced People Tracking" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker esta corriendo
Write-Host "Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker no esta corriendo." -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop y vuelve a intentarlo." -ForegroundColor Red
    exit 1
}
Write-Host "OK - Docker esta corriendo" -ForegroundColor Green
Write-Host ""

# Verificar archivos de entorno
Write-Host "Verificando archivos de configuracion..." -ForegroundColor Yellow

if (-not (Test-Path ".\backend\.env")) {
    Write-Host "ADVERTENCIA: Archivo backend/.env no encontrado" -ForegroundColor Yellow
    if (Test-Path ".\backend\.env.example") {
        Write-Host "Copiando .env.example a .env..." -ForegroundColor Yellow
        Copy-Item ".\backend\.env.example" ".\backend\.env"
        Write-Host "OK - Archivo .env creado. Por favor, configura las variables de entorno." -ForegroundColor Green
    } else {
        Write-Host "ERROR: backend/.env.example no encontrado" -ForegroundColor Red
    }
}

if (-not (Test-Path ".\frontend\.env.local")) {
    Write-Host "ADVERTENCIA: Archivo frontend/.env.local no encontrado" -ForegroundColor Yellow
    if (Test-Path ".\frontend\.env.example") {
        Write-Host "Copiando .env.example a .env.local..." -ForegroundColor Yellow
        Copy-Item ".\frontend\.env.example" ".\frontend\.env.local"
        Write-Host "OK - Archivo .env.local creado." -ForegroundColor Green
    } else {
        Write-Host "ERROR: frontend/.env.example no encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Iniciando contenedores con Docker Compose..." -ForegroundColor Yellow
Write-Host ""

# Iniciar Docker Compose
docker-compose -f docker-compose.mvp.yml up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "EXITO - APT iniciado correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Servicios disponibles:" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Frontend:       http://localhost:3001" -ForegroundColor White
    Write-Host "  Backend API:    http://localhost:3000" -ForegroundColor White
    Write-Host "  API Docs:       http://localhost:3000/api" -ForegroundColor White
    Write-Host "  n8n:            http://localhost:5678" -ForegroundColor White
    Write-Host "                  Usuario: admin" -ForegroundColor Gray
    Write-Host "                  Contraseña: admin123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para ver los logs en tiempo real:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.mvp.yml logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "Para detener los servicios:" -ForegroundColor Yellow
    Write-Host "   .\stop-dev.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Error al iniciar los contenedores" -ForegroundColor Red
    Write-Host "Revisa los logs con: docker-compose -f docker-compose.mvp.yml logs" -ForegroundColor Yellow
    exit 1
}
