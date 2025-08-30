import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { createDB } from '@/lib/db'

// Configure the adapter with D1 database
const configWithAdapter = {
  ...authConfig,
  adapter: DrizzleAdapter(createDB(globalThis.DB))
}

const handler = NextAuth(configWithAdapter)

export { handler as GET, handler as POST }