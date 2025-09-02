import '@testing-library/jest-dom'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock Cloudflare D1 database for testing
global.DB = {
  prepare: jest.fn(),
  dump: jest.fn(),
  exec: jest.fn(),
  batch: jest.fn(),
}

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123'),
  },
})

// Mock DOM methods for testing
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}

// Suppress console.error in tests unless needed
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})