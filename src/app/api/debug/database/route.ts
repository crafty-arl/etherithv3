import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API - Checking database status...')
    console.log('🗄️ D1 Database available:', typeof globalThis.DB !== 'undefined')
    
    if (typeof globalThis.DB === 'undefined') {
      return NextResponse.json({
        success: false,
        message: 'D1 Database not available',
        environment: 'local',
        hasDB: false
      })
    }

    const db = createDB(globalThis.DB)
    console.log('📊 Database connection established')
    
    // Query all users (limit to first 10 for safety)
    const allUsers = await db.select().from((await import('@/lib/db/schema')).users).limit(10)
    console.log('👥 Users found:', allUsers.length)
    
    // Query all accounts (limit to first 10 for safety)  
    const allAccounts = await db.select().from((await import('@/lib/db/schema')).accounts).limit(10)
    console.log('🔗 Accounts found:', allAccounts.length)
    
    // Get table info using raw queries
    const userTableInfo = await globalThis.DB.prepare("PRAGMA table_info(users)").all()
    const accountTableInfo = await globalThis.DB.prepare("PRAGMA table_info(accounts)").all()
    
    return NextResponse.json({
      success: true,
      message: 'Database debug info retrieved',
      data: {
        environment: 'cloudflare',
        hasDB: true,
        users: {
          count: allUsers.length,
          data: allUsers.map(user => ({
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            discordId: user.discordId,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }))
        },
        accounts: {
          count: allAccounts.length,
          data: allAccounts.map(account => ({
            id: account.id,
            userId: account.userId,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type
          }))
        },
        schema: {
          userTable: userTableInfo,
          accountTable: accountTableInfo
        }
      }
    })
  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database query failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      hasDB: typeof globalThis.DB !== 'undefined'
    }, { status: 500 })
  }
}