# Efficient D1 Testing & Deployment Script
Write-Host "🚀 Efficient D1 Database Testing..." -ForegroundColor Green

# Option 1: Direct D1 Testing (Fastest - No build required)
Write-Host "📊 Option 1: Direct D1 Testing (Recommended)" -ForegroundColor Yellow
Write-Host "Run these commands to test D1 directly:" -ForegroundColor White
Write-Host "  wrangler d1 execute etherith-db --file=setup-d1.sql" -ForegroundColor Cyan
Write-Host "  wrangler d1 execute etherith-db --file=test-d1.sql" -ForegroundColor Cyan

# Option 2: Quick Pages Deploy (If you need the web interface)
Write-Host "`n🌐 Option 2: Quick Pages Deploy" -ForegroundColor Yellow
Write-Host "If you need the web interface, run:" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor Cyan
Write-Host "  wrangler pages deploy dist --project-name etherith" -ForegroundColor Cyan

# Option 3: Development Testing
Write-Host "`n🔧 Option 3: Development Testing" -ForegroundColor Yellow
Write-Host "For local development:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Cyan

Write-Host "`n✅ Choose the option that fits your needs:" -ForegroundColor Green
Write-Host "  • Option 1: Fastest D1 testing (no build)" -ForegroundColor White
Write-Host "  • Option 2: Full web app deployment" -ForegroundColor White
Write-Host "  • Option 3: Local development" -ForegroundColor White

Write-Host "`n🔧 Quick Commands:" -ForegroundColor Yellow
Write-Host "  .\deploy-efficient.ps1" -ForegroundColor White
Write-Host "  wrangler d1 execute etherith-db --file=setup-d1.sql" -ForegroundColor White
Write-Host "  wrangler d1 execute etherith-db --file=test-d1.sql" -ForegroundColor White
