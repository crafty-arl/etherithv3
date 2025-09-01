#!/bin/bash

# Deploy Etherith to Cloudflare Workers with D1 Database
echo "🚀 Deploying Etherith to Cloudflare Workers with D1 Database..."

# Build the Next.js app
echo "📦 Building Next.js app..."
npm run build

# Deploy to Cloudflare Workers with D1 database
echo "🌐 Deploying to Cloudflare Workers (production-d1 environment)..."
wrangler pages deploy .next --project-name etherith --env production-d1

echo "✅ Deployment complete!"
echo "🌍 Your app is now running on Cloudflare Workers with D1 database access"
echo "🔗 Check your Cloudflare dashboard for the deployment URL"
