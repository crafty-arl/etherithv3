/**
 * Etherith Main Worker
 * Simplified version with health check, debug, and authentication endpoints
 */

interface SignupData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface DiscordStoreData {
  discordId: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  verified: boolean;
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    try {
      console.log('🚀 Worker request received:', {
        url: request.url,
        method: request.method,
        hasDB: !!env.DB
      });

      const url = new URL(request.url);
      const path = url.pathname;

      // Health check endpoint
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          d1Available: !!env.DB,
          environment: 'production'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Debug endpoint
      if (path === '/api/debug') {
        const debugInfo: {
          timestamp: string;
          environment: string;
          isCloudflareWorkers: boolean;
          d1DatabaseAvailable: boolean;
          d1Status: string;
          d1Tables: any;
          d1Error: string | null;
          userCount: any;
        } = {
          timestamp: new Date().toISOString(),
          environment: 'production',
          isCloudflareWorkers: true,
          d1DatabaseAvailable: !!env.DB,
          d1Status: 'Not Available',
          d1Tables: null,
          d1Error: null,
          userCount: null
        };

        if (env.DB) {
          try {
            debugInfo.d1Status = 'Available';
            
            // Test D1 connection
            const result = await env.DB.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
            debugInfo.d1Tables = result.results;
            
            // Test user count
            const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
            debugInfo.userCount = userCount;
            
          } catch (error) {
            debugInfo.d1Error = error instanceof Error ? error.message : 'Unknown error';
            debugInfo.d1Status = 'Error';
          }
        }

        return new Response(JSON.stringify({
          success: true,
          debugInfo
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Authentication endpoints
      if (path === '/api/auth/signup' && request.method === 'POST') {
        return await handleSignup(request, env);
      }

      if (path === '/api/auth/login' && request.method === 'POST') {
        return await handleLogin(request, env);
      }

      // Discord OAuth data storage endpoint
      if (path === '/api/auth/discord/store' && request.method === 'POST') {
        return await handleDiscordStore(request, env);
      }

      // Default response
      return new Response('Etherith Worker is running', {
        headers: { 'Content-Type': 'text/plain' }
      });

    } catch (error) {
      console.error('❌ Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// Handle user signup
async function handleSignup(request: Request, env: any): Promise<Response> {
  try {
    const body = await request.json() as SignupData;
    const { firstName, lastName, username, email, password } = body;

    // Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All fields are required'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Password must be at least 8 characters long'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user already exists
    const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ? OR username = ?').bind(email, username).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User with this email or username already exists'
      }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create user (in production, you'd hash the password)
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO users (id, email, username, full_name, password, is_verified, verification_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      email,
      username,
      `${firstName} ${lastName}`,
      password, // In production, hash this
      0, // is_verified
      1, // verification_level
      now,
      now
    ).run();

    return new Response(JSON.stringify({
      success: true,
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
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle user login
async function handleLogin(request: Request, env: any): Promise<Response> {
  try {
    const body = await request.json() as LoginData;
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email and password are required'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find user
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid credentials'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // In production, verify password hash
    if (user.password !== password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid credentials'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle Discord OAuth data storage
async function handleDiscordStore(request: Request, env: any): Promise<Response> {
  try {
    const body = await request.json() as DiscordStoreData;
    const { discordId, email, username, fullName, avatar, verified } = body;

    // Validation
    if (!discordId || !email || !username || !fullName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required Discord data'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user already exists by Discord ID or email
    const existingUser = await env.DB.prepare('SELECT * FROM users WHERE discord_id = ? OR email = ?').bind(discordId, email).first();
    
    let userId: string;
    const now = new Date().toISOString();

    if (existingUser) {
      // Update existing user with Discord info
      userId = existingUser.id;
      await env.DB.prepare(`
        UPDATE users SET 
          discord_id = ?,
          username = ?,
          full_name = ?,
          avatar_url = ?,
          is_verified = ?,
          updated_at = ?
        WHERE id = ?
      `).bind(
        discordId,
        username,
        fullName,
        avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : null,
        verified ? 1 : 0,
        now,
        userId
      ).run();
    } else {
      // Create new user with Discord data
      userId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO users (id, email, username, full_name, avatar_url, discord_id, is_verified, verification_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        email,
        username,
        fullName,
        avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : null,
        discordId,
        verified ? 1 : 0,
        1, // verification_level
        now,
        now
      ).run();
    }

    console.log('✅ Discord user data stored in D1:', { userId, discordId, email, username });

    return new Response(JSON.stringify({
      success: true,
      message: 'Discord user data stored successfully',
      userId: userId
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Discord store error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

