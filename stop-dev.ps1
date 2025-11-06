# Script para detener APT - Development Mode
# Detiene todos los contenedores de Docker Compose

Write-Host "Deteniendo APT - Advanced People Tracking" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow

# Detener Docker Compose
docker-compose -f docker-compose.mvp.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK - Contenedores detenidos exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "NOTA: Para eliminar tambien los volumenes:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.mvp.yml down -v" -ForegroundColor White
    Write-Host ""
    Write-Host "NOTA: Para iniciar nuevamente:" -ForegroundColor Yellow
    Write-Host "   .\start-dev.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Error al detener los contenedores" -ForegroundColor Red
    exit 1
}
