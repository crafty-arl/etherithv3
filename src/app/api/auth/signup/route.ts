import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createDB } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    type SignupBody = {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password: string;
    };

    const { firstName, lastName, username, email, password } = (await request.json()) as Partial<SignupBody>;

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const db = createDB(globalThis.DB);
    
    const existingUserByEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUserByEmail.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const existingUserByUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUserByUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      username,
      fullName: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
      password: hashedPassword,
      isVerified: false,
      // createdAt/updatedAt default via DB
    }).returning();

    // Return success (don't return the password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = newUser[0];
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
