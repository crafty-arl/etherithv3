import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authConfig: NextAuthOptions = {
  // For local development, we'll use JWT strategy but store data in D1 via API calls
  adapter: undefined,
  
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
          // For local development, we'll call the Cloudflare Worker API
          console.log('🔑 Credentials authorization attempt for:', credentials.email)
          
          // Call the Cloudflare Worker login endpoint
          const response = await fetch('https://etherith-main.carl-6e7.workers.dev/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          if (response.ok) {
            const data = await response.json() as {
              success: boolean;
              message: string;
              user: {
                id: string;
                email: string;
                fullName: string;
                username: string;
                avatarUrl?: string;
                culturalBackground?: string;
                isVerified: boolean;
              };
            };
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.fullName,
              username: data.user.username,
              image: data.user.avatarUrl,
              culturalBackground: data.user.culturalBackground,
              isVerified: data.user.isVerified
            };
          }
          
          return null;
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
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async session({ session, token }) {
      console.log('📋 Session callback:', {
        hasToken: !!token,
        tokenSub: token.sub,
        tokenUsername: (token as any).username,
        sessionUser: session.user?.email
      })
      
      if (token && session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub as string,
            username: (token as any).username || session.user.email?.split('@')[0],
            culturalBackground: (token as any).culturalBackground || 'Default',
            isVerified: (token as any).isVerified || false,
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
      console.log('🎫 JWT Callback triggered:', {
        hasToken: !!token,
        hasAccount: !!account,
        hasProfile: !!profile,
        hasUser: !!user,
        provider: account?.provider,
        nodeEnv: process.env.NODE_ENV,
        tokenSub: token.sub
      })
      
      // Handle Discord-specific data
      if (account?.provider === 'discord' && profile) {
        try {
          console.log('🎮 Discord OAuth data received:', {
            id: (profile as any).id,
            username: (profile as any).username,
            email: (profile as any).email,
            global_name: (profile as any).global_name,
            verified: (profile as any).verified
          })
          
          // Store Discord data in D1 database via Cloudflare Worker API
          const discordProfile = profile as { 
            id?: string; 
            username?: string; 
            email?: string; 
            global_name?: string; 
            avatar?: string; 
            verified?: boolean 
          }
          
          if (discordProfile.email) {
            try {
              // Call Cloudflare Worker to store Discord user data
              const response = await fetch('https://etherith-main.carl-6e7.workers.dev/api/auth/discord/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  discordId: discordProfile.id,
                  email: discordProfile.email,
                  username: discordProfile.username || discordProfile.global_name || 'discord_user',
                  fullName: discordProfile.global_name || discordProfile.username || 'Discord User',
                  avatar: discordProfile.avatar,
                  verified: discordProfile.verified || false
                })
              });

              if (response.ok) {
                const data = await response.json() as {
                  success: boolean;
                  message: string;
                  userId: string;
                };
                console.log('✅ Discord data stored in D1:', data);
                
                // Store Discord data in the JWT token
                token.discordId = discordProfile.id
                token.username = discordProfile.username || discordProfile.global_name || 'discord_user'
                token.email = discordProfile.email
                token.name = discordProfile.global_name || discordProfile.username || 'Discord User'
                token.picture = discordProfile.avatar 
                  ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                  : undefined
                token.culturalBackground = 'Discord User'
                token.isVerified = discordProfile.verified || false
                token.sub = data.userId // Use the D1 database user ID
                
                console.log('✅ Discord data stored in token:', {
                  discordId: token.discordId,
                  username: token.username,
                  email: token.email,
                  name: token.name,
                  userId: token.sub
                })
              } else {
                console.error('❌ Failed to store Discord data in D1:', await response.text());
              }
            } catch (error) {
              console.error('❌ Error calling Cloudflare Worker API:', error);
            }
          }
        } catch (error) {
          console.error('❌ Error handling Discord profile:', error)
        }
      }
      
      return token
    },
    
    async signIn({ user, account, profile }) {
      console.log('🔐 Sign in callback:', {
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile,
        provider: account?.provider,
        nodeEnv: process.env.NODE_ENV
      })
      
      // Always allow sign in for now
      return true
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  debug: process.env.NODE_ENV === 'development',
}
