import { drizzle } from 'drizzle-orm/d1'
import { migrate } from 'drizzle-orm/d1/migrator'
import * as schema from './schema'

export function createDB(d1: D1Database) {
  return drizzle(d1, { schema })
}

// For local development with D1
export async function runMigrations(db: D1Database) {
  const drizzleDb = createDB(db)
  await migrate(drizzleDb, { migrationsFolder: './drizzle' })
}

// Database type for use throughout the application
export type Database = ReturnType<typeof createDB>

// Re-export schema for convenience
export * from './schema'