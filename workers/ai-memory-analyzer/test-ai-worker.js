#!/usr/bin/env node

/**
 * Test script for Cloudflare AI Worker integration
 * This script tests the AI memory analyzer worker to ensure prompts are working correctly
 */

const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || 'http://localhost:8787';

async function testAIWorker() {
  console.log('🧪 Testing Cloudflare AI Worker Integration...\n');

  try {
    // Test 1: Start Active Listening
    console.log('📝 Test 1: Starting Active Listening...');
    const startResponse = await testStartActiveListening();
    console.log('✅ Start Response:', JSON.stringify(startResponse, null, 2));
    
    if (startResponse.queryId) {
      // Test 2: Process User Response
      console.log('\n📝 Test 2: Processing User Response...');
      const listenResponse = await testProcessUserResponse(startResponse.queryId);
      console.log('✅ Listen Response:', JSON.stringify(listenResponse, null, 2));
      
      // Test 3: Final Analysis
      console.log('\n📝 Test 3: Performing Final Analysis...');
      const analysisResponse = await testFinalAnalysis(startResponse.queryId);
      console.log('✅ Analysis Response:', JSON.stringify(analysisResponse, null, 2));
    }

    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function testStartActiveListening() {
  const testMemory = `When I was a child, my grandmother would always make this special bread during the winter solstice. The whole house would smell like cinnamon and love. She would tell me stories about how her mother taught her this recipe, and how it connected us to our ancestors. The bread wasn't just food - it was a way of keeping our family traditions alive.`;

  const response = await fetch(`${WORKER_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'start',
      content: testMemory,
      userId: 'test-user-123'
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

async function testProcessUserResponse(queryId) {
  const testResponse = `I remember feeling so warm and safe when we made that bread together. My grandmother would let me help knead the dough, and she'd tell me stories about our family's journey from the old country. She said the recipe was passed down through generations, and each family member added their own touch to it.`;

  const response = await fetch(`${WORKER_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'listen',
      queryId: queryId,
      content: testResponse,
      conversationHistory: [
        {
          speaker: 'user',
          content: 'When I was a child, my grandmother would always make this special bread during the winter solstice...',
          messageType: 'memory'
        },
        {
          speaker: 'ai',
          content: 'What emotions come up for you when you think about this memory?',
          messageType: 'question',
          stage: 1
        },
        {
          speaker: 'user',
          content: testResponse,
          messageType: 'answer'
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

async function testFinalAnalysis(queryId) {
  const response = await fetch(`${WORKER_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'analyze',
      queryId: queryId,
      conversationHistory: [
        {
          speaker: 'user',
          content: 'When I was a child, my grandmother would always make this special bread during the winter solstice...',
          messageType: 'memory'
        },
        {
          speaker: 'ai',
          content: 'What emotions come up for you when you think about this memory?',
          messageType: 'question',
          stage: 1
        },
        {
          speaker: 'user',
          content: 'I remember feeling so warm and safe when we made that bread together...',
          messageType: 'answer'
        },
        {
          speaker: 'ai',
          content: 'Can you tell me more about the cultural traditions connected to this bread-making?',
          messageType: 'question',
          stage: 2
        },
        {
          speaker: 'user',
          content: 'The bread was part of our winter solstice celebration. We would light candles and give thanks for the harvest...',
          messageType: 'answer'
        },
        {
          speaker: 'ai',
          content: 'What would you want future generations to understand about this tradition?',
          messageType: 'question',
          stage: 3
        },
        {
          speaker: 'user',
          content: 'I want them to know that this bread represents more than just food - it\'s about family connection and cultural continuity...',
          messageType: 'answer'
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAIWorker().catch(console.error);
}

module.exports = { testAIWorker };
