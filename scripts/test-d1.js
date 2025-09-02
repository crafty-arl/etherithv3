#!/usr/bin/env node

/**
 * Test script for D1 database connectivity
 * Run this with: node scripts/test-d1.js
 */

console.log('🔍 Testing D1 Database Connection...\n');

// Check if we're in a Cloudflare Workers environment
if (typeof globalThis.DB === 'undefined') {
  console.log('❌ D1 Database not available in this environment');
  console.log('This script should be run in a Cloudflare Workers environment');
  console.log('Try running: wrangler dev or wrangler tail');
  process.exit(1);
}

console.log('✅ D1 Database binding found');

async function testD1Connection() {
  try {
    console.log('\n📋 Testing basic queries...');
    
    // Test 1: List tables
    console.log('1. Listing database tables...');
    const tablesResult = await globalThis.DB.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
    console.log(`   Found ${tablesResult.results.length} tables:`, tablesResult.results.map(t => t.name));
    
    // Test 2: Check if required tables exist
    const requiredTables = ['users', 'sessions', 'accounts', 'verification_tokens'];
    const existingTables = tablesResult.results.map(t => t.name);
    
    console.log('\n2. Checking required tables...');
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table} table exists`);
      } else {
        console.log(`   ❌ ${table} table missing`);
      }
    }
    
    // Test 3: Check table schemas
    console.log('\n3. Checking table schemas...');
    for (const table of existingTables) {
      try {
        const schemaResult = await globalThis.DB.prepare(`PRAGMA table_info(${table})`).all();
        console.log(`   📋 ${table} table has ${schemaResult.results.length} columns`);
        
        // Show column details for key tables
        if (['users', 'sessions', 'accounts'].includes(table)) {
          schemaResult.results.forEach(col => {
            console.log(`      - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Error getting schema for ${table}:`, error.message);
      }
    }
    
    // Test 4: Check record counts
    console.log('\n4. Checking record counts...');
    for (const table of existingTables) {
      try {
        const countResult = await globalThis.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first();
        console.log(`   📊 ${table}: ${countResult.count} records`);
      } catch (error) {
        console.log(`   ❌ Error counting ${table}:`, error.message);
      }
    }
    
    // Test 5: Test sample queries
    console.log('\n5. Testing sample queries...');
    
    if (existingTables.includes('users')) {
      try {
        const usersResult = await globalThis.DB.prepare('SELECT id, email, username, fullName FROM users LIMIT 3').all();
        console.log(`   👥 Sample users:`, usersResult.results);
      } catch (error) {
        console.log(`   ❌ Error querying users:`, error.message);
      }
    }
    
    if (existingTables.includes('sessions')) {
      try {
        const sessionsResult = await globalThis.DB.prepare('SELECT id, userId, expires FROM sessions LIMIT 3').all();
        console.log(`   🔑 Sample sessions:`, sessionsResult.results);
      } catch (error) {
        console.log(`   ❌ Error querying sessions:`, error.message);
      }
    }
    
    if (existingTables.includes('accounts')) {
      try {
        const accountsResult = await globalThis.DB.prepare('SELECT id, userId, provider, type FROM accounts LIMIT 3').all();
        console.log(`   🔗 Sample accounts:`, accountsResult.results);
      } catch (error) {
        console.log(`   ❌ Error querying accounts:`, error.message);
      }
    }
    
    console.log('\n✅ D1 Database tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error testing D1 database:', error);
    process.exit(1);
  }
}

// Run the tests
testD1Connection().catch(console.error);

