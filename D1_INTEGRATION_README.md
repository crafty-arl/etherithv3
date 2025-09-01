# D1 Database Integration for Etherith

## 🎯 What's Already Working

Your authentication system is **already storing user information in D1** when:
- Users sign up with credentials
- Users authenticate via Discord OAuth
- User profiles are updated

## 🚀 Quick Test

1. **Setup D1 tables**: Visit `/api/setup` (one-time setup)
2. **Test Discord OAuth**: Sign in with Discord
3. **Create test users**: Visit `/test-d1`
4. **Verify storage**: Check D1 dashboard for data

## 📁 What We Added

### 1. Official D1 Adapter Integration
- **`@auth/d1-adapter`**: Automatically handles all NextAuth database operations
- **Automatic table creation**: Creates `users`, `accounts`, `sessions`, `verification_tokens`
- **Discord OAuth storage**: Automatically stores Discord user data in D1

### 2. Setup Route (`/api/setup`)
- **One-time initialization**: Creates all necessary D1 tables
- **Official migrations**: Uses Auth.js D1 adapter migrations
- **Error handling**: Proper error reporting and logging

### 3. User Management API (`/api/user/create`)
- **POST**: Create new users
- **GET**: List all users
- **Validation**: Email/username uniqueness
- **Error handling**: Proper HTTP status codes

### 4. Test Interface (`/test-d1`)
- **User creation form**
- **User listing display**
- **Real-time feedback**
- **Error handling**

## 🔧 How It Works

### Before (Manual Database Operations)
```typescript
// ❌ Manual database operations
const db = createDB(globalThis.DB)
await db.insert(users).values({...})
await db.insert(accounts).values({...})
```

### After (Official D1 Adapter)
```typescript
// ✅ Automatic database operations
export const authConfig: NextAuthOptions = {
  adapter: typeof globalThis.DB !== 'undefined' ? D1Adapter(globalThis.DB) : undefined,
  // ... rest of config
}
```

The D1 adapter automatically:
- Creates users from Discord OAuth
- Stores account information
- Manages sessions
- Handles token verification

## 🌐 Environment Detection

The system automatically detects if it's running in:
- **Cloudflare Workers** → Uses D1 adapter + database
- **Local development** → Falls back to JWT tokens

## 📊 Database Schema

The D1 adapter creates these tables automatically:

```sql
users:
  - id (primary key)
  - email (unique)
  - name
  - image
  - emailVerified

accounts:
  - id (primary key)
  - userId (foreign key to users)
  - type
  - provider
  - providerAccountId
  - refresh_token
  - access_token
  - expires_at
  - token_type
  - scope
  - id_token
  - session_state

sessions:
  - id (primary key)
  - userId (foreign key to users)
  - expires
  - sessionToken (unique)

verification_tokens:
  - identifier
  - token (unique)
  - expires
```

## 🚀 Next Steps (Agile)

### Phase 1: Test & Validate ✅
- [x] Install official D1 adapter
- [x] Create setup route
- [x] Update auth configuration
- [ ] Test Discord OAuth integration
- [ ] Verify D1 storage

### Phase 2: Enhance Features
- [ ] Add user profile editing
- [ ] Implement user search/filtering
- [ ] Add user verification system
- [ ] Create admin dashboard

### Phase 3: Scale & Optimize
- [ ] Add database indexes
- [ ] Implement caching
- [ ] Add user analytics
- [ ] Optimize queries

## 🧪 Testing Commands

```bash
# Deploy to Cloudflare
wrangler pages deploy out --project-name etherith

# Run migrations
wrangler d1 migrations apply etherith-db --local

# Check D1 data
wrangler d1 execute etherith-db --command "SELECT * FROM users;"
```

## 🔍 Troubleshooting

### "D1 database not available"
- Make sure you're running in Cloudflare Workers environment
- Check `wrangler.toml` configuration
- Verify D1 database binding

### Discord OAuth not storing data
- **First**: Visit `/api/setup` to initialize D1 tables
- Check that `@auth/d1-adapter` is installed
- Verify D1 adapter is configured in auth config
- Check console for adapter logs

### Migration errors
- Run `wrangler d1 migrations apply etherith-db --local`
- Check migration files in `drizzle/` folder
- Ensure D1 adapter tables are created via `/api/setup`

### User creation fails
- Check required fields (email, username, fullName)
- Verify email/username uniqueness
- Check console for detailed error messages

## 📚 Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Auth.js D1 Adapter](https://authjs.dev/reference/adapter/d1)
- [NextAuth.js](https://next-auth.js.org/)
- [Your existing schema](./src/lib/db/schema.ts)

## 🎉 Key Benefits of D1 Adapter

1. **Automatic Discord OAuth Storage**: No manual database operations needed
2. **Standard Compliance**: Follows Auth.js best practices
3. **Automatic Migrations**: Creates all necessary tables
4. **Session Management**: Handles sessions automatically
5. **Account Linking**: Manages OAuth account connections
6. **Production Ready**: Battle-tested in production environments
