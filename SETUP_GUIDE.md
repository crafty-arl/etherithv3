# 🚀 Etherith D1 Database Setup Guide

Based on Cloudflare's official documentation, this guide will help you properly configure your D1 database and resolve connection issues.

## 🔍 **Key Issues Identified from Cloudflare Documentation:**

1. **Binding Access Pattern**: D1 databases should be accessed via `env.DB`, not `globalThis.DB`
2. **Environment Configuration**: Proper environment-specific configurations are required
3. **Database Schema**: Database tables must be created before use

## 📋 **Step-by-Step Setup**

### **Step 1: Verify Your D1 Database**

First, check if your D1 database exists and get its details:

```bash
# List all D1 databases
wrangler d1 list

# Get specific database info
wrangler d1 info etherith-db
```

### **Step 2: Test D1 Database Connection**

Test basic connectivity to your D1 database:

```bash
# Test basic connection
wrangler d1 execute etherith-db --command "SELECT 1"

# List existing tables
wrangler d1 execute etherith-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### **Step 3: Create Database Schema**

If no tables exist, create them using the provided schema:

```bash
# Apply the schema file
wrangler d1 execute etherith-db --file=./schema.sql

# Verify tables were created
wrangler d1 execute etherith-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### **Step 4: Verify Wrangler Configuration**

Ensure your `wrangler.toml` has the correct configuration:

```toml
name = "etherith"
main = "src/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# D1 Database - Cloudflare's native SQLite database
[[d1_databases]]
binding = "DB"
database_name = "etherith-db"
database_id = "042a5e9c-d027-42e9-aeab-cf5302a77af7"

# Environment-specific configurations
[env.preview]
name = "etherith-preview"
vars = { NODE_ENV = "development" }

[[env.preview.d1_databases]]
binding = "DB"
database_name = "etherith-db"
database_id = "042a5e9c-d027-42e9-aeab-cf5302a77af7"

[env.production]  
name = "etherith-production"
vars = { NODE_ENV = "production" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "etherith-db"
database_id = "042a5e9c-d027-42e9-aeab-cf5302a77af7"
```

### **Step 5: Test Your Worker**

Test your worker with the D1 database:

```bash
# Start local development
wrangler dev

# In another terminal, test the health endpoint
curl http://localhost:8787/health

# Test the debug endpoint
curl http://localhost:8787/api/debug
```

### **Step 6: Monitor Logs**

Watch the worker logs for any errors:

```bash
# In a new terminal, monitor logs
wrangler tail etherith
```

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: "D1 database not available"**

**Symptoms:**
- `env.DB` is undefined
- Database queries fail

**Solutions:**
1. **Check binding name**: Ensure your binding is named `DB` in `wrangler.toml`
2. **Verify database ID**: Confirm the database ID matches your actual D1 database
3. **Check environment**: Ensure you're running in the correct environment

```bash
# Verify database exists
wrangler d1 list

# Check binding configuration
wrangler d1 info etherith-db
```

### **Issue 2: "Table doesn't exist"**

**Symptoms:**
- SQL errors about missing tables
- Database queries fail

**Solutions:**
1. **Create tables**: Run the schema file
2. **Verify schema**: Check table structure

```bash
# Create tables
wrangler d1 execute etherith-db --file=./schema.sql

# Verify tables exist
wrangler d1 execute etherith-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### **Issue 3: "Binding not found"**

**Symptoms:**
- Worker can't access `env.DB`
- Environment variables not loading

**Solutions:**
1. **Check wrangler.toml**: Ensure D1 configuration is correct
2. **Restart worker**: Stop and restart `wrangler dev`
3. **Verify deployment**: Ensure configuration is deployed

```bash
# Stop worker (Ctrl+C)
# Restart worker
wrangler dev

# Or deploy to production
wrangler deploy
```

## 🧪 **Testing Your Setup**

### **Test 1: Basic Connectivity**

```bash
# Test worker health
curl http://localhost:8787/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "d1Available": true,
  "environment": "development"
}
```

### **Test 2: D1 Database Access**

```bash
# Test debug endpoint
curl http://localhost:8787/api/debug

# Expected response should show:
# - d1DatabaseAvailable: true
# - d1Status: "Available"
# - d1Tables: [list of tables]
```

### **Test 3: Database Queries**

```bash
# Test D1 query endpoint
curl -X POST http://localhost:8787/api/debug \
  -H "Content-Type: application/json" \
  -d '{"action":"test-d1-query","query":"SELECT COUNT(*) as count FROM users"}'

# Expected response:
{
  "success": true,
  "result": [{"count": 0}],
  "meta": {...}
}
```

## 📊 **Expected Database Tables**

After running the schema, you should have these tables:

1. **`users`** - User accounts and profiles
2. **`sessions`** - NextAuth session management
3. **`accounts`** - OAuth provider connections
4. **`verification_tokens`** - Email verification

## 🔐 **Environment Variables**

Ensure these environment variables are set:

```bash
# Required for Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Required for NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:8787  # for local development
```

## 🚀 **Deployment**

### **Local Development**
```bash
wrangler dev
```

### **Production Deployment**
```bash
wrangler deploy
```

### **Preview Deployment**
```bash
wrangler deploy --env preview
```

## 📝 **Monitoring and Debugging**

### **View Worker Logs**
```bash
# Local development logs
wrangler dev

# Production logs
wrangler tail etherith

# Preview logs
wrangler tail etherith --env preview
```

### **Debug Endpoints**
- `/health` - Basic health check
- `/api/debug` - Comprehensive debugging information
- `/api/debug` (POST) - Test D1 queries

## 🆘 **Getting Help**

If you're still experiencing issues:

1. **Check the debug page** at `/debug` for detailed information
2. **Run the D1 test script** with `node scripts/test-d1.js`
3. **Check wrangler logs** with `wrangler tail etherith`
4. **Verify your configuration** matches the examples above
5. **Check Cloudflare Workers documentation** for D1 and authentication

## 🔗 **Useful Commands Reference**

```bash
# D1 Database Management
wrangler d1 list                    # List all D1 databases
wrangler d1 info <db-name>          # Get database details
wrangler d1 execute <db-name> --command "SELECT 1"  # Execute SQL command
wrangler d1 execute <db-name> --file=./schema.sql   # Execute SQL file

# Worker Management
wrangler dev                        # Start local development
wrangler deploy                     # Deploy to production
wrangler deploy --env preview       # Deploy to preview
wrangler tail <worker-name>         # Monitor logs
wrangler whoami                     # Check authentication

# Environment Management
wrangler secret put <name>          # Set secret
wrangler secret list                # List secrets
```

## ✅ **Success Checklist**

- [ ] D1 database exists and is accessible
- [ ] Database schema is applied (tables exist)
- [ ] Worker can access `env.DB`
- [ ] Health endpoint returns `d1Available: true`
- [ ] Debug endpoint shows database tables
- [ ] Database queries execute successfully
- [ ] Worker logs show successful D1 connections
- [ ] Environment variables are properly set
- [ ] Discord OAuth configuration is complete

Once all items are checked, your D1 database should be fully functional! 🎉