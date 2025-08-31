import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createDB } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function getProfileHandler(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const db = createDB(globalThis.DB);
    const [user] = await db.select().from(users).where(eq(users.id, request.user.id)).limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't return sensitive information
    const { password: _unused, ...userProfile } = user;

    return NextResponse.json({
      user: userProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

async function updateProfileHandler(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, bio, culturalBackground, avatarUrl } = body;

    // Validate input
    if (fullName && typeof fullName !== 'string') {
      return NextResponse.json(
        { error: 'Full name must be a string' },
        { status: 400 }
      );
    }

    if (bio && typeof bio !== 'string') {
      return NextResponse.json(
        { error: 'Bio must be a string' },
        { status: 400 }
      );
    }

    if (culturalBackground && typeof culturalBackground !== 'string') {
      return NextResponse.json(
        { error: 'Cultural background must be a string' },
        { status: 400 }
      );
    }

    if (avatarUrl && typeof avatarUrl !== 'string') {
      return NextResponse.json(
        { error: 'Avatar URL must be a string' },
        { status: 400 }
      );
    }

    const db = createDB(globalThis.DB);
    
    // Update user profile
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (fullName) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (culturalBackground !== undefined) updateData.culturalBackground = culturalBackground;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, request.user.id));

    // Get updated user
    const [updatedUser] = await db.select().from(users).where(eq(users.id, request.user.id)).limit(1);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    const { password: _unused, ...userProfile } = updatedUser;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getProfileHandler);
export const PUT = withAuth(updateProfileHandler);
