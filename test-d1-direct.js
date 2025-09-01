// Direct D1 Test Script - No build required!
// Run with: wrangler d1 execute etherith-db --file=test-d1-direct.js

// Test user creation directly in D1
const testUser = {
  id: 'test_user_' + Date.now(),
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: 1,
  image: 'https://example.com/avatar.png'
};

// Test account creation
const testAccount = {
  id: 'discord_test_' + Date.now(),
  userId: testUser.id,
  type: 'oauth',
  provider: 'discord',
  providerAccountId: '123456789',
  access_token: 'test_access_token',
  refresh_token: 'test_refresh_token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  scope: 'identify email guilds'
};

console.log('Testing D1 Database Directly...');
console.log('User to create:', testUser);
console.log('Account to create:', testAccount);

// These will be executed by wrangler
-- Create test user
INSERT INTO users (id, name, email, emailVerified, image) 
VALUES (?, ?, ?, ?, ?);

-- Create test account
INSERT INTO accounts (id, userId, type, provider, providerAccountId, access_token, refresh_token, expires_at, scope)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Verify data was created
SELECT * FROM users;
SELECT * FROM accounts;
