# PGS Mono Setup Script
# Run this script to set up the monorepo

Write-Host "🚀 Setting up PGS Mono monorepo..." -ForegroundColor Green

# Check if PNPM is installed
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-Host "✅ PNPM found, using PNPM..." -ForegroundColor Green
    $packageManager = "pnpm"
} else {
    Write-Host "⚠️  PNPM not found, using NPM..." -ForegroundColor Yellow
    $packageManager = "npm"
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Blue
if ($packageManager -eq "pnpm") {
    pnpm install
} else {
    npm install
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location "packages/frontend"
if ($packageManager -eq "pnpm") {
    pnpm install
} else {
    npm install
}
Set-Location "../.."

# Install backend dependencies (Composer)
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location "packages/backend"
if (Get-Command composer -ErrorAction SilentlyContinue) {
    composer install
} else {
    Write-Host "❌ Composer not found. Please install Composer and run 'composer install' in packages/backend/" -ForegroundColor Red
}
Set-Location "../.."

# Copy environment files
Write-Host "🔧 Setting up environment files..." -ForegroundColor Blue
if (-not (Test-Path "packages/backend/.env")) {
    Copy-Item ".env.shared" "packages/backend/.env"
    Write-Host "✅ Created packages/backend/.env from .env.shared" -ForegroundColor Green
}

if (-not (Test-Path "packages/frontend/.env.local")) {
    Copy-Item ".env.shared" "packages/frontend/.env.local"
    Write-Host "✅ Created packages/frontend/.env.local from .env.shared" -ForegroundColor Green
}

# Clean up old directories (optional)
Write-Host "🧹 Cleaning up..." -ForegroundColor Blue
if ((Test-Path "backend") -and (Test-Path "packages/backend")) {
    $response = Read-Host "Remove old 'backend' directory? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Remove-Item "backend" -Recurse -Force
        Write-Host "✅ Removed old backend directory" -ForegroundColor Green
    }
}

if ((Test-Path "frontend") -and (Test-Path "packages/frontend")) {
    $response = Read-Host "Remove old 'frontend' directory? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Remove-Item "frontend" -Recurse -Force
        Write-Host "✅ Removed old frontend directory" -ForegroundColor Green
    }
}

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure your .env files in packages/backend/ and packages/frontend/"
Write-Host "2. Run database migrations: $packageManager run dev:backend -- migrate"
Write-Host "3. Start development: $packageManager run dev"
Write-Host ""
