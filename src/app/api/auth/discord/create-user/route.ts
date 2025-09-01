import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account, profile } = body

    if (!account || account.provider !== 'discord' || !profile) {
      return NextResponse.json(
        { error: 'Invalid Discord authentication data' },
        { status: 400 }
      )
    }

    // In local development, just return success
    // In production, this would create/update the user in the database
    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email || `${profile.username}@discord.local`,
        name: profile.global_name || profile.username,
        image: profile.avatar 
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : null,
        username: profile.username,
        discordId: profile.id
      }
    })

  } catch (error) {
    console.error('Discord user creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create/update Discord user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}