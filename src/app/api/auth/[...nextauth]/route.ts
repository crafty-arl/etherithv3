import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { createDB } from '@/lib/db'

// Mark this route as dynamic since it handles authentication
export const dynamic = 'force-dynamic'

// Add debugging
console.log('NextAuth Config:', {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? 'SET' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV,
  DB_AVAILABLE: typeof globalThis.DB !== 'undefined' ? 'YES' : 'NO'
})

// Configure the adapter with D1 database
// Handle both local development and Cloudflare Workers
let configWithAdapter

if (typeof globalThis.DB !== 'undefined') {
  // Cloudflare Workers environment - use D1
  console.log('Using D1 database adapter')
  configWithAdapter = {
    ...authConfig,
    adapter: DrizzleAdapter(createDB(globalThis.DB))
  }
} else {
  // Local development environment - use JWT strategy without adapter
  console.log('Using JWT strategy (no database adapter)')
  configWithAdapter = {
    ...authConfig,
    // Remove adapter for local development
    // adapter: undefined
  }
}

const handler = NextAuth(configWithAdapter)

export { handler as GET, handler as POST }