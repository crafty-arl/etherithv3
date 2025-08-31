export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      const { content, culturalContext = [], language = 'en', userId } = body;

      if (!content) {
        return new Response('Content is required', { status: 400 });
      }

      // Use Cloudflare Workers AI to analyze the memory
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: `You are a cultural memory analyzer. Analyze the following memory text and extract:
            - Cultural elements and practices
            - Emotional significance
            - People mentioned
            - Location context
            - Temporal context
            - Cultural significance score (0-1)
            - Suggested tags
            - Metadata (title, category, cultural heritage)
            
            Respond with a JSON object containing these fields.`
          },
          {
            role: 'user',
            content: `Analyze this memory: "${content}"`
          }
        ],
        stream: false
      });

      // Parse the AI response and extract structured data
      const aiResponse = response.response as string;
      
      // Try to parse JSON from the AI response, fallback to structured extraction
      let analysis;
      try {
        analysis = JSON.parse(aiResponse);
      } catch {
        // Fallback: extract information using regex patterns
        analysis = extractStructuredData(aiResponse, content);
      }

      return new Response(JSON.stringify(analysis), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('AI analysis error:', error);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: error.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};

function extractStructuredData(aiResponse: string, originalContent: string) {
  // Fallback structured data extraction
  const culturalElements = extractCulturalElements(originalContent);
  const emotionalSignificance = extractEmotionalSignificance(originalContent);
  const culturalPractices = extractCulturalPractices(originalContent);
  const peopleIdentified = extractPeople(originalContent);
  const locationContext = extractLocation(originalContent);
  const temporalContext = extractTemporal(originalContent);
  const culturalSignificanceScore = calculateCulturalScore(originalContent);
  const suggestedTags = generateTags(originalContent);

  return {
    culturalElements,
    emotionalSignificance,
    culturalPractices,
    peopleIdentified,
    locationContext,
    temporalContext,
    culturalSignificanceScore,
    suggestedTags,
    metadata: {
      title: generateTitle(originalContent),
      category: determineCategory(originalContent),
      culturalHeritage: culturalElements
    }
  };
}

function extractCulturalElements(content: string): string[] {
  const culturalKeywords = ['tradition', 'culture', 'heritage', 'custom', 'ritual', 'ceremony', 'belief', 'value', 'ancestral', 'tribal', 'indigenous'];
  return culturalKeywords.filter(keyword => content.toLowerCase().includes(keyword));
}

function extractEmotionalSignificance(content: string): string {
  const emotionalKeywords = ['joy', 'sadness', 'love', 'fear', 'anger', 'surprise', 'disgust', 'trust', 'anticipation', 'pride', 'gratitude', 'nostalgia'];
  const found = emotionalKeywords.find(keyword => content.toLowerCase().includes(keyword));
  return found || 'significant';
}

function extractCulturalPractices(content: string): string[] {
  const practiceKeywords = ['ceremony', 'ritual', 'celebration', 'tradition', 'custom', 'practice', 'observance', 'festival', 'gathering', 'worship'];
  return practiceKeywords.filter(keyword => content.toLowerCase().includes(keyword));
}

function extractPeople(content: string): string[] {
  const peopleKeywords = ['family', 'mother', 'father', 'grandmother', 'grandfather', 'sister', 'brother', 'friend', 'ancestor', 'elder', 'community'];
  return peopleKeywords.filter(keyword => content.toLowerCase().includes(keyword));
}

function extractLocation(content: string): string | undefined {
  const locationKeywords = ['home', 'village', 'city', 'country', 'temple', 'church', 'mosque', 'school', 'land', 'territory', 'sacred'];
  const found = locationKeywords.find(keyword => content.toLowerCase().includes(keyword));
  return found;
}

function extractTemporal(content: string): string | undefined {
  const temporalKeywords = ['childhood', 'youth', 'adulthood', 'morning', 'evening', 'summer', 'winter', 'holiday', 'season', 'era', 'generation'];
  const found = temporalKeywords.find(keyword => content.toLowerCase().includes(keyword));
  return found;
}

function calculateCulturalScore(content: string): number {
  const culturalIndicators = ['tradition', 'culture', 'heritage', 'custom', 'ritual', 'ceremony', 'belief', 'value', 'ancestral', 'tribal', 'indigenous'];
  const found = culturalIndicators.filter(keyword => content.toLowerCase().includes(keyword));
  return Math.min(found.length / culturalIndicators.length, 1);
}

function generateTags(content: string): string[] {
  const allKeywords = [
    'family', 'tradition', 'culture', 'heritage', 'memory', 'childhood', 'celebration',
    'ritual', 'custom', 'belief', 'value', 'emotion', 'location', 'time', 'ancestral',
    'tribal', 'indigenous', 'sacred', 'spiritual', 'community'
  ];
  return allKeywords.filter(keyword => content.toLowerCase().includes(keyword));
}

function generateTitle(content: string): string {
  if (content.toLowerCase().includes('family')) return 'Family Memory';
  if (content.toLowerCase().includes('tradition')) return 'Cultural Tradition';
  if (content.toLowerCase().includes('childhood')) return 'Childhood Memory';
  if (content.toLowerCase().includes('ceremony')) return 'Ceremonial Memory';
  return 'Cultural Memory';
}

function determineCategory(content: string): string {
  if (content.toLowerCase().includes('family')) return 'Family';
  if (content.toLowerCase().includes('tradition')) return 'Cultural';
  if (content.toLowerCase().includes('ceremony')) return 'Ceremonial';
  if (content.toLowerCase().includes('childhood')) return 'Personal';
  return 'Cultural';
}
