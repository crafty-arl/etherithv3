// Test script to verify Cloudflare Worker connection
const WORKER_URL = 'https://ai-memory-analyzer.carl-6e7.workers.dev';

async function testWorkerConnection() {
  console.log('Testing worker connection to:', WORKER_URL);
  
  try {
    // Test 1: Start conversation
    console.log('\n1. Testing start conversation...');
    const startResponse = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        content: 'I remember my grandmother teaching me how to make traditional bread when I was a child. She would wake up early every Sunday to prepare the dough, and I would watch her knead it with such care and love.'
      })
    });
    
    if (!startResponse.ok) {
      throw new Error(`Start failed: ${startResponse.status}`);
    }
    
    const startResult = await startResponse.json();
    console.log('Start result:', JSON.stringify(startResult, null, 2));
    
    if (!startResult.queryId) {
      console.log('❌ No queryId returned from start');
      return;
    }
    
    // Test 2: Submit first response
    console.log('\n2. Testing first response...');
    const listenResponse1 = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'listen',
        queryId: startResult.queryId,
        content: 'It was so special because she would tell me stories about how her own mother taught her the same recipe, and how it had been passed down through generations. The smell of fresh bread would fill the whole house.',
        conversationHistory: [
          {
            speaker: 'user',
            content: 'I remember my grandmother teaching me how to make traditional bread when I was a child. She would wake up early every Sunday to prepare the dough, and I would watch her knead it with such care and love.',
            messageType: 'memory',
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'ai',
            content: startResult.question,
            messageType: 'question',
            followUpReason: startResult.followUpReason,
            emotionalTone: startResult.emotionalTone,
            culturalCues: startResult.culturalCues,
            stage: startResult.stage,
            timestamp: new Date().toISOString()
          }
        ]
      })
    });
    
    if (!listenResponse1.ok) {
      throw new Error(`Listen 1 failed: ${listenResponse1.status}`);
    }
    
    const listenResult1 = await listenResponse1.json();
    console.log('Listen 1 result:', JSON.stringify(listenResult1, null, 2));
    
    // Test 3: Submit second response
    console.log('\n3. Testing second response...');
    const listenResponse2 = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'listen',
        queryId: startResult.queryId,
        content: 'Yes, it was a Sunday tradition that brought our whole family together. My grandfather would come home from church and the bread would be ready. We would all sit around the table and break bread together, sharing stories and laughter.',
        conversationHistory: [
          {
            speaker: 'user',
            content: 'I remember my grandmother teaching me how to make traditional bread when I was a child. She would wake up early every Sunday to prepare the dough, and I would watch her knead it with such care and love.',
            messageType: 'memory',
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'ai',
            content: startResult.question,
            messageType: 'question',
            followUpReason: startResult.followUpReason,
            emotionalTone: startResult.emotionalTone,
            culturalCues: startResult.culturalCues,
            stage: startResult.stage,
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'user',
            content: 'It was so special because she would tell me stories about how her own mother taught her the same recipe, and how it had been passed down through generations. The smell of fresh bread would fill the whole house.',
            messageType: 'answer',
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'ai',
            content: listenResult1.question,
            messageType: 'question',
            followUpReason: listenResult1.followUpReason,
            emotionalTone: listenResult1.emotionalTone,
            culturalCues: listenResult1.culturalCues,
            stage: listenResult1.stage,
            timestamp: new Date().toISOString()
          }
        ]
      })
    });
    
    if (!listenResponse2.ok) {
      throw new Error(`Listen 2 failed: ${listenResponse2.status}`);
    }
    
    const listenResult2 = await listenResponse2.json();
    console.log('Listen 2 result:', JSON.stringify(listenResult2, null, 2));
    
    // Test 4: Submit third response
    console.log('\n4. Testing third response...');
    const listenResponse3 = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'listen',
        queryId: startResult.queryId,
        content: 'This memory is so important because it represents our family\'s cultural heritage. The bread-making tradition connects us to our ancestors and preserves our cultural identity. It\'s not just about food - it\'s about love, family bonds, and passing down wisdom from one generation to the next.',
        conversationHistory: [
          {
            speaker: 'user',
            content: 'I remember my grandmother teaching me how to make traditional bread when I was a child. She would wake up early every Sunday to prepare the dough, and I would watch her knead it with such care and love.',
            messageType: 'memory',
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'ai',
            content: startResult.question,
            messageType: 'question',
            followUpReason: startResult.followUpReason,
            emotionalTone: startResult.emotionalTone,
            culturalCues: startResult.culturalCues,
            stage: startResult.stage,
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'user',
            content: 'It was so special because she would tell me stories about how her own mother taught her the same recipe, and how it had been passed down through generations. The smell of fresh bread would fill the whole house.',
            messageType: 'answer',
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'ai',
            content: listenResult1.question,
            messageType: 'question',
            followUpReason: listenResult1.followUpReason,
            emotionalTone: listenResult1.emotionalTone,
            culturalCues: listenResult1.culturalCues,
            stage: listenResult1.stage,
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'user',
            content: 'Yes, it was a Sunday tradition that brought our whole family together. My grandfather would come home from church and the bread would be ready. We would all sit around the table and break bread together, sharing stories and laughter.',
            messageType: 'answer',
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'ai',
            content: listenResult2.question,
            messageType: 'question',
            followUpReason: listenResult2.followUpReason,
            emotionalTone: listenResult2.emotionalTone,
            culturalCues: listenResult2.culturalCues,
            stage: listenResult2.stage,
            timestamp: new Date().toISOString()
          }
        ]
      })
    });
    
    if (!listenResponse3.ok) {
      throw new Error(`Listen 3 failed: ${listenResponse3.status}`);
    }
    
    const listenResult3 = await listenResponse3.json();
    console.log('Listen 3 result:', JSON.stringify(listenResult3, null, 2));
    
    // Test 5: Final analysis
    if (listenResult3.status === 'ready_for_analysis') {
      console.log('\n5. Testing final analysis...');
      const analyzeResponse = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          queryId: startResult.queryId,
          conversationHistory: [
            {
              speaker: 'user',
              content: 'I remember my grandmother teaching me how to make traditional bread when I was a child. She would wake up early every Sunday to prepare the dough, and I would watch her knead it with such care and love.',
              messageType: 'memory',
              timestamp: new Date().toISOString()
            },
            {
              speaker: 'ai',
              content: startResult.question,
              messageType: 'question',
              followUpReason: startResult.followUpReason,
              emotionalTone: startResult.emotionalTone,
              culturalCues: startResult.culturalCues,
              stage: startResult.stage,
              timestamp: new Date().toISOString()
            },
            {
              speaker: 'user',
              content: 'It was so special because she would tell me stories about how her own mother taught her the same recipe, and how it had been passed down through generations. The smell of fresh bread would fill the whole house.',
              messageType: 'answer',
              timestamp: new Date().toISOString()
            },
            {
              speaker: 'ai',
              content: listenResult1.question,
              messageType: 'question',
              followUpReason: listenResult1.followUpReason,
              emotionalTone: listenResult1.emotionalTone,
              culturalCues: listenResult1.culturalCues,
              stage: listenResult1.stage,
              timestamp: new Date().toISOString()
            },
            {
              speaker: 'user',
              content: 'Yes, it was a Sunday tradition that brought our whole family together. My grandfather would come home from church and the bread would be ready. We would all sit around the table and break bread together, sharing stories and laughter.',
              messageType: 'answer',
              timestamp: new Date().toISOString()
            },
            {
              speaker: 'ai',
              content: listenResult2.question,
              messageType: 'question',
              followUpReason: listenResult2.followUpReason,
              emotionalTone: listenResult2.emotionalTone,
              culturalCues: listenResult2.culturalCues,
              stage: listenResult2.stage,
              timestamp: new Date().toISOString()
            },
            {
              speaker: 'user',
              content: 'This memory is so important because it represents our family\'s cultural heritage. The bread-making tradition connects us to our ancestors and preserves our cultural identity. It\'s not just about food - it\'s about love, family bonds, and passing down wisdom from one generation to the next.',
              messageType: 'answer',
              timestamp: new Date().toISOString()
            }
          ]
        })
      });
      
      if (!analyzeResponse.ok) {
        throw new Error(`Analyze failed: ${analyzeResponse.status}`);
      }
      
      const analyzeResult = await analyzeResponse.json();
      console.log('Analyze result:', JSON.stringify(analyzeResult, null, 2));
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      try {
        const errorData = await error.response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
    }
  }
}

testWorkerConnection();
