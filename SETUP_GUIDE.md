# Etherith Setup Guide

This guide will help you set up Etherith for local development and production deployment on Cloudflare Pages.

## 🏃‍♂️ Quick Setup (5 Minutes)

### 1. Prerequisites Check

```bash
# Check Node.js version (18+ required)
node --version

# Check npm version
npm --version

# Check git installation
git --version
```

### 2. Project Setup

```bash
# Clone the repository
git clone <repository-url>
cd etherith

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### 3. Environment Configuration

Edit `.env.local` with your configuration:

```bash
# Essential for local development
NEXTAUTH_SECRET="generate-a-long-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# For Discord OAuth (optional for basic setup)
DISCORD_CLIENT_ID="your-discord-app-id"
DISCORD_CLIENT_SECRET="your-discord-app-secret"
```

### 4. Database Setup

```bash
# Generate Drizzle migrations
npm run db:generate

# The local SQLite database (dev.db) will be created automatically
```

### 5. Start Development

```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:3000
```

## 🔐 Discord OAuth Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Etherith Dev" (or your preferred name)
4. Go to "OAuth2" section

### 2. Configure OAuth2

1. **Redirect URIs**: Add `http://localhost:3000/api/auth/callback/discord`
2. **Scopes**: Select `identify`, `email`, `guilds`
3. Copy **Client ID** and **Client Secret**
4. Add them to your `.env.local`:

```bash
DISCORD_CLIENT_ID="your-client-id-here"
DISCORD_CLIENT_SECRET="your-client-secret-here"
```

## 🌐 Cloudflare Setup for Production

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Create D1 Database

```bash
# Create the production database
wrangler d1 create etherith-db

# Create development database (optional)
wrangler d1 create etherith-dev-db
```

### 4. Update wrangler.toml

Copy the database ID from the command output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "etherith-db"
database_id = "your-database-id-here"  # Replace this
```

### 5. Run Migrations

```bash
# Apply migrations to production database
wrangler d1 migrations apply etherith-db --remote

# Apply to development database (optional)
wrangler d1 migrations apply etherith-dev-db --remote
```

## 🔧 External Services Setup

### 1. Pinata (IPFS Storage)

1. Sign up at [Pinata.cloud](https://pinata.cloud/)
2. Go to API Keys section
3. Create new API key with admin permissions
4. Add to `.env.local`:

```bash
PINATA_API_KEY="your-api-key"
PINATA_SECRET_API_KEY="your-secret-key"
```

### 2. OpenAI (AI Processing)

1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `.env.local`:

```bash
OPENAI_API_KEY="your-openai-key"
```

## 🚀 Cloudflare Pages Deployment

### 1. GitHub Repository Setup

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Navigate to "Pages"
4. Click "Create a project"
5. Connect to GitHub and select your repository

### 2. Build Configuration

Set these build settings in Cloudflare Pages:

- **Framework preset**: Next.js (Static HTML Export)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (or your project root)

### 3. Environment Variables

In Cloudflare Pages settings, add these environment variables:

```bash
# Production URLs
NEXTAUTH_URL=https://your-domain.pages.dev
NEXTAUTH_SECRET=your-production-secret

# Discord OAuth (production app)
DISCORD_CLIENT_ID=your-production-discord-client-id
DISCORD_CLIENT_SECRET=your-production-discord-client-secret

# External services
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_API_KEY=your-pinata-secret
OPENAI_API_KEY=your-openai-key

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### 4. GitHub Actions Setup

The repository includes GitHub Actions for CI/CD. Add these secrets to your GitHub repository:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:

```bash
NEXTAUTH_SECRET=your-secret
DISCORD_CLIENT_ID=your-discord-id
DISCORD_CLIENT_SECRET=your-discord-secret
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_API_KEY=your-pinata-secret
OPENAI_API_KEY=your-openai-key
CLOUDFLARE_API_TOKEN=your-cloudflare-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

## 🧪 Testing Setup

### 1. Run Tests Locally

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### 2. Test Configuration

The project is configured with:
- Jest for unit testing
- @testing-library/react for component testing
- 80% coverage requirement
- Automatic mocking for external dependencies

## 🔍 Development Tools

### 1. Database Management

```bash
# View database in Drizzle Studio
npm run db:studio

# Push schema changes without migrations (dev only)
npm run db:push

# Generate new migrations
npm run db:generate
```

### 2. Code Quality

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# TypeScript checking
npm run type-check
```

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot find module '@/lib/db'"**
   - Ensure TypeScript paths are configured correctly
   - Restart your development server

2. **Discord OAuth not working**
   - Check redirect URIs match exactly
   - Verify client ID and secret are correct
   - Ensure NEXTAUTH_URL is set correctly

3. **Database connection issues**
   - For local: Check if `dev.db` file is created
   - For production: Verify D1 database ID in wrangler.toml

4. **Build failures on Cloudflare Pages**
   - Check build output directory is set to `dist`
   - Verify all environment variables are set
   - Check build logs for specific errors

### Getting Help

1. Check the main README.md for architecture details
2. Review test files for usage examples
3. Check GitHub Issues for known problems
4. Review Cloudflare Pages build logs for deployment issues

## 📈 Performance Tips

1. **Local Development**
   - Use `npm run dev` with hot reload
   - Keep the local SQLite database for faster queries
   - Use Jest watch mode for continuous testing

2. **Production**
   - Cloudflare Pages provides global CDN
   - D1 database is replicated globally
   - Images are automatically optimized

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to git
   - Use different secrets for development and production
   - Rotate API keys regularly

2. **Authentication**
   - Use strong NEXTAUTH_SECRET (32+ characters)
   - Configure Discord OAuth with production domain
   - Implement proper CORS settings

---

That's it! You now have Etherith running locally and configured for production deployment. 

For more detailed information, check the main README.md file.