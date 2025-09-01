/**
 * Etherith Authentication Worker
 * Handles user authentication with D1 database
 */

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  password?: string;
  avatarUrl?: string;
  bio?: string;
  discordId?: string;
  culturalBackground?: string;
  isVerified: boolean;
  verificationLevel: number;
  createdAt: string;
  updatedAt: string;
}

interface DiscordUser {
  id: string;
  username: string;
  email?: string;
  global_name?: string;
  avatar?: string;
  verified?: boolean;
}

interface DiscordAuthRequest {
  discordUser: DiscordUser;
  accessToken: string;
}

interface SignupRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
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
      
      if (path === '/api/auth/signup' && request.method === 'POST') {
        return await handleSignup(request, env, corsHeaders);
      }
      
      if (path === '/api/auth/discord' && request.method === 'POST') {
        return await handleDiscordAuth(request, env, corsHeaders);
      }
      
      if (path === '/api/auth/test' && request.method === 'GET') {
        return await handleAuthTest(request, env, corsHeaders);
      }

      // Default response
      return new Response(JSON.stringify({
        message: 'Etherith Authentication Worker',
        endpoints: [
          'GET /api/setup - Initialize database',
          'POST /api/auth/signup - User registration',
          'POST /api/auth/discord - Discord OAuth authentication',
          'GET /api/auth/test - Test authentication'
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

// Discord authentication handler
async function handleDiscordAuth(request: Request, env: any, corsHeaders: any): Promise<Response> {
  try {
    const body: DiscordAuthRequest = await request.json();
    const { discordUser, accessToken } = body;

    if (!discordUser || !discordUser.id || !accessToken) {
      return new Response(JSON.stringify({
        error: 'Missing Discord user data or access token'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    
    // Check if user already exists by Discord ID
    let user = await db.prepare(
      'SELECT * FROM users WHERE discord_id = ?'
    ).bind(discordUser.id).first();

    const now = new Date().toISOString();
    
    if (!user) {
      // Create new user with Discord data
      const userId = crypto.randomUUID();
      const username = discordUser.username;
      const email = discordUser.email || `${discordUser.username}@discord.local`;
      const fullName = discordUser.global_name || discordUser.username;
      const avatarUrl = discordUser.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null;
      
      // Check if username or email already exists
      const existingUser = await db.prepare(
        'SELECT id FROM users WHERE email = ? OR username = ?'
      ).bind(email, username).first();

      if (existingUser) {
        // Update existing user with Discord data
        await db.prepare(`
          UPDATE users SET 
            discord_id = ?,
            avatar_url = ?,
            is_verified = ?,
            updated_at = ?
          WHERE id = ?
        `).bind(
          discordUser.id,
          avatarUrl,
          discordUser.verified ? 1 : 0,
          now,
          existingUser.id
        ).run();
        
        user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(existingUser.id).first();
      } else {
        // Create completely new user
        await db.prepare(`
          INSERT INTO users (
            id, email, username, full_name, avatar_url, discord_id, 
            is_verified, verification_level, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId, email, username, fullName, avatarUrl, discordUser.id,
          discordUser.verified ? 1 : 0, 1, now, now
        ).run();
        
        user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
      }
    } else {
      // Update existing Discord user's data
      const avatarUrl = discordUser.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : user.avatar_url;
      
      await db.prepare(`
        UPDATE users SET 
          avatar_url = ?,
          is_verified = ?,
          updated_at = ?
        WHERE discord_id = ?
      `).bind(
        avatarUrl,
        discordUser.verified ? 1 : 0,
        now,
        discordUser.id
      ).run();
      
      user = await db.prepare('SELECT * FROM users WHERE discord_id = ?').bind(discordUser.id).first();
    }

    // Store or update account information
    await db.prepare(`
      INSERT OR REPLACE INTO accounts (
        id, user_id, type, provider, provider_account_id,
        access_token, token_type, scope
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `discord_${user.id}`,
      user.id,
      'oauth',
      'discord',
      discordUser.id,
      accessToken,
      'Bearer',
      'identify email guilds'
    ).run();

    return new Response(JSON.stringify({
      message: 'Discord authentication successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        discordId: user.discord_id,
        isVerified: Boolean(user.is_verified),
        verificationLevel: user.verification_level,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Discord auth error:', error);
    return new Response(JSON.stringify({
      error: 'Discord authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Database setup
async function handleSetup(env: any, corsHeaders: any): Promise<Response> {
  try {
    const db = env.DB;
    
    // Check if tables exist and have Discord support
    try {
      await db.prepare('SELECT discord_id FROM users LIMIT 1').run();
      return new Response(JSON.stringify({
        message: 'Database tables already exist with Discord support',
        status: 'ready'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      // Either tables don't exist or don't have Discord fields
      console.log('Creating/updating database tables...');
      
      // Check if users table exists at all
      let tableExists = false;
      try {
        await db.prepare('SELECT 1 FROM users LIMIT 1').run();
        tableExists = true;
        console.log('Users table exists, adding Discord fields...');
        
        // Add missing Discord columns
        try {
          await db.prepare('ALTER TABLE users ADD COLUMN avatar_url TEXT').run();
        } catch (e) { console.log('avatar_url column may already exist'); }
        
        try {
          await db.prepare('ALTER TABLE users ADD COLUMN bio TEXT').run();
        } catch (e) { console.log('bio column may already exist'); }
        
        try {
          await db.prepare('ALTER TABLE users ADD COLUMN discord_id TEXT UNIQUE').run();
        } catch (e) { console.log('discord_id column may already exist'); }
        
        return new Response(JSON.stringify({
          message: 'Database tables updated with Discord support',
          status: 'updated'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch {
        // Tables don't exist, create them completely
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
          bio TEXT,
          discord_id TEXT UNIQUE,
          cultural_background TEXT,
          is_verified INTEGER DEFAULT 0,
          verification_level INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `).run();
      
      // Create sessions table
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires INTEGER NOT NULL,
          session_token TEXT NOT NULL UNIQUE
        )
      `).run();
      
      // Create indexes
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)').run();
      
      return new Response(JSON.stringify({
        message: 'Database tables created successfully',
        status: 'created'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      }
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

// User signup
async function handleSignup(request: Request, env: any, corsHeaders: any): Promise<Response> {
  try {
    const body: SignupRequest = await request.json();
    const { firstName, lastName, username, email, password } = body;

    // Validate input
    if (!firstName || !lastName || !username || !email || !password) {
      return new Response(JSON.stringify({
        error: 'All fields are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({
        error: 'Password must be at least 8 characters long'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    
    // Check if user already exists
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email, username).first();

    if (existingUser) {
      return new Response(JSON.stringify({
        error: 'User with this email or username already exists'
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Hash password (in production, use proper hashing)
    const hashedPassword = btoa(password); // Simple encoding for demo
    
    // Create user
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO users (id, email, username, full_name, password, is_verified, verification_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId, email, username, `${firstName} ${lastName}`, 
      hashedPassword, 0, 1, now, now
    ).run();

    return new Response(JSON.stringify({
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        username,
        fullName: `${firstName} ${lastName}`,
        isVerified: false,
        verificationLevel: 1,
        createdAt: now,
        updatedAt: now
      }
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Authentication test
async function handleAuthTest(request: Request, env: any, corsHeaders: any): Promise<Response> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    
    // In a real implementation, you'd verify the JWT token
    // For now, just return success
    return new Response(JSON.stringify({
      message: 'Authentication successful',
      user: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        username: 'demo',
        isVerified: true
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return new Response(JSON.stringify({
      error: 'Authentication test failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
