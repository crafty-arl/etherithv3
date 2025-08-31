import { NextResponse } from 'next/server';
import { createDB } from '@/lib/db';
import { users, sessions, accounts, verificationTokens } from '@/lib/db/schema';

export async function GET() {
  try {
    const db = createDB(globalThis.DB);
    
    // Check if tables exist by trying to query them
    try {
      await db.select().from(users).limit(1);
      await db.select().from(sessions).limit(1);
      await db.select().from(accounts).limit(1);
      await db.select().from(verificationTokens).limit(1);
      
      return NextResponse.json({
        message: 'Database tables already exist',
        status: 'ready'
      });
    } catch {
      // Tables don't exist, create them
      console.log('Creating database tables...');
      
      // Create tables using Drizzle's migration system
      // Note: In production, you should use proper migrations
      // This is a simplified setup for development
      
      // Create users table
      await db.run(`
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
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        )
      `);
      
      // Create sessions table
      await db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires INTEGER NOT NULL,
          session_token TEXT NOT NULL UNIQUE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // Create accounts table
      await db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          provider_account_id TEXT NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          session_state TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // Create verification_tokens table
      await db.run(`
        CREATE TABLE IF NOT EXISTS verification_tokens (
          id TEXT PRIMARY KEY,
          identifier TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires INTEGER NOT NULL
        )
      `);
      
      // Create indexes for better performance
      await db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier ON verification_tokens(identifier)`);
      
      return NextResponse.json({
        message: 'Database tables created successfully',
        status: 'created'
      });
    }
    
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to setup database', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
