import { up } from '@auth/d1-adapter'

export async function GET() {
  try {
    // Check if we're in a Cloudflare Workers environment
    if (typeof globalThis.DB === 'undefined') {
      return new Response('D1 database not available in this environment', { status: 500 })
    }

    // Run the D1 adapter migrations to create necessary tables
    await up(globalThis.DB)
    
    console.log('D1 database setup completed successfully')
    return new Response('Migration completed successfully', { status: 200 })
    
  } catch (error) {
    console.error('D1 setup error:', error)
    
    if (error instanceof Error) {
      const causeMessage = error.cause instanceof Error ? error.cause.message : String(error.cause)
      console.log('Cause:', causeMessage, 'Error:', error.message)
    }
    
    return new Response(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500 
    })
  }
}
