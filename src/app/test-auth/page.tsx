'use client';

import { useState } from 'react';

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSimpleEndpoint = async () => {
    try {
      const response = await fetch('/api/auth/simple-test');
      const data = await response.json();
      addResult(`✅ Simple endpoint: ${data.message}`);
    } catch (error) {
      addResult(`❌ Simple endpoint failed: ${error}`);
    }
  };

  const testSetupEndpoint = async () => {
    try {
      const response = await fetch('/api/setup');
      const data = await response.json();
      addResult(`✅ Setup endpoint: ${data.message}`);
    } catch (error) {
      addResult(`❌ Setup endpoint failed: ${error}`);
    }
  };

  const testSignupEndpoint = async () => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword123'
        })
      });
      const data = await response.json();
      addResult(`✅ Signup endpoint: ${data.message || data.error}`);
    } catch (error) {
      addResult(`❌ Signup endpoint failed: ${error}`);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addResult('🧪 Starting authentication system tests...');
    
    await testSimpleEndpoint();
    await testSetupEndpoint();
    await testSignupEndpoint();
    
    addResult('🎯 All tests completed!');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">
          🔐 Etherith Authentication System Test
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Test Controls</h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testSimpleEndpoint}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Test Simple Endpoint
            </button>
            
            <button
              onClick={testSetupEndpoint}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Test Setup Endpoint
            </button>
            
            <button
              onClick={testSignupEndpoint}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Test Signup Endpoint
            </button>
            
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Test Results</h2>
          
          {testResults.length === 0 ? (
            <p className="text-stone-500 italic">No tests run yet. Click a test button above to get started.</p>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 bg-stone-50 rounded-lg font-mono text-sm">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">What This Tests</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• <strong>Simple Endpoint:</strong> Basic API connectivity</li>
            <li>• <strong>Setup Endpoint:</strong> Database initialization</li>
            <li>• <strong>Signup Endpoint:</strong> User registration with password hashing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
