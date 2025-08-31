# Authentication Implementation for Etherith

This document describes the authentication system implementation for the Etherith platform, following the authentication integration plan.

## Overview

The authentication system has been implemented using NextAuth.js with Cloudflare Workers and D1 database integration. It provides secure, edge-compatible authentication with support for both credentials and Discord OAuth providers.

## Architecture

### Components

1. **NextAuth Configuration** (`src/lib/auth/config.ts`)
   - Discord OAuth provider
   - Credentials provider with password hashing
   - JWT-based sessions with 30-day expiration
   - Edge-compatible cookie settings

2. **Authentication Context** (`src/lib/auth/auth-context.tsx`)
   - React context for authentication state
   - Integration with NextAuth sessions
   - User profile management

3. **Authentication Middleware** (`src/lib/auth/middleware.ts`)
   - Route protection with `withAuth` and `withOptionalAuth`
   - User verification and database validation
   - Support for optional authentication

4. **Database Integration**
   - D1 database schema with proper relations
   - User management with cultural background support
   - Session and account storage for NextAuth

## Features

### Authentication Methods

- **Credentials**: Email/password with bcrypt hashing
- **Discord OAuth**: Social login with automatic user creation
- **JWT Sessions**: Secure, edge-compatible session management

### User Management

- User registration with validation
- Profile updates (name, bio, cultural background, avatar)
- Account verification system
- Cultural background tracking for enhanced AI analysis

### Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token signing with environment secrets
- HttpOnly cookies for session management
- CSRF protection
- Input validation and sanitization

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `GET /api/auth/test` - Authentication test (protected)
- `GET /api/setup` - Database initialization

### User Management

- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)

### AI Analysis

- `POST /api/ai/analyze-memory` - Memory analysis with user context

## Database Schema

### Users Table

```sql
CREATE TABLE users (
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
);
```

### NextAuth Tables

- `sessions` - User session storage
- `accounts` - OAuth provider accounts
- `verification_tokens` - Email verification

## Environment Variables

Required environment variables:

```bash
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

## Deployment

### Cloudflare Workers

1. **Database Setup**: Run `/api/setup` to initialize tables
2. **Environment Variables**: Set in Cloudflare dashboard
3. **D1 Binding**: Configure in `wrangler.toml`

### Local Development

1. Copy `.env.example` to `.env.local`
2. Set required environment variables
3. Run database migrations if needed

## Usage Examples

### Protecting Routes

```typescript
import { withAuth } from '@/lib/auth/middleware';

export const GET = withAuth(async (request) => {
  // Request.user is guaranteed to exist
  return NextResponse.json({ user: request.user });
});
```

### Optional Authentication

```typescript
import { withOptionalAuth } from '@/lib/auth/middleware';

export const GET = withOptionalAuth(async (request) => {
  // Request.user may or may not exist
  if (request.user) {
    // Handle authenticated user
  } else {
    // Handle anonymous user
  }
});
```

### Using Authentication Context

```typescript
import { useAuth } from '@/lib/auth/auth-context';

function MyComponent() {
  const { user, isLoading, login, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return user ? (
    <div>Welcome, {user.firstName}!</div>
  ) : (
    <button onClick={() => login('email', 'password')}>Login</button>
  );
}
```

## Testing

### Authentication Test

Visit `/api/auth/test` to verify authentication is working:

- **Unauthenticated**: Returns 401
- **Authenticated**: Returns user information

### Database Test

Visit `/api/setup` to verify database connectivity:

- **First visit**: Creates tables
- **Subsequent visits**: Confirms tables exist

## Security Considerations

1. **JWT Secrets**: Use strong, unique secrets for production
2. **Password Policy**: Enforce minimum 8 characters
3. **Rate Limiting**: Consider implementing for auth endpoints
4. **Session Management**: 30-day expiration with secure cookies
5. **Input Validation**: All user inputs are validated and sanitized

## Performance

- **Edge Compatibility**: All authentication works at Cloudflare edge
- **Database Queries**: Optimized with proper indexing
- **Session Caching**: JWT-based sessions reduce database calls
- **Response Time**: Target <100ms for authentication checks

## Monitoring

- **Authentication Events**: Logged for security monitoring
- **Database Performance**: Monitor D1 query performance
- **Error Tracking**: Comprehensive error logging
- **User Metrics**: Track authentication success rates

## Future Enhancements

1. **Multi-Factor Authentication**: SMS/email verification
2. **Advanced Roles**: Role-based access control
3. **Social Providers**: Additional OAuth providers
4. **Account Recovery**: Password reset workflows
5. **Advanced Security**: Device fingerprinting, risk scoring

## Troubleshooting

### Common Issues

1. **Database Connection**: Verify D1 binding in `wrangler.toml`
2. **Environment Variables**: Check all required variables are set
3. **CORS Issues**: Ensure proper domain configuration
4. **Session Persistence**: Verify cookie settings for production

### Debug Mode

Enable debug mode in development:

```typescript
debug: process.env.NODE_ENV === 'development'
```

## Support

For authentication-related issues:

1. Check the authentication logs
2. Verify environment variable configuration
3. Test database connectivity
4. Review Cloudflare Workers logs

## Conclusion

The authentication system provides a solid foundation for the Etherith platform with:

- Secure, edge-compatible authentication
- Comprehensive user management
- Cultural background integration
- Production-ready security features
- Easy-to-use developer APIs

The system is designed to scale with the platform and can be extended with additional features as needed.
