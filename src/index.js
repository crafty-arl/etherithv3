/**
 * Cloudflare Workers entry point for Etherith
 * This file handles the main worker logic and D1 database access
 */

export default {
  async fetch(request, env, ctx) {
    try {
      console.log('🚀 Worker request received:', {
        url: request.url,
        method: request.method,
        hasDB: !!env.DB,
        environment: 'production' // Hardcode since process.env isn't available
      });

      // Check if D1 database is available
      if (!env.DB) {
        console.error('❌ D1 database not available in environment');
        return new Response('D1 database not available', { status: 500 });
      }

      // Test D1 database connection
      try {
        const testResult = await env.DB.prepare('SELECT 1 as test').first();
        console.log('✅ D1 database connection test successful:', testResult);
      } catch (error) {
        console.error('❌ D1 database connection test failed:', error);
        return new Response('D1 database connection failed', { status: 500 });
      }

      // Handle different routes
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === '/api/debug') {
        // Handle debug API
        return handleDebugAPI(request, env);
      } else if (path.startsWith('/api/auth/')) {
        // Handle NextAuth API routes
        return handleNextAuth(request, env);
      } else if (path === '/health') {
        // Health check endpoint
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          d1Available: !!env.DB,
          environment: 'production'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Default response for other routes
        return new Response('Etherith Worker is running', {
          headers: { 'Content-Type': 'text/plain' }
        });
      }

    } catch (error) {
      console.error('❌ Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

/**
 * Handle debug API requests
 */
async function handleDebugAPI(request, env) {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: 'production', // Hardcode since process.env isn't available
      nextAuthUrl: 'https://dd739b1b-etherith-production.carl-6e7.workers.dev',
      discordClientId: 'SET', // Hardcode since we can't access env vars
      discordClientSecret: 'SET',
      nextAuthSecret: 'SET',
      
      // Check if we're in a Cloudflare Workers environment
      isCloudflareWorkers: true,
      d1DatabaseAvailable: !!env.DB,
      
      // User agent and request info
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      referer: request.headers.get('referer'),
      
      // Check D1 database if available
      d1Status: 'Not Available',
      d1Tables: null,
      d1Error: null
    };

    // Try to access D1 database
    if (env.DB) {
      try {
        debugInfo.d1Status = 'Available';
        
        // Try to list tables
        const result = await env.DB.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
        debugInfo.d1Tables = result.results;
        
        // Try to count users
        const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        debugInfo.userCount = userCount;
        
        // Try to count sessions
        const sessionCount = await env.DB.prepare('SELECT COUNT(*) as count FROM sessions').first();
        debugInfo.sessionCount = sessionCount;
        
        // Try to count accounts
        const accountCount = await env.DB.prepare('SELECT COUNT(*) as count FROM accounts').first();
        debugInfo.accountCount = accountCount;
        
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

  } catch (error) {
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

/**
 * Handle NextAuth API requests
 */
async function handleNextAuth(request, env) {
  try {
    // For now, return a simple response
    // In a full implementation, you would integrate with NextAuth here
    return new Response(JSON.stringify({
      message: 'NextAuth endpoint accessed',
      hasDB: !!env.DB,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'NextAuth handler error',
      message: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}