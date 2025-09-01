# Deploy Etherith to Cloudflare Workers with D1 Database
Write-Host "🚀 Deploying Etherith to Cloudflare Workers with D1 Database..." -ForegroundColor Green

# Build the Next.js app
Write-Host "📦 Building Next.js app..." -ForegroundColor Yellow
npm run build

# Deploy to Cloudflare Workers with D1 database
Write-Host "🌐 Deploying to Cloudflare Workers (production-d1 environment)..." -ForegroundColor Yellow
wrangler pages deploy .next --project-name etherith --env production-d1

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌍 Your app is now running on Cloudflare Workers with D1 database access" -ForegroundColor Cyan
Write-Host "🔗 Check your Cloudflare dashboard for the deployment URL" -ForegroundColor Cyan
