import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import CredentialsProvider from 'next-auth/providers/credentials'
import { D1Adapter } from '@auth/d1-adapter'
import { createDB } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { users, accounts } from '@/lib/db/schema'

export const authConfig: NextAuthOptions = {
  // Use the official D1 adapter when available
  adapter: typeof globalThis.DB !== 'undefined' ? D1Adapter(globalThis.DB) : undefined,
  
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      }
    }),
    
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const db = createDB(globalThis.DB)
          const [user] = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1)
          
          if (!user || !user.password) {
            return null
          }

          // Verify password hash
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: user.avatarUrl,
            username: user.username,
            culturalBackground: user.culturalBackground,
            isVerified: user.isVerified,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    // Use a strong secret for JWT signing
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    // Set reasonable expiration
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub as string,
            username: token.username as string,
            culturalBackground: token.culturalBackground as string,
            isVerified: token.isVerified as boolean,
          } as typeof session.user & { 
            id: string;
            username: string;
            culturalBackground: string;
            isVerified: boolean;
          },
        }
      }
      return session
    },
    
    async jwt({ token, account, profile, user }) {
      // Handle Discord-specific data
      if (account?.provider === 'discord' && profile) {
        try {
          // Check if we're in a Cloudflare Workers environment with D1
          if (typeof globalThis.DB === 'undefined') {
            console.log('Local development: Storing Discord data in JWT token')
            // In local development, store Discord data directly in the token
            const discordProfile = profile as { id?: string; username?: string; email?: string; global_name?: string; avatar?: string; verified?: boolean }
            
            if (discordProfile.id) {
              token.discordId = discordProfile.id
              token.username = discordProfile.username || `discord_${discordProfile.id}`
              token.email = discordProfile.email
              token.name = discordProfile.global_name || discordProfile.username || 'Discord User'
              token.picture = discordProfile.avatar 
                ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                : undefined
              token.isVerified = discordProfile.verified || false
            }
          } else {
            // Cloudflare Workers environment - D1 adapter handles this automatically
            console.log('Cloudflare Workers: D1 adapter will handle Discord data storage')
          }
        } catch (error) {
          console.error('JWT Discord data fetch error:', error)
        }
      }
      
      if (user) {
        token.sub = user.id
        // Type assertion to handle custom user properties
        const customUser = user as any
        token.username = customUser.username
        token.culturalBackground = customUser.culturalBackground
        token.isVerified = customUser.isVerified
      }
      
      return token
    },

    async signIn({ account, profile }) {
      console.log('SignIn callback triggered:', { 
        provider: account?.provider, 
        hasProfile: !!profile,
        profileKeys: profile ? Object.keys(profile) : [],
        nodeEnv: process.env.NODE_ENV,
        hasDB: typeof globalThis.DB !== 'undefined'
      })
      
      if (account?.provider === 'discord' && profile) {
        try {
          // Check if we're in a Cloudflare Workers environment with D1
          if (typeof globalThis.DB === 'undefined') {
            console.log('Local development: Allowing Discord sign-in without database')
            // In local development, allow the sign-in to proceed
            // The JWT callback will handle storing Discord data in the token
            return true
          }
          
          // Cloudflare Workers environment - D1 adapter handles this automatically
          console.log('Cloudflare Workers: D1 adapter will handle Discord sign-in')
          return true
        } catch (error) {
          console.error('Discord sign-in error:', error)
          // In development, allow the sign-in to proceed even if database operations fail
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Allowing sign-in despite database error')
            return true
          }
          return false
        }
      } else if (account?.provider === 'credentials') {
        // For credentials signup, user should already exist
        return true
      }
      
      return true
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Edge-compatible settings for Cloudflare Workers
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },

  debug: process.env.NODE_ENV === 'development',
}
