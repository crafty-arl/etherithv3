-- D1 Test Script - Insert test data
-- Run with: wrangler d1 execute etherith-db --file=test-d1.sql

-- Create test user
INSERT INTO users (id, name, email, emailVerified, image) 
VALUES (
  'test_user_001', 
  'Test User', 
  'test@example.com', 
  1, 
  'https://example.com/avatar.png'
);

-- Create test Discord account
INSERT INTO accounts (
  id, 
  userId, 
  type, 
  provider, 
  providerAccountId, 
  access_token, 
  refresh_token, 
  expires_at, 
  scope
) VALUES (
  'discord_test_001',
  'test_user_001',
  'oauth',
  'discord',
  '123456789',
  'test_access_token_here',
  'test_refresh_token_here',
  strftime('%s', 'now') + 3600,
  'identify email guilds'
);

-- Verify data was created
SELECT 'Users table:' as table_name;
SELECT * FROM users;

SELECT 'Accounts table:' as table_name;
SELECT * FROM accounts;
