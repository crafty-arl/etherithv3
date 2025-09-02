import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    wranglerConfigPath: './workers/ai-memory-analyzer/wrangler.toml',
    dbName: 'etherith-db',
  },
  verbose: true,
  strict: true,
})