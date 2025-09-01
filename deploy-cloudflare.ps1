# Deploy Etherith to Cloudflare Pages with D1 Database
Write-Host "🚀 Deploying Etherith to Cloudflare Pages with D1 Database..." -ForegroundColor Green

# Check if wrangler is installed
try {
    $wranglerVersion = wrangler --version
    Write-Host "✅ Wrangler CLI found: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler CLI not found. Installing..." -ForegroundColor Red
    npm install -g wrangler
}

# Build the Next.js app
Write-Host "📦 Building Next.js app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to Cloudflare Pages
Write-Host "🌐 Deploying to Cloudflare Pages..." -ForegroundColor Yellow
wrangler pages deploy .next --project-name etherith

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌍 Your app is now running on Cloudflare Pages with D1 database access" -ForegroundColor Cyan
    Write-Host "🔗 Check your Cloudflare dashboard for the deployment URL" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
