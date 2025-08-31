import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

async function testAuthHandler(request: AuthenticatedRequest) {
  try {
    return NextResponse.json({
      message: 'Authentication successful',
      user: request.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Authentication test failed' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(testAuthHandler);
