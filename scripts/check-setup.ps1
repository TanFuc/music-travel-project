# PowerShell Check Setup Script

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "🎵 FSell Music-Travel Project Check 🎵" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# 1. Install dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
pnpm install

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend; pnpm install; Set-Location ..

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend; pnpm install; Set-Location ..

# 2. Check Backend
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "🚀 Validating Backend..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Set-Location backend
pnpm run validate
$BackendStatus = $LASTEXITCODE
Set-Location ..

# 3. Check Frontend
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "🎨 Validating Frontend..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Set-Location frontend
pnpm run validate
$FrontendStatus = $LASTEXITCODE
Set-Location ..

# Summary
Write-Host "----------------------------------------" -ForegroundColor Cyan
if ($BackendStatus -eq 0 -and $FrontendStatus -eq 0) {
    Write-Host "✅ All checks passed! Ready for production deployment." -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some checks failed! Please review the console output above." -ForegroundColor Red
    if ($BackendStatus -ne 0) { Write-Host "  - Backend validation failed =(" -ForegroundColor Red }
    if ($FrontendStatus -ne 0) { Write-Host "  - Frontend validation failed =(" -ForegroundColor Red }
    exit 1
}
