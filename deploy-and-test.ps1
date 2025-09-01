# Deploy and Test D1 Integration Script
Write-Host "🚀 Deploying Etherith with D1 Database Integration..." -ForegroundColor Green

# Step 1: Deploy to Cloudflare Pages
Write-Host "📦 Deploying to Cloudflare Pages..." -ForegroundColor Yellow
wrangler pages deploy out --project-name etherith

# Step 2: Run D1 migrations
Write-Host "🗄️ Running D1 database migrations..." -ForegroundColor Yellow
wrangler d1 migrations apply etherith-db --local

# Step 3: Setup D1 tables for NextAuth
Write-Host "🔧 Setting up D1 tables for NextAuth..." -ForegroundColor Yellow
Write-Host "Visit: https://etherith.pages.dev/api/setup" -ForegroundColor Cyan
Write-Host "This will create the necessary tables for Discord OAuth" -ForegroundColor White

# Step 4: Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
Write-Host "Visit: https://etherith.pages.dev/test-d1" -ForegroundColor Cyan
Write-Host "Visit: https://etherith.pages.dev/api/user/create" -ForegroundColor Cyan

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Visit /api/setup to initialize D1 tables" -ForegroundColor White
Write-Host "   2. Test Discord OAuth integration" -ForegroundColor White
Write-Host "   3. Visit the test page to create users" -ForegroundColor White
Write-Host "   4. Check your D1 dashboard for data" -ForegroundColor White
