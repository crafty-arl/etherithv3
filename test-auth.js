#!/usr/bin/env node

/**
 * Authentication System Test Script
 * Tests the Etherith authentication system endpoints
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`${method} ${endpoint}: ${response.status}`);
    if (response.ok) {
      console.log(`  ✅ Success:`, data.message || 'OK');
    } else {
      console.log(`  ❌ Error:`, data.error || 'Unknown error');
    }
    
    return { status: response.status, data };
  } catch (error) {
    console.log(`${method} ${endpoint}: ❌ Network Error`);
    console.log(`  Error:`, error.message);
    return { status: 0, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Etherith Authentication System');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('');

  // Test 1: Database setup
  console.log('1️⃣ Testing Database Setup...');
  await testEndpoint('/api/setup');
  console.log('');

  // Test 2: Signup endpoint
  console.log('2️⃣ Testing User Signup...');
  const signupData = {
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123'
  };
  await testEndpoint('/api/auth/signup', 'POST', signupData);
  console.log('');

  // Test 3: Protected endpoint (should fail without auth)
  console.log('3️⃣ Testing Protected Endpoint (Unauthenticated)...');
  await testEndpoint('/api/auth/test');
  console.log('');

  // Test 4: User profile endpoint (should fail without auth)
  console.log('4️⃣ Testing User Profile (Unauthenticated)...');
  await testEndpoint('/api/user/profile');
  console.log('');

  // Test 5: AI analysis endpoint (should work without auth)
  console.log('5️⃣ Testing AI Analysis (Optional Auth)...');
  const analysisData = {
    content: 'My grandmother used to make traditional bread every Sunday morning.',
    culturalContext: ['Family Heritage', 'Culinary Traditions'],
    language: 'en'
  };
  await testEndpoint('/api/ai/analyze-memory', 'POST', analysisData);
  console.log('');

  console.log('🎯 Test Summary:');
  console.log('  - Database setup should succeed');
  console.log('  - Signup should succeed (or show user exists)');
  console.log('  - Protected endpoints should return 401 (Unauthorized)');
  console.log('  - AI analysis should work for anonymous users');
  console.log('');
  console.log('💡 To test authenticated endpoints:');
  console.log('   1. Visit the signin page in your browser');
  console.log('   2. Create an account or sign in');
  console.log('   3. Test the protected endpoints with your session');
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
