import { NextRequest, NextResponse } from 'next/server';
import { createDB } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, username, email, password } = body as {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password: string;
    };

    // Validate input
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const db = createDB(globalThis.DB);
    const existingUser = await db.select().from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existingUser.length > 0) {
      if (existingUser[0].email === email) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      if (existingUser[0].username === username) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      username,
      fullName: `${firstName} ${lastName}`,
      password: hashedPassword,
      isVerified: false,
      verificationLevel: 1,
    }).returning();

    // Return success (don't return password)
    const { password: _unused, ...userWithoutPassword } = newUser[0];
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
