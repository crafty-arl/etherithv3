import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createDB } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { users } from '@/lib/db/schema'

export const authConfig: NextAuthOptions = {
  // We'll configure the adapter in the route handler where we have access to D1
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
            // Cloudflare Workers environment - use database
            const db = createDB(globalThis.DB)
            const discordProfile = profile as { id?: string; username?: string }
            
            if (discordProfile.id) {
              // Fetch the user data from database
              const dbUser = await db.select().from(users)
                .where(eq(users.discordId, discordProfile.id))
                .limit(1)
              
              if (dbUser.length > 0) {
                token.sub = dbUser[0].id
                token.username = dbUser[0].username
                token.culturalBackground = dbUser[0].culturalBackground
                token.isVerified = dbUser[0].isVerified
                token.discordId = dbUser[0].discordId
                token.avatarUrl = dbUser[0].avatarUrl
              }
            }
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
          
          // Cloudflare Workers environment - use database
          const db = createDB(globalThis.DB)
          
          // Type the Discord profile properly
          const discordProfile = profile as { 
            id?: string; 
            email?: string; 
            username?: string; 
            global_name?: string; 
            avatar?: string; 
            verified?: boolean 
          }
          
          if (!discordProfile.id) {
            console.error('Missing Discord ID in profile')
            return false
          }
          
          // Check if user already exists by Discord ID
          const existingUsers = await db.select().from(users)
            .where(eq(users.discordId, discordProfile.id))
            .limit(1)
          
          if (existingUsers.length === 0) {
            // Check if user exists by email and link the accounts
            let userId: string
            const email = discordProfile.email || `${discordProfile.username}@discord.local`
            
            const existingByEmail = await db.select().from(users)
              .where(eq(users.email, email))
              .limit(1)
            
            if (existingByEmail.length > 0) {
              // Link Discord to existing account
              userId = existingByEmail[0].id
              await db.update(users)
                .set({
                  discordId: discordProfile.id,
                  avatarUrl: discordProfile.avatar 
                    ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                    : existingByEmail[0].avatarUrl,
                  isVerified: discordProfile.verified || existingByEmail[0].isVerified,
                  updatedAt: new Date()
                })
                .where(eq(users.id, userId))
            } else {
              // Create completely new user
              userId = crypto.randomUUID()
              await db.insert(users).values({
                id: userId,
                email: email,
                username: discordProfile.username || `discord_${discordProfile.id}`,
                fullName: discordProfile.global_name || discordProfile.username || 'Discord User',
                avatarUrl: discordProfile.avatar 
                  ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                  : null,
                discordId: discordProfile.id,
                isVerified: discordProfile.verified || false,
                verificationLevel: 1
              })
            }
          } else {
            // Update existing Discord user
            await db.update(users)
              .set({
                avatarUrl: discordProfile.avatar 
                  ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                  : existingUsers[0].avatarUrl,
                isVerified: discordProfile.verified || existingUsers[0].isVerified,
                updatedAt: new Date()
              })
              .where(eq(users.discordId, discordProfile.id))
          }
          
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
