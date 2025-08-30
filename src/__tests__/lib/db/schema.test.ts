import { users, sessions, accounts } from '@/lib/db/schema'

describe('Database Schema', () => {
  describe('users table', () => {
    it('should have correct structure', () => {
      expect(users).toBeDefined()
      expect(users.id).toBeDefined()
      expect(users.email).toBeDefined()
      expect(users.username).toBeDefined()
      expect(users.fullName).toBeDefined()
    })

    it('should have optional fields defined', () => {
      expect(users.avatarUrl).toBeDefined()
      expect(users.bio).toBeDefined()
      expect(users.discordId).toBeDefined()
      expect(users.culturalBackground).toBeDefined()
    })

    it('should have verification fields', () => {
      expect(users.isVerified).toBeDefined()
      expect(users.verificationLevel).toBeDefined()
    })

    it('should have timestamp fields', () => {
      expect(users.createdAt).toBeDefined()
      expect(users.updatedAt).toBeDefined()
    })
  })

  describe('sessions table', () => {
    it('should have correct structure', () => {
      expect(sessions).toBeDefined()
      expect(sessions.id).toBeDefined()
      expect(sessions.userId).toBeDefined()
      expect(sessions.expires).toBeDefined()
      expect(sessions.sessionToken).toBeDefined()
    })
  })

  describe('accounts table', () => {
    it('should have correct structure for OAuth', () => {
      expect(accounts).toBeDefined()
      expect(accounts.id).toBeDefined()
      expect(accounts.userId).toBeDefined()
      expect(accounts.type).toBeDefined()
      expect(accounts.provider).toBeDefined()
      expect(accounts.providerAccountId).toBeDefined()
    })

    it('should have OAuth token fields', () => {
      expect(accounts.access_token).toBeDefined()
      expect(accounts.refresh_token).toBeDefined()
      expect(accounts.expires_at).toBeDefined()
      expect(accounts.token_type).toBeDefined()
      expect(accounts.scope).toBeDefined()
    })
  })
})