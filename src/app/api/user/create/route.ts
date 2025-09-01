import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/auth/user-service'

export async function POST(request: NextRequest) {
  try {
    // Check if we're in a Cloudflare Workers environment
    if (typeof globalThis.DB === 'undefined') {
      return NextResponse.json(
        { error: 'D1 database not available in this environment' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, username, fullName, password, discordId, bio } = body

    // Validate required fields
    if (!email || !username || !fullName) {
      return NextResponse.json(
        { error: 'Email, username, and fullName are required' },
        { status: 400 }
      )
    }

    // Create user service instance
    const userService = new UserService(globalThis.DB)

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const existingUsername = await userService.getUserByUsername(username)
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Create the user
    const newUser = await userService.createUser({
      email,
      username,
      fullName,
      password,
      discordId,
      bio
    })

    // Return user data (excluding password)
    const { password: _, ...userData } = newUser

    return NextResponse.json({
      message: 'User created successfully',
      user: userData
    }, { status: 201 })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (typeof globalThis.DB === 'undefined') {
      return NextResponse.json(
        { error: 'D1 database not available in this environment' },
        { status: 500 }
      )
    }

    const userService = new UserService(globalThis.DB)
    const users = await userService.searchUsers('', 50)

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        discordId: user.discordId,
        bio: user.bio,
        isVerified: user.isVerified,
        verificationLevel: user.verificationLevel,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    })

  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
