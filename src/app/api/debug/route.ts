import { NextRequest, NextResponse } from 'next/server';
import { createDB } from '@/lib/db';
import { users, sessions, accounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get environment from request context
    const env = (request as any).env || (globalThis as any).env;
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      discordClientId: process.env.DISCORD_CLIENT_ID ? 'SET' : 'NOT SET',
      discordClientSecret: process.env.DISCORD_CLIENT_SECRET ? 'SET' : 'NOT SET',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      
      // Check if we're in a Cloudflare Workers environment
      isCloudflareWorkers: typeof env?.DB !== 'undefined',
      d1DatabaseAvailable: typeof env?.DB !== 'undefined',
      
      // User agent and request info
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      referer: request.headers.get('referer'),
      
      // Check D1 database if available
      d1Status: 'Not Available',
      d1Tables: null,
      d1Error: null,
      userCount: null,
      sessionCount: null,
      accountCount: null
    };

    // Try to access D1 database if we're in Cloudflare Workers
    if (env?.DB) {
      try {
        debugInfo.d1Status = 'Available';
        
        // Create database connection
        const db = createDB(env.DB);
        
        // Try to list tables
        const result = await env.DB.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
        debugInfo.d1Tables = result.results;
        
        // Try to count users using Drizzle
        try {
          const userCount = await db.select().from(users).all();
          debugInfo.userCount = { count: userCount.length };
        } catch (error) {
          console.log('Failed to count users with Drizzle, trying raw SQL');
          const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
          debugInfo.userCount = userCount;
        }
        
        // Try to count sessions using Drizzle
        try {
          const sessionCount = await db.select().from(sessions).all();
          debugInfo.sessionCount = { count: sessionCount.length };
        } catch (error) {
          console.log('Failed to count sessions with Drizzle, trying raw SQL');
          const sessionCount = await env.DB.prepare('SELECT COUNT(*) as count FROM sessions').first();
          debugInfo.sessionCount = sessionCount;
        }
        
        // Try to count accounts using Drizzle
        try {
          const accountCount = await db.select().from(accounts).all();
          debugInfo.accountCount = { count: accountCount.length };
        } catch (error) {
          console.log('Failed to count accounts with Drizzle, trying raw SQL');
          const accountCount = await env.DB.prepare('SELECT COUNT(*) as count FROM accounts').first();
          debugInfo.accountCount = accountCount;
        }
        
      } catch (error) {
        debugInfo.d1Error = error instanceof Error ? error.message : 'Unknown error';
        debugInfo.d1Status = 'Error';
        console.error('D1 Database error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      debugInfo
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query } = body;

    // Get environment from request context
    const env = (request as any).env || (globalThis as any).env;

    if (action === 'test-d1-query' && query) {
      if (!env?.DB) {
        return NextResponse.json({
          success: false,
          error: 'D1 database not available in this environment'
        });
      }

      try {
        const result = await env.DB.prepare(query).all();
        return NextResponse.json({
          success: true,
          result: result.results,
          meta: result.meta
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action or missing query'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
