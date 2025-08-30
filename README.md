# Etherith - Ancestral Memory Preservation Platform

## Overview

Etherith is a high-end, culturally significant memory preservation platform built with **Next.js 14** and powered by **Cloudflare's global serverless platform**. It features IPFS integration via Pinata, AI-powered memory processing, and cultural heritage protection mechanisms using **Cloudflare D1 database** and **Drizzle ORM**.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Authentication**: NextAuth.js with Discord OAuth & email/password
- **Storage**: IPFS via Pinata for decentralized memory storage
- **AI**: OpenAI API for memory processing and analysis
- **Deployment**: Cloudflare Pages with automatic CI/CD
- **Testing**: Jest with 80%+ coverage requirement

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git installed
- Cloudflare account (for deployment)
- Discord Developer Application (for OAuth)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd etherith
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your keys:
   ```env
   # Discord OAuth
   DISCORD_CLIENT_ID="your-discord-client-id"
   DISCORD_CLIENT_SECRET="your-discord-client-secret"
   
   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # IPFS (Pinata)
   PINATA_API_KEY="your-pinata-api-key"
   PINATA_SECRET_API_KEY="your-pinata-secret-key"
   
   # AI Services
   OPENAI_API_KEY="your-openai-api-key"
   
   # Cloudflare (for deployment)
   CLOUDFLARE_ACCOUNT_ID="your-account-id"
   CLOUDFLARE_API_TOKEN="your-api-token"
   ```

3. **Database Setup**:
   ```bash
   # Generate migrations
   npm run db:generate
   
   # For local development, create a local SQLite database
   # The app will automatically create ./dev.db
   ```

4. **Development Server**:
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Building & Deployment

### Local Build

```bash
npm run build
npm run start
```

### Cloudflare Pages Deployment

The project is configured for automatic deployment to Cloudflare Pages:

1. **Setup Cloudflare D1 Database**:
   ```bash
   # Login to Cloudflare
   npx wrangler login
   
   # Create D1 database
   npx wrangler d1 create etherith-db
   
   # Update wrangler.toml with the database_id
   ```

2. **Deploy**:
   - Push to `main` branch triggers automatic deployment
   - Or manually deploy: `npm run build && npx wrangler pages deploy dist`

3. **Run Migrations**:
   ```bash
   npx wrangler d1 migrations apply etherith-db --remote
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/auth/          # NextAuth.js API routes
│   └── page.tsx           # Landing page
├── lib/
│   ├── auth/              # Authentication logic
│   │   ├── config.ts      # NextAuth configuration
│   │   ├── provider.tsx   # Auth context provider
│   │   └── user-service.ts # User management service
│   └── db/                # Database layer
│       ├── schema.ts      # Drizzle schema definitions
│       └── index.ts       # Database connection utilities
├── components/ui/         # Reusable UI components
├── hooks/                 # Custom React hooks
├── services/             # External service integrations
└── types/               # TypeScript type definitions

__tests__/               # Jest test files
drizzle/                # Database migrations
.github/workflows/      # GitHub Actions CI/CD
```

## 🔐 Authentication System

### Supported Methods

1. **Discord OAuth**: Seamless integration with Discord communities
2. **Email/Password**: Traditional authentication with secure password hashing

### Features

- JWT-based sessions
- Role-based access control (RBAC)
- User profile management
- Cultural background tracking
- Verification system with levels

### Usage

```typescript
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <p>Loading...</p>
  if (status === 'unauthenticated') return <p>Access denied</p>
  
  return <p>Welcome {session.user.email}!</p>
}
```

## 🗃️ Database Schema

The application uses **Cloudflare D1** (SQLite) with **Drizzle ORM**:

### Core Tables

- **users**: User profiles, Discord integration, cultural background
- **sessions**: NextAuth session management  
- **accounts**: OAuth provider accounts
- **verification_tokens**: Email verification tokens

### User Management

```typescript
import { UserService } from '@/lib/auth/user-service'

// Create user service instance
const userService = new UserService(DB) // DB is Cloudflare D1 binding

// Create user
const user = await userService.createUser({
  email: 'user@example.com',
  username: 'culturaluser',
  fullName: 'Cultural User',
  culturalBackground: ['Indigenous', 'Native American']
})

// Get user by ID
const user = await userService.getUserById(userId)

// Update user
await userService.updateUser(userId, { 
  bio: 'Preserving our cultural heritage' 
})
```

## 🧪 Testing Strategy

- **Unit Tests**: Core business logic (UserService, authentication)
- **Integration Tests**: Database operations and API routes
- **Component Tests**: React components with Testing Library
- **Coverage**: 80%+ requirement for statements, branches, functions, and lines

### Test Structure

```
src/__tests__/
├── lib/
│   ├── auth/
│   │   └── user-service.test.ts
│   └── db/
│       └── schema.test.ts
└── components/
    └── ui/
        └── button.test.tsx
```

## 🎨 Cultural Heritage Features

### Cultural Context Management
- Cultural background tagging
- Significance scoring
- Community verification
- Heritage protection mechanisms

### Memory Preservation
- IPFS-based decentralized storage
- AI-powered metadata generation
- Cultural relationship mapping
- Community-driven curation

## 📚 Scripts

```json
{
  "dev": "Start development server",
  "build": "Build for production",
  "start": "Start production server",
  "lint": "Run ESLint",
  "type-check": "Run TypeScript checking",
  "test": "Run Jest tests",
  "test:coverage": "Run tests with coverage",
  "test:watch": "Run tests in watch mode",
  "db:generate": "Generate Drizzle migrations",
  "db:migrate": "Apply migrations",
  "db:push": "Push schema changes",
  "db:studio": "Open Drizzle Studio"
}
```

## 🌐 Environment Variables

See `.env.example` for all required environment variables.

### Development vs Production

- **Development**: Uses local SQLite database (`./dev.db`)
- **Production**: Uses Cloudflare D1 database via binding

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain 80%+ test coverage
- Use conventional commit messages
- Ensure all tests pass before submitting PR
- Update documentation for new features

## 📄 License

[License information to be determined based on cultural community needs]

---

**Etherith - Where Memories Live Forever, Where Culture Thrives** 🚀

Built with ❤️ for cultural preservation and heritage protection.