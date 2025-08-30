import { NextResponse } from 'next/server';
import { createDB } from '@/lib/db';

export async function GET() {
  try {
    // Check if we're in a Cloudflare Workers environment
    if (typeof globalThis.DB !== 'undefined') {
      const db = createDB(globalThis.DB);
      
      // Create the necessary tables for NextAuth
      await db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL UNIQUE,
          full_name TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
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

      await db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires INTEGER NOT NULL,
          session_token TEXT NOT NULL UNIQUE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

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
      await db.run(`CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_accounts_provider_account_id ON accounts(provider_account_id)`);

      return NextResponse.json({ 
        message: 'Database tables created successfully',
        tables: ['users', 'sessions', 'accounts', 'verification_tokens']
      });
    } else {
      // We're in a local development environment
      return NextResponse.json({ 
        message: 'Running in local development mode. Database setup not needed.',
        environment: 'local'
      });
    }
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
