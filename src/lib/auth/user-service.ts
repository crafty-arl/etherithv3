import { eq } from 'drizzle-orm'
import { createDB } from '@/lib/db'
import { users, type User } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'

export interface UserProfile {
  id: string
  email: string
  username: string
  fullName: string
  avatarUrl?: string
  discordId?: string
  culturalBackground?: string[]
  bio?: string
  isVerified: boolean
  verificationLevel: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  email: string
  username: string
  fullName: string
  password?: string
  discordId?: string
  culturalBackground?: string[]
  bio?: string
}

export interface UpdateUserData {
  email?: string
  username?: string
  fullName?: string
  avatarUrl?: string
  bio?: string
  culturalBackground?: string[]
  isVerified?: boolean
  verificationLevel?: number
}

export class UserService {
  private db: ReturnType<typeof createDB>

  constructor(d1: D1Database) {
    this.db = createDB(d1)
  }

  async createUser(data: CreateUserData): Promise<UserProfile> {
    const [user] = await this.db.insert(users).values({
      id: crypto.randomUUID(),
      email: data.email,
      username: data.username,
      fullName: data.fullName,
      password: data.password ? await bcrypt.hash(data.password, 12) : null,
      discordId: data.discordId,
      culturalBackground: data.culturalBackground ? JSON.stringify(data.culturalBackground) : null,
      bio: data.bio,
      isVerified: false,
      verificationLevel: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()
    
    return this.mapToUserProfile(user)
  }

  async updateUser(id: string, data: UpdateUserData): Promise<UserProfile> {
    const [user] = await this.db.update(users)
      .set({
        ...data,
        culturalBackground: data.culturalBackground ? JSON.stringify(data.culturalBackground) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()
    
    return this.mapToUserProfile(user)
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    const user = await this.db.select().from(users).where(eq(users.id, id)).limit(1)
    return user.length > 0 ? this.mapToUserProfile(user[0]) : null
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const user = await this.db.select().from(users).where(eq(users.email, email)).limit(1)
    return user.length > 0 ? this.mapToUserProfile(user[0]) : null
  }

  async getUserByUsername(username: string): Promise<UserProfile | null> {
    const user = await this.db.select().from(users).where(eq(users.username, username)).limit(1)
    return user.length > 0 ? this.mapToUserProfile(user[0]) : null
  }

  async getUserByDiscordId(discordId: string): Promise<UserProfile | null> {
    const user = await this.db.select().from(users).where(eq(users.discordId, discordId)).limit(1)
    return user.length > 0 ? this.mapToUserProfile(user[0]) : null
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.db.select({ password: users.password }).from(users).where(eq(users.id, userId)).limit(1)
    
    if (!user.length || !user[0].password) {
      return false
    }

    return bcrypt.compare(password, user[0].password)
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await this.db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id))
  }

  async searchUsers(_query: string, limit: number = 10): Promise<UserProfile[]> {
    const userList = await this.db.select()
      .from(users)
      .where(
        eq(users.isVerified, true)
      )
      .limit(limit)
    
    return userList.map(user => this.mapToUserProfile(user))
  }

  private mapToUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl || undefined,
      discordId: user.discordId || undefined,
      culturalBackground: user.culturalBackground ? JSON.parse(user.culturalBackground) : [],
      bio: user.bio || undefined,
      isVerified: Boolean(user.isVerified),
      verificationLevel: user.verificationLevel ?? 0,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }
  }
}
