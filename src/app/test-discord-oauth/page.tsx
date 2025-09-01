'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function TestDiscordOAuthPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleDiscordSignIn = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      await signIn('discord', { callbackUrl: '/test-discord-oauth' })
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut({ callbackUrl: '/test-discord-oauth' })
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Discord OAuth + D1 Test</h1>
      
      {message && (
        <div className="p-4 mb-6 rounded bg-red-100 text-red-700">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        {session ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-600">✅ Authenticated!</h2>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{session.user?.name}</div>
                  <div className="text-sm text-gray-600">{session.user?.email}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Session Data:</h3>
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-600">Not Authenticated</h2>
            
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold mb-2">What this test does:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Signs you in with Discord OAuth</li>
                <li>• Automatically creates user in D1 database</li>
                <li>• Stores Discord account information</li>
                <li>• Manages session data</li>
              </ul>
            </div>

            <button
              onClick={handleDiscordSignIn}
              disabled={loading}
              className="w-full bg-[#5865F2] text-white py-2 px-4 rounded hover:bg-[#4752C4] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span>Sign in with Discord</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Test Discord OAuth:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Make sure you've visited <code className="bg-gray-200 px-1 rounded">/api/setup</code> first</li>
          <li>Click "Sign in with Discord" above</li>
          <li>Complete Discord OAuth flow</li>
          <li>Check your D1 dashboard for the new user</li>
          <li>Verify session data is displayed correctly</li>
        </ol>
      </div>

      <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">⚠️ Important Notes:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• This must be deployed to Cloudflare Pages to work with D1</li>
          <li>• Local development will use JWT tokens instead of D1</li>
          <li>• Visit <code className="bg-yellow-200 px-1 rounded">/api/setup</code> before testing OAuth</li>
        </ul>
      </div>
    </div>
  )
}
