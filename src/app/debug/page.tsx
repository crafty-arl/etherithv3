'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

export default function DebugPage() {
  const { user, session, status } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug');
      const data = await response.json();
      
      if (data.success) {
        setDebugData(data.debugInfo);
      } else {
        setError(data.error || 'Failed to fetch debug data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testD1Query = async (query: string) => {
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-d1-query', query })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Query successful!\n\nResults: ${JSON.stringify(data.result, null, 2)}`);
      } else {
        alert(`Query failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔍 Debug Dashboard</h1>
          <p className="text-gray-600">Comprehensive debugging information for Etherith authentication and D1 database</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">🔐 Authentication Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  status === 'authenticated' ? 'bg-green-100 text-green-800' : 
                  status === 'loading' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User:</span>
                <span>{user ? `${user.firstName} ${user.lastName}` : 'Not logged in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Username:</span>
                <span>{user?.username || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Session:</span>
                <span>{session ? 'Active' : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Verified:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">🌍 Environment</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">NODE_ENV:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{debugData?.environment || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">NEXTAUTH_URL:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{debugData?.nextAuthUrl || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">DISCORD_CLIENT_ID:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  debugData?.discordClientId === 'SET' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.discordClientId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">DISCORD_CLIENT_SECRET:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  debugData?.discordClientSecret === 'SET' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.discordClientSecret || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">NEXTAUTH_SECRET:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  debugData?.nextAuthSecret === 'SET' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.nextAuthSecret || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* D1 Database Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">🗄️ D1 Database</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Available:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  debugData?.d1DatabaseAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.d1DatabaseAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  debugData?.d1Status === 'Available' ? 'bg-green-100 text-green-800' : 
                  debugData?.d1Status === 'Error' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {debugData?.d1Status || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Users:</span>
                <span>{debugData?.userCount?.count || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sessions:</span>
                <span>{debugData?.sessionCount?.count || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Accounts:</span>
                <span>{debugData?.accountCount?.count || 'N/A'}</span>
              </div>
            </div>
            
            {debugData?.d1Error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <strong className="text-red-800">D1 Error:</strong>
                <p className="text-red-700 text-sm mt-1">{debugData.d1Error}</p>
              </div>
            )}
          </div>

          {/* Request Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📡 Request Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Host:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{debugData?.host || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User Agent:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs max-w-xs truncate">{debugData?.userAgent || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Referer:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs max-w-xs truncate">{debugData?.referer || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Timestamp:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{debugData?.timestamp || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* D1 Tables */}
        {debugData?.d1Tables && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📋 D1 Database Tables</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {debugData.d1Tables.map((table: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {table.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => testD1Query(`SELECT * FROM ${table.name} LIMIT 5`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View Sample
                        </button>
                        <button
                          onClick={() => testD1Query(`SELECT COUNT(*) as count FROM ${table.name}`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Count
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">⚡ Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchDebugData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Debug Data
            </button>
            <button
              onClick={() => testD1Query('SELECT name FROM sqlite_master WHERE type="table"')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              📋 List Tables
            </button>
            <button
              onClick={() => testD1Query('SELECT * FROM users LIMIT 5')}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              👥 View Users
            </button>
            <button
              onClick={() => testD1Query('SELECT * FROM sessions LIMIT 5')}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              🔑 View Sessions
            </button>
          </div>
        </div>

        {/* Raw Debug Data */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">📄 Raw Debug Data</h2>
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
              Click to expand raw debug information
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
