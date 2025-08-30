import { UserService } from '@/lib/auth/user-service'

// Mock the database
const mockDB = {
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        avatarUrl: null,
        discordId: null,
        culturalBackground: null,
        isVerified: false,
        verificationLevel: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]))
    }))
  })),
  select: jest.fn(() => ({
    from: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve([{
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'Test User',
          avatarUrl: null,
          discordId: null,
          culturalBackground: null,
          isVerified: false,
          verificationLevel: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]))
      }))
    }))
  })),
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'updateduser',
          fullName: 'Updated User',
          avatarUrl: null,
          discordId: null,
          culturalBackground: null,
          isVerified: false,
          verificationLevel: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]))
      }))
    }))
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => Promise.resolve())
  }))
} as ReturnType<typeof createDB>

// Mock the createDB function
jest.mock('@/lib/db', () => ({
  createDB: jest.fn(() => mockDB)
}))

describe('UserService', () => {
  let userService: UserService
  let mockD1Database: D1Database

  beforeEach(() => {
    mockD1Database = {} as D1Database
    userService = new UserService(mockD1Database)
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User'
      }

      const user = await userService.createUser(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.username).toBe(userData.username)
      expect(user.fullName).toBe(userData.fullName)
      expect(user.id).toBe('test-user-id')
      expect(user.isVerified).toBe(false)
      expect(user.verificationLevel).toBe(1)
    })

    it('should create user with cultural background', async () => {
      const userData = {
        email: 'cultural@example.com',
        username: 'culturaluser',
        fullName: 'Cultural User',
        culturalBackground: ['Indigenous', 'Native American']
      }

      const user = await userService.createUser(userData)

      expect(user.culturalBackground).toEqual(['Indigenous', 'Native American'])
    })

    it('should create user with Discord ID', async () => {
      const userData = {
        email: 'discord@example.com',
        username: 'discorduser',
        fullName: 'Discord User',
        discordId: '123456789'
      }

      const user = await userService.createUser(userData)

      expect(user.discordId).toBe('123456789')
    })
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = await userService.getUserById('test-user-id')

      expect(user).toBeDefined()
      expect(user?.id).toBe('test-user-id')
      expect(user?.email).toBe('test@example.com')
    })

    it('should return null when user not found', async () => {
      // Mock empty result
      mockDB.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([]))
          }))
        }))
      })

      const user = await userService.getUserById('non-existent-id')

      expect(user).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user data', async () => {
      const updateData = {
        username: 'updateduser',
        fullName: 'Updated User'
      }

      const user = await userService.updateUser('test-user-id', updateData)

      expect(user).toBeDefined()
      expect(user?.username).toBe('updateduser')
      expect(user?.fullName).toBe('Updated User')
    })

    it('should return null when user not found', async () => {
      // Mock empty result for update
      mockDB.update.mockReturnValue({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn(() => Promise.resolve([]))
          }))
        }))
      })

      const user = await userService.updateUser('non-existent-id', { username: 'test' })

      expect(user).toBeNull()
    })
  })

  describe('verifyUser', () => {
    it('should verify user and set verification level', async () => {
      const user = await userService.verifyUser('test-user-id', 3)

      expect(user).toBeDefined()
      expect(mockDB.update).toHaveBeenCalled()
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const result = await userService.deleteUser('test-user-id')

      expect(result).toBe(true)
      expect(mockDB.delete).toHaveBeenCalled()
    })

    it('should return false on error', async () => {
      // Mock error
      mockDB.delete.mockImplementation(() => {
        throw new Error('Database error')
      })

      const result = await userService.deleteUser('test-user-id')

      expect(result).toBe(false)
    })
  })

  describe('password utilities', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hash = await UserService.hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are typically 60 chars
    })

    it('should verify password correctly', async () => {
      const password = 'testpassword123'
      const hash = await UserService.hashPassword(password)
      
      const isValid = await UserService.verifyPassword(password, hash)
      const isInvalid = await UserService.verifyPassword('wrongpassword', hash)

      expect(isValid).toBe(true)
      expect(isInvalid).toBe(false)
    })
  })
})