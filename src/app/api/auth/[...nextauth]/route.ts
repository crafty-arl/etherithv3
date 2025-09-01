import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

// Mark this route as dynamic since it handles authentication
export const dynamic = 'force-dynamic'

// Add debugging
console.log('NextAuth Config:', {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? 'SET' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV,
  DB_AVAILABLE: typeof globalThis.DB !== 'undefined' ? 'YES' : 'NO',
  ADAPTER_TYPE: typeof globalThis.DB !== 'undefined' ? 'D1' : 'JWT'
})

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }