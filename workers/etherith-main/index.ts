/**
 * Etherith Main Worker
 * Handles Discord OAuth and D1 database integration
 */

interface DiscordProfile {
  id: string;
  username: string;
  email: string;
  global_name?: string;
  avatar?: string;
  verified: boolean;
}

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  discordId?: string;
  isVerified: boolean;
  verificationLevel: number;
  createdAt: string;
  updatedAt: string;
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      if (path === '/api/setup' && request.method === 'GET') {
        return await handleSetup(env, corsHeaders);
      }
      
      if (path === '/api/auth/discord/callback' && request.method === 'GET') {
        return await handleDiscordCallback(request, env, corsHeaders);
      }
      
      if (path === '/api/auth/discord/login' && request.method === 'GET') {
        return await handleDiscordLogin(request, env, corsHeaders);
      }
      
      if (path === '/api/users' && request.method === 'GET') {
        return await handleGetUsers(env, corsHeaders);
      }

      // Default response
      return new Response(JSON.stringify({
        message: 'Etherith Main Worker',
        endpoints: [
          'GET /api/setup - Initialize database',
          'GET /api/auth/discord/login - Start Discord OAuth',
          'GET /api/auth/discord/callback - Handle Discord OAuth callback',
          'GET /api/users - List users'
        ]
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Database setup
async function handleSetup(env: any, corsHeaders: any): Promise<Response> {
  try {
    const db = env.DB;
    
    // Check if tables exist
    try {
      await db.prepare('SELECT 1 FROM users LIMIT 1').run();
      return new Response(JSON.stringify({
        message: 'Database tables already exist',
        status: 'ready'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      // Tables don't exist, create them
      console.log('Creating database tables...');
      
      // Create users table
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL UNIQUE,
          full_name TEXT NOT NULL,
          password TEXT,
          avatar_url TEXT,
          discord_id TEXT UNIQUE,
          cultural_background TEXT,
          is_verified INTEGER DEFAULT 0,
          verification_level INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `).run();
      
      // Create indexes
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id)').run();
      
      return new Response(JSON.stringify({
        message: 'Database tables created successfully',
        status: 'created'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Setup error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Discord OAuth login initiation
async function handleDiscordLogin(request: Request, env: any, corsHeaders: any): Promise<Response> {
  const clientId = '1372269269143916544';
  const redirectUri = 'https://etherith.pages.dev/api/auth/discord/callback';
  const scope = 'identify email guilds';
  
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  
  return new Response(JSON.stringify({
    authUrl,
    message: 'Discord OAuth URL generated'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Discord OAuth callback handling
async function handleDiscordCallback(request: Request, env: any, corsHeaders: any): Promise<Response> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new Response(JSON.stringify({
        error: 'No authorization code provided'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '1372269269143916544',
        client_secret: 'dJC4yei9lNhPrSzRfYv3oDksh6sqZES1',
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://etherith.pages.dev/api/auth/discord/callback',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Discord token error:', tokenData);
      return new Response(JSON.stringify({
        error: 'Failed to get Discord access token'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user profile from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const discordProfile: DiscordProfile = await userResponse.json();
    
    if (!userResponse.ok) {
      console.error('Discord profile error:', discordProfile);
      return new Response(JSON.stringify({
        error: 'Failed to get Discord user profile'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Store user in D1 database
    const db = env.DB;
    const now = new Date().toISOString();
    
    // Check if user already exists
    const existingUser = await db.prepare(
      'SELECT * FROM users WHERE discord_id = ?'
    ).bind(discordProfile.id).first();

    let userId: string;
    
    if (!existingUser) {
      // Create new user
      userId = crypto.randomUUID();
      await db.prepare(`
        INSERT INTO users (id, email, username, full_name, avatar_url, discord_id, is_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        discordProfile.email,
        discordProfile.username,
        discordProfile.global_name || discordProfile.username,
        discordProfile.avatar ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png` : null,
        discordProfile.id,
        discordProfile.verified ? 1 : 0,
        now,
        now
      ).run();
    } else {
      // Update existing user
      userId = existingUser.id;
      await db.prepare(`
        UPDATE users SET 
          avatar_url = ?,
          is_verified = ?,
          updated_at = ?
        WHERE discord_id = ?
      `).bind(
        discordProfile.avatar ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png` : existingUser.avatar_url,
        discordProfile.verified ? 1 : 0,
        now,
        discordProfile.id
      ).run();
    }

    // Get the final user data
    const finalUser = await db.prepare(
      'SELECT * FROM users WHERE discord_id = ?'
    ).bind(discordProfile.id).first();

    return new Response(JSON.stringify({
      message: 'Discord authentication successful',
      user: {
        id: finalUser.id,
        email: finalUser.email,
        username: finalUser.username,
        fullName: finalUser.full_name,
        avatarUrl: finalUser.avatar_url,
        discordId: finalUser.discord_id,
        isVerified: Boolean(finalUser.is_verified),
        verificationLevel: finalUser.verification_level,
        createdAt: finalUser.created_at,
        updatedAt: finalUser.updated_at
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Discord callback error:', error);
    return new Response(JSON.stringify({
      error: 'Discord authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get all users
async function handleGetUsers(env: any, corsHeaders: any): Promise<Response> {
  try {
    const db = env.DB;
    const users = await db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    
    return new Response(JSON.stringify({
      users: users.results,
      count: users.results.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
