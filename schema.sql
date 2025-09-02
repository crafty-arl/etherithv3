-- Etherith D1 Database Schema
-- This file matches the schema defined in src/lib/db/schema.ts

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password TEXT, -- For credentials provider
    avatar_url TEXT,
    bio TEXT,
    discord_id TEXT UNIQUE,
    cultural_background TEXT, -- JSON string
    is_verified INTEGER DEFAULT 0, -- Boolean as integer
    verification_level INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Sessions table for NextAuth
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires INTEGER NOT NULL, -- Unix timestamp
    session_token TEXT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Accounts table for OAuth providers
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
);

-- Verification tokens table for NextAuth
CREATE TABLE IF NOT EXISTS verification_tokens (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires INTEGER NOT NULL -- Unix timestamp
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider_provider_account_id ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier_token ON verification_tokens(identifier, token);

-- Insert a test user for development (optional)
-- INSERT INTO users (id, email, username, full_name, is_verified) 
-- VALUES ('test-user-1', 'test@example.com', 'testuser', 'Test User', 1);

