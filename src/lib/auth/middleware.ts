import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createDB } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    isVerified: boolean;
    culturalBackground?: string;
  };
}

export async function authenticateRequest(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    requireVerification?: boolean;
  } = {}
): Promise<{ request: AuthenticatedRequest; response?: NextResponse }> {
  const { requireAuth = true, requireVerification = false } = options;

  try {
    // Get the JWT token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET 
    });

    if (!token && requireAuth) {
      return {
        request: request as AuthenticatedRequest,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    if (token && requireAuth) {
      // Verify user exists in database
      const db = createDB(globalThis.DB);
      const [user] = await db.select().from(users).where(eq(users.id, token.sub as string)).limit(1);

      if (!user) {
        return {
          request: request as AuthenticatedRequest,
          response: NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        };
      }

      if (requireVerification && !user.isVerified) {
        return {
          request: request as AuthenticatedRequest,
          response: NextResponse.json(
            { error: 'Account verification required' },
            { status: 403 }
          )
        };
      }

      // Attach user to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        isVerified: user.isVerified,
        culturalBackground: user.culturalBackground || undefined,
      };

      return { request: authenticatedRequest };
    }

    return { request: request as AuthenticatedRequest };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      request: request as AuthenticatedRequest,
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    };
  }
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options: { requireVerification?: boolean } = {}
) {
  return async (request: NextRequest) => {
    const { request: authenticatedRequest, response } = await authenticateRequest(request, {
      requireAuth: true,
      requireVerification: options.requireVerification,
    });

    if (response) {
      return response;
    }

    return handler(authenticatedRequest);
  };
}

export function withOptionalAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { request: authenticatedRequest } = await authenticateRequest(request, {
      requireAuth: false,
    });

    return handler(authenticatedRequest);
  };
}
