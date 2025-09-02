# 🔍 Etherith Troubleshooting Guide

## Authentication Issues

### Problem: Discord Sign-in Not Working

**Symptoms:**
- Clicking Discord sign-in button does nothing
- No authentication logs in `wrangler tail`
- User not created in D1 database

**Debugging Steps:**

1. **Check Environment Variables**
   ```bash
   # Visit /debug page to see environment status
   # Or check your .env file
   cat .env
   ```

2. **Verify Discord OAuth Configuration**
   - Ensure `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are set
   - Check Discord Developer Portal for correct redirect URLs
   - Verify OAuth2 scopes include: `identify email guilds`

3. **Check NextAuth Configuration**
   - Visit `/api/debug` to see NextAuth status
   - Ensure `NEXTAUTH_URL` matches your deployment URL
   - Verify `NEXTAUTH_SECRET` is set

4. **Test D1 Database Connection**
   ```bash
   # Run the D1 test script
   node scripts/test-d1.js
   
   # Or use the debug API
   curl https://your-worker.workers.dev/api/debug
   ```

### Problem: User Not Appearing in D1 Database

**Symptoms:**
- Authentication appears successful
- No user records in `users` table
- Session not persisting

**Debugging Steps:**

1. **Check D1 Database Tables**
   ```sql
   -- Run this in your D1 database
   SELECT name FROM sqlite_master WHERE type="table";
   ```

2. **Verify Required Tables Exist**
   - `users` - User accounts
   - `sessions` - NextAuth sessions
   - `accounts` - OAuth provider accounts
   - `verification_tokens` - Email verification

3. **Check Table Schemas**
   ```sql
   -- Check users table structure
   PRAGMA table_info(users);
   
   -- Check sessions table structure
   PRAGMA table_info(sessions);
   ```

4. **Test D1 Adapter**
   ```bash
   # Check if D1 adapter is working
   wrangler d1 execute etherith-db --command "SELECT COUNT(*) FROM users"
   ```

## D1 Database Issues

### Problem: D1 Database Not Accessible

**Symptoms:**
- `globalThis.DB` is undefined
- Database queries fail
- "D1 Database Not Available" error

**Debugging Steps:**

1. **Check Wrangler Configuration**
   ```toml
   # wrangler.toml should have:
   [[d1_databases]]
   binding = "DB"
   database_name = "etherith-db"
   database_id = "your-database-id"
   ```

2. **Verify Database ID**
   ```bash
   # List your D1 databases
   wrangler d1 list
   
   # Check database details
   wrangler d1 info etherith-db
   ```

3. **Test Database Connection**
   ```bash
   # Test basic connectivity
   wrangler d1 execute etherith-db --command "SELECT 1"
   
   # List tables
   wrangler d1 execute etherith-db --command "SELECT name FROM sqlite_master WHERE type='table'"
   ```

4. **Check Database Schema**
   ```bash
   # Run the schema migration
   wrangler d1 execute etherith-db --file=./schema.sql
   ```

### Problem: Database Schema Mismatch

**Symptoms:**
- Tables missing or have wrong structure
- Column type errors
- Foreign key constraint failures

**Debugging Steps:**

1. **Compare Current vs Expected Schema**
   ```bash
   # Export current schema
   wrangler d1 execute etherith-db --command ".schema" > current_schema.sql
   
   # Compare with expected schema in src/lib/db/schema.ts
   ```

2. **Recreate Database Schema**
   ```bash
   # Drop and recreate tables
   wrangler d1 execute etherith-db --file=./scripts/recreate_schema.sql
   ```

3. **Check Drizzle Schema**
   ```typescript
   // Verify schema matches in src/lib/db/schema.ts
   import { users, sessions, accounts } from '@/lib/db/schema'
   ```

## Environment Issues

### Problem: Environment Variables Not Loading

**Symptoms:**
- `process.env` values are undefined
- Configuration errors in logs
- Authentication providers not working

**Debugging Steps:**

1. **Check Environment File**
   ```bash
   # Ensure .env file exists and has correct values
   ls -la .env*
   cat .env
   ```

2. **Verify Cloudflare Environment Variables**
   ```bash
   # Check if variables are set in Cloudflare
   wrangler secret list
   ```

3. **Test Environment Loading**
   ```bash
   # Check environment in your worker
   curl https://your-worker.workers.dev/api/debug
   ```

4. **Check Next.js Environment Loading**
   ```typescript
   // In your code, log environment variables
   console.log('Environment:', {
     NODE_ENV: process.env.NODE_ENV,
     NEXTAUTH_URL: process.env.NEXTAUTH_URL,
     DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? 'SET' : 'NOT SET'
   });
   ```

## Development vs Production Issues

### Problem: Different Behavior in Different Environments

**Symptoms:**
- Works locally but not in production
- D1 database available in one environment but not another
- Authentication works differently

**Debugging Steps:**

1. **Check Environment Detection**
   ```typescript
   // Log environment information
   console.log('Environment:', {
     isCloudflareWorkers: typeof globalThis.DB !== 'undefined',
     nodeEnv: process.env.NODE_ENV,
     hasDB: !!globalThis.DB
   });
   ```

2. **Verify Wrangler Environment Configuration**
   ```toml
   # wrangler.toml should have environment-specific configs
   [env.production]
   name = "etherith-production"
   vars = { NODE_ENV = "production" }
   
   [[env.production.d1_databases]]
   binding = "DB"
   database_name = "etherith-db"
   database_id = "your-database-id"
   ```

3. **Test Both Environments**
   ```bash
   # Test local development
   npm run dev
   
   # Test production
   wrangler dev
   wrangler tail etherith
   ```

## Common Solutions

### Fix 1: Reset D1 Database
```bash
# Drop and recreate database
wrangler d1 delete etherith-db
wrangler d1 create etherith-db
wrangler d1 execute etherith-db --file=./schema.sql
```

### Fix 2: Update Environment Variables
```bash
# Set secrets in Cloudflare
wrangler secret put DISCORD_CLIENT_ID
wrangler secret put DISCORD_CLIENT_SECRET
wrangler secret put NEXTAUTH_SECRET
```

### Fix 3: Verify OAuth Configuration
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Check your application's OAuth2 settings
3. Ensure redirect URI matches your domain
4. Verify required scopes are enabled

### Fix 4: Check NextAuth Configuration
```typescript
// Ensure proper adapter configuration
export const authConfig: NextAuthOptions = {
  adapter: typeof globalThis.DB !== 'undefined' ? D1Adapter(globalThis.DB) : undefined,
  // ... rest of config
}
```

## Debug Tools

### 1. Debug Page
Visit `/debug` in your application to see comprehensive debugging information.

### 2. Debug API
```bash
# Get debug information
curl https://your-worker.workers.dev/api/debug

# Test D1 queries
curl -X POST https://your-worker.workers.dev/api/debug \
  -H "Content-Type: application/json" \
  -d '{"action":"test-d1-query","query":"SELECT * FROM users LIMIT 5"}'
```

### 3. Wrangler Commands
```bash
# View logs
wrangler tail etherith

# Test D1 database
wrangler d1 execute etherith-db --command "SELECT * FROM users"

# Check worker status
wrangler whoami
wrangler workers list
```

### 4. Browser Developer Tools
- Check Network tab for failed requests
- Check Console for JavaScript errors
- Check Application tab for cookies and storage

## Getting Help

If you're still experiencing issues:

1. **Check the debug page** at `/debug` for detailed information
2. **Run the D1 test script** with `node scripts/test-d1.js`
3. **Check wrangler logs** with `wrangler tail etherith`
4. **Verify your configuration** matches the examples above
5. **Check Cloudflare Workers documentation** for D1 and authentication

## Quick Health Check

Run this command to quickly check your setup:
```bash
# Check environment
echo "NODE_ENV: $NODE_ENV"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID:+SET}"

# Check D1 database
wrangler d1 execute etherith-db --command "SELECT COUNT(*) FROM users" 2>/dev/null || echo "D1 not accessible"

# Check worker status
wrangler whoami
```
