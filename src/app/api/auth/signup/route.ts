import { NextRequest, NextResponse } from 'next/server';
import { createDB } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, username, email, password } = body;

    // Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }

    // Get environment from request context
    const env = (request as any).env || (globalThis as any).env;

    if (!env?.DB) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const db = createDB(env.DB);

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    // Check if username is taken
    const existingUsername = await db.select().from(users).where(eq(users.username, username)).get();
    
    if (existingUsername) {
      return NextResponse.json({
        success: false,
        error: 'Username is already taken'
      }, { status: 409 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = crypto.randomUUID();
    const now = new Date();

    const newUser = await db.insert(users).values({
      id: userId,
      email,
      username,
      fullName: `${firstName} ${lastName}`,
      password: hashedPassword,
      isVerified: false,
      verificationLevel: 1,
      createdAt: now,
      updatedAt: now
    }).returning().get();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
