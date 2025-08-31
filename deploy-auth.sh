#!/bin/bash

# Etherith Authentication System Deployment Script
# This script deploys the authentication system to Cloudflare Workers

set -e

echo "🚀 Deploying Etherith Authentication System to Cloudflare Workers..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found. Please run this script from the project root."
    exit 1
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the build errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Cloudflare Workers
echo "🌐 Deploying to Cloudflare Workers..."
wrangler deploy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. Please check your Cloudflare configuration and try again."
    exit 1
fi

echo "✅ Deployment completed successfully!"

# Get the deployment URL
DEPLOYMENT_URL=$(wrangler whoami --format json | jq -r '.account.name')
if [ "$DEPLOYMENT_URL" != "null" ] && [ "$DEPLOYMENT_URL" != "" ]; then
    echo "🌍 Your app is now deployed at: https://$DEPLOYMENT_URL.workers.dev"
else
    echo "🌍 Your app has been deployed to Cloudflare Workers!"
fi

# Initialize the database
echo "🗄️  Initializing database..."
curl -s "https://$DEPLOYMENT_URL.workers.dev/api/setup" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database initialized successfully!"
else
    echo "⚠️  Database initialization may have failed. Please check manually at:"
    echo "   https://$DEPLOYMENT_URL.workers.dev/api/setup"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables in the Cloudflare dashboard"
echo "2. Configure your Discord OAuth application (if using Discord login)"
echo "3. Test the authentication system at: https://$DEPLOYMENT_URL.workers.dev/auth/signin"
echo "4. Test the protected API at: https://$DEPLOYMENT_URL.workers.dev/api/auth/test"
echo ""
echo "For more information, see: AUTHENTICATION_IMPLEMENTATION.md"
