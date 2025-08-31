import { Ai } from '@cloudflare/ai';

export interface MemoryAnalysisRequest {
  content: string;
  culturalContext?: string[];
  language?: string;
  userId: string;
}

export interface MemoryAnalysisResponse {
  culturalElements: string[];
  emotionalSignificance: string;
  culturalPractices: string[];
  peopleIdentified: string[];
  locationContext?: string;
  temporalContext?: string;
  culturalSignificanceScore: number;
  suggestedTags: string[];
  metadata: {
    title?: string;
    category?: string;
    culturalHeritage?: string[];
  };
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { content, culturalContext, language, userId }: MemoryAnalysisRequest = await request.json();
      
      const ai = new Ai(env.AI);
      
      // Use Cloudflare's @cf/meta/llama-3.1-8b-instruct model for analysis
      const analysis = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: `You are a cultural heritage expert and memory preservation specialist. Analyze the following memory content and extract cultural significance, emotional context, and metadata. Focus on preserving cultural authenticity and identifying heritage elements.`
          },
          {
            role: 'user',
            content: `Analyze this memory: "${content}"${culturalContext ? `\nCultural context: ${culturalContext.join(', ')}` : ''}${language ? `\nLanguage: ${language}` : ''}`
          }
        ],
        stream: false
      });

      // Process AI response and structure it
      const structuredAnalysis: MemoryAnalysisResponse = {
        culturalElements: extractCulturalElements(analysis.response),
        emotionalSignificance: extractEmotionalSignificance(analysis.response),
        culturalPractices: extractCulturalPractices(analysis.response),
        peopleIdentified: extractPeople(analysis.response),
        locationContext: extractLocation(analysis.response),
        temporalContext: extractTemporal(analysis.response),
        culturalSignificanceScore: calculateCulturalScore(analysis.response),
        suggestedTags: generateTags(analysis.response),
        metadata: generateMetadata(analysis.response)
      };

      return new Response(JSON.stringify(structuredAnalysis), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('AI Analysis error:', error);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// Helper functions for processing AI responses
function extractCulturalElements(response: string): string[] {
  // Implementation to parse AI response and extract cultural elements
  const culturalKeywords = ['tradition', 'culture', 'heritage', 'custom', 'ritual', 'ceremony', 'belief', 'value'];
  return culturalKeywords.filter(keyword => response.toLowerCase().includes(keyword));
}

function extractEmotionalSignificance(response: string): string {
  // Implementation to extract emotional significance
  const emotionalKeywords = ['joy', 'sadness', 'love', 'fear', 'anger', 'surprise', 'disgust', 'trust', 'anticipation'];
  const found = emotionalKeywords.find(keyword => response.toLowerCase().includes(keyword));
  return found || 'significant';
}

function extractCulturalPractices(response: string): string[] {
  // Implementation to extract cultural practices
  const practiceKeywords = ['ceremony', 'ritual', 'celebration', 'tradition', 'custom', 'practice', 'observance'];
  return practiceKeywords.filter(keyword => response.toLowerCase().includes(keyword));
}

function extractPeople(response: string): string[] {
  // Implementation to extract people mentioned
  const peopleKeywords = ['family', 'mother', 'father', 'grandmother', 'grandfather', 'sister', 'brother', 'friend'];
  return peopleKeywords.filter(keyword => response.toLowerCase().includes(keyword));
}

function extractLocation(response: string): string | undefined {
  // Implementation to extract location context
  const locationKeywords = ['home', 'village', 'city', 'country', 'temple', 'church', 'mosque', 'school'];
  const found = locationKeywords.find(keyword => response.toLowerCase().includes(keyword));
  return found;
}

function extractTemporal(response: string): string | undefined {
  // Implementation to extract temporal context
  const temporalKeywords = ['childhood', 'youth', 'adulthood', 'morning', 'evening', 'summer', 'winter', 'holiday'];
  const found = temporalKeywords.find(keyword => response.toLowerCase().includes(keyword));
  return found;
}

function calculateCulturalScore(response: string): number {
  // Implementation to calculate cultural significance score (0-1)
  const culturalIndicators = ['tradition', 'culture', 'heritage', 'custom', 'ritual', 'ceremony', 'belief', 'value'];
  const found = culturalIndicators.filter(keyword => response.toLowerCase().includes(keyword));
  return Math.min(found.length / culturalIndicators.length, 1);
}

function generateTags(response: string): string[] {
  // Implementation to generate relevant tags
  const allKeywords = [
    'family', 'tradition', 'culture', 'heritage', 'memory', 'childhood', 'celebration',
    'ritual', 'custom', 'belief', 'value', 'emotion', 'location', 'time'
  ];
  return allKeywords.filter(keyword => response.toLowerCase().includes(keyword));
}

function generateMetadata(response: string): any {
  // Implementation to generate metadata
  const category = response.toLowerCase().includes('family') ? 'Family' : 
                   response.toLowerCase().includes('tradition') ? 'Cultural' : 'Personal';
  
  return {
    title: `Memory Analysis - ${category}`,
    category,
    culturalHeritage: extractCulturalElements(response)
  };
}
