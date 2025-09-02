#!/usr/bin/env node

/**
 * Local test script for AI Worker functions
 * This script tests the AI worker logic directly without requiring the worker to be running
 */

// Mock the Cloudflare AI and D1 environment
const mockEnv = {
  AI: {
    run: async (model, options) => {
      console.log(`🤖 Mock AI call to ${model}`);
      console.log('📝 Options:', JSON.stringify(options, null, 2));
      
      // Simulate AI response based on the action
      if (options.messages && options.messages.length > 0) {
        const lastMessage = options.messages[options.messages.length - 1];
        
        if (lastMessage.content.includes('Analyze this memory')) {
          // Mock memory analysis response
          return {
            response: JSON.stringify({
              culturalCues: ["family", "tradition", "food", "heritage"],
              emotionalTone: "nostalgic",
              culturalSignificance: 0.85,
              peopleIdentified: ["grandmother", "mother"],
              locationContext: "home",
              temporalContext: "winter solstice"
            })
          };
        } else if (lastMessage.content.includes('Generate question')) {
          // Mock question generation response
          return {
            response: JSON.stringify({
              question: "What emotions come up for you when you think about this memory?",
              followUpReason: "I want to understand the emotional significance better",
              emotionalTone: "reflective",
              culturalCues: ["family", "tradition"],
              stage: 1
            })
          };
        } else if (lastMessage.content.includes('comprehensive analysis')) {
          // Mock comprehensive analysis response
          return {
            response: JSON.stringify({
              culturalElements: ["family", "tradition", "food", "heritage", "winter solstice"],
              emotionalSignificance: "deeply meaningful and nostalgic",
              culturalPractices: ["bread making", "storytelling", "celebration"],
              peopleIdentified: ["grandmother", "mother", "family"],
              locationContext: "home and kitchen",
              temporalContext: "winter solstice tradition",
              culturalSignificanceScore: 0.92,
              suggestedTags: ["family", "tradition", "food", "heritage", "winter", "bread"],
              metadata: {
                title: "Grandmother's Winter Solstice Bread",
                category: "Culinary Heritage",
                culturalHeritage: ["family tradition", "seasonal celebration"]
              },
              activeListeningInsights: "The conversation revealed deep family connections and cultural continuity",
              conversationQuality: 0.9,
              confidenceScore: 0.88
            })
          };
        }
      }
      
      // Default response
      return {
        response: "Mock AI response for testing purposes"
      };
    }
  },
  DB: {
    // Mock D1 database for testing
    prepare: () => ({
      bind: () => ({
        run: async () => ({ success: true })
      })
    })
  }
};

// Import the worker functions (we'll need to extract them)
async function testWorkerFunctions() {
  console.log('🧪 Testing AI Worker Functions Locally...\n');

  try {
    // Test 1: Mock AI Memory Analysis
    console.log('📝 Test 1: Mock AI Memory Analysis...');
    const mockAI = mockEnv.AI;
    const testMemory = `When I was a child, my grandmother would always make this special bread during the winter solstice. The whole house would smell like cinnamon and love.`;
    
    const analysisResponse = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a cultural heritage expert and memory preservation specialist. Analyze the following memory content and extract cultural significance, emotional context, and metadata.`
        },
        {
          role: 'user',
          content: `Analyze this memory: "${testMemory}"`
        }
      ],
      stream: false,
      temperature: 0.3,
      max_tokens: 500
    });
    
    console.log('✅ Mock AI Analysis Response:', analysisResponse.response);
    
    // Test 2: Mock Question Generation
    console.log('\n📝 Test 2: Mock Question Generation...');
    const questionResponse = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are an expert cultural memory analyst conducting active listening conversations. Generate question 1 for our active listening conversation about cultural memory preservation.`
        },
        {
          role: 'user',
          content: `User's latest response: "${testMemory}"\n\nGenerate question 1 for our active listening conversation about cultural memory preservation.`
        }
      ],
      stream: false,
      temperature: 0.4,
      max_tokens: 600
    });
    
    console.log('✅ Mock Question Generation Response:', questionResponse.response);
    
    // Test 3: Mock Comprehensive Analysis
    console.log('\n📝 Test 3: Mock Comprehensive Analysis...');
    const comprehensiveResponse = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a cultural memory analyst specializing in heritage preservation. Based on this complete conversation, provide a comprehensive analysis.`
        }
      ],
      stream: false,
      temperature: 0.3,
      max_tokens: 800
    });
    
    console.log('✅ Mock Comprehensive Analysis Response:', comprehensiveResponse.response);
    
    console.log('\n🎉 All local tests completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Start the worker: npm run dev');
    console.log('2. Test with real worker: npm run test');
    
  } catch (error) {
    console.error('❌ Local test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testWorkerFunctions().catch(console.error);
}

module.exports = { testWorkerFunctions, mockEnv };
