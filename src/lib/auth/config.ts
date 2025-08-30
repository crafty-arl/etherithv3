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

  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub as string,
          } as typeof session.user & { id: string },
        }
      }
      return session
    },
    
    async jwt({ token, account, profile, user }) {
      // Handle Discord-specific data
      if (account?.provider === 'discord' && profile) {
        const discordProfile = profile as { id?: string; username?: string }
        if (discordProfile.id) token.discordId = discordProfile.id
        if (discordProfile.username) token.discordUsername = discordProfile.username
      }
      
      if (user) {
        token.sub = user.id
      }
      
      return token
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user: _user, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        try {
          const db = createDB(globalThis.DB)
          
          // Check if user already exists by Discord ID
          const discordProfile = profile as { id?: string; email?: string; username?: string; global_name?: string; avatar?: string; verified?: boolean }
          const existingUser = await db.select().from(users)
            .where(eq(users.discordId, (discordProfile.id ?? '') as string))
            .limit(1)
          
          if (existingUser.length === 0) {
            // Create new user with Discord data
            await db.insert(users).values({
              id: crypto.randomUUID(),
              email: discordProfile.email || '',
              username: discordProfile.username || '',
              fullName: discordProfile.global_name || discordProfile.username || '',
              avatarUrl: discordProfile.avatar 
                ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                : null,
              discordId: (discordProfile.id ?? '') as string,
              isVerified: discordProfile.verified || false,
            })
          }
        } catch (error) {
          console.error('Discord sign-in error:', error)
          return false
        }
      } else if (account?.provider === 'credentials') {
        // For credentials signup, user should already exist
        // This is handled in the signup API route
        return true
      }
      
      return true
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  debug: process.env.NODE_ENV === 'development',
}
