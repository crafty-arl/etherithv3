/**
 * Etherith Authentication Worker
 * Handles user authentication with D1 database
 */

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  password: string;
  culturalBackground?: string;
  isVerified: boolean;
  verificationLevel: number;
  createdAt: string;
  updatedAt: string;
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
      
      if (path === '/api/auth/test' && request.method === 'GET') {
        return await handleAuthTest(request, env, corsHeaders);
      }

      // Default response
      return new Response(JSON.stringify({
        message: 'Etherith Authentication Worker',
        endpoints: [
          'GET /api/setup - Initialize database',
          'POST /api/auth/signup - User registration',
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
