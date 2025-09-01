'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function TestDiscordPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Starting Discord OAuth...');
      
      const result = await signIn('discord', { 
        callbackUrl: '/memory-weaver',
        redirect: false 
      });
      
      console.log('Discord OAuth result:', result);
      
      if (result?.error) {
        setError(`Discord OAuth Error: ${result.error}`);
        console.error('Discord OAuth error:', result.error);
      } else if (result?.url) {
        console.log('Redirecting to:', result.url);
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Discord login error:', error);
      setError(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Discord OAuth Test
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Test Discord OAuth flow and debug redirect URI issues
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Discord OAuth'}
          </button>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm text-blue-700">
              <strong>Debug Info:</strong>
              <br />
              • Expected callback URL: http://localhost:3000/api/auth/callback/discord
              <br />
              • Check browser console for detailed logs
              <br />
              • Verify Discord app redirect URI matches exactly
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
