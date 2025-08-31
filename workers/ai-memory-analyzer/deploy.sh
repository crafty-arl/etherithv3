#!/bin/bash

echo "🚀 Deploying AI Memory Analyzer Worker..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

# Deploy the worker
echo "📦 Deploying to Cloudflare..."
npx wrangler deploy

echo "✅ Deployment complete!"
echo "🔗 Set CLOUDFLARE_WORKER_URL in your Next.js app to use the worker"
