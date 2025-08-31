import { NextResponse } from 'next/server';
import { withOptionalAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

interface AnalyzeMemoryRequest {
  content: string;
  culturalContext: string[];
  language: string;
  userId?: string;
}

interface AIAnalysisResponse {
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

async function analyzeMemoryHandler(request: AuthenticatedRequest) {
  try {
    const body: AnalyzeMemoryRequest = await request.json();
    const { content, culturalContext, language } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get user context if authenticated
    let userContext = null;
    if (request.user) {
      userContext = {
        culturalBackground: request.user.culturalBackground,
        isVerified: request.user.isVerified,
      };
    }

    // Enhanced AI analysis with user context
    const analysis: AIAnalysisResponse = await performAIAnalysis(content, culturalContext, language, userContext);

    // Store analysis result if user is authenticated
    if (request.user) {
      await storeAnalysisResult(request.user.id, content, analysis);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Memory analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze memory' },
      { status: 500 }
    );
  }
}

async function performAIAnalysis(
  content: string,
  culturalContext: string[],
  language: string,
  userContext: { culturalBackground?: string; isVerified?: boolean } | null
): Promise<AIAnalysisResponse> {
  // Enhanced analysis based on user context
  const culturalElements = extractCulturalElements(content, userContext?.culturalBackground);
  const emotionalSignificance = analyzeEmotionalContent(content);
          const culturalPractices = identifyCulturalPractices(content);
  const peopleIdentified = extractPeople(content);
  const locationContext = extractLocation(content);
  const temporalContext = extractTemporalContext(content);
  const culturalSignificanceScore = calculateCulturalSignificance(content, culturalElements, userContext);
          const suggestedTags = generateTags(content, culturalElements);
  
  const metadata = {
    title: generateTitle(content),
    category: categorizeMemory(content, culturalElements),
    culturalHeritage: culturalElements,
  };

  return {
    culturalElements,
    emotionalSignificance,
    culturalPractices,
    peopleIdentified,
    locationContext,
    temporalContext,
    culturalSignificanceScore,
    suggestedTags,
    metadata,
  };
}

function extractCulturalElements(content: string, userCulturalBackground?: string): string[] {
  const elements: string[] = [];
  
  // Extract cultural elements based on content
  if (content.toLowerCase().includes('family') || content.toLowerCase().includes('ancestor')) {
    elements.push('Family Heritage');
  }
  if (content.toLowerCase().includes('tradition') || content.toLowerCase().includes('custom')) {
    elements.push('Cultural Traditions');
  }
  if (content.toLowerCase().includes('recipe') || content.toLowerCase().includes('food')) {
    elements.push('Culinary Heritage');
  }
  if (content.toLowerCase().includes('language') || content.toLowerCase().includes('dialect')) {
    elements.push('Linguistic Heritage');
  }
  if (content.toLowerCase().includes('music') || content.toLowerCase().includes('dance')) {
    elements.push('Artistic Heritage');
  }
  
      // Add user's cultural background if available
    if (userCulturalBackground) {
      try {
        const background = JSON.parse(userCulturalBackground);
        if (Array.isArray(background)) {
          elements.push(...background);
        }
      } catch {
        // If parsing fails, add as single element
        elements.push(userCulturalBackground);
      }
    }
  
  return [...new Set(elements)];
}

function analyzeEmotionalContent(content: string): string {
  const emotionalKeywords = {
    joy: ['happy', 'joy', 'celebration', 'wonderful', 'amazing', 'beautiful'],
    nostalgia: ['remember', 'childhood', 'past', 'memory', 'nostalgic', 'miss'],
    love: ['love', 'care', 'family', 'heart', 'dear', 'beloved'],
    pride: ['proud', 'achievement', 'success', 'accomplishment', 'honor'],
    gratitude: ['thankful', 'grateful', 'blessed', 'appreciate', 'fortunate'],
    reverence: ['sacred', 'holy', 'spiritual', 'religious', 'divine', 'blessed']
  };

  const contentLower = content.toLowerCase();
  let maxScore = 0;
  let dominantEmotion = 'meaningful';

  for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
    const score = keywords.filter(keyword => contentLower.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion;
    }
  }

  return dominantEmotion;
}

function identifyCulturalPractices(content: string): string[] {
  const practices: string[] = [];
  
  if (content.toLowerCase().includes('ceremony') || content.toLowerCase().includes('ritual')) {
    practices.push('Ceremonial Practices');
  }
  if (content.toLowerCase().includes('festival') || content.toLowerCase().includes('celebration')) {
    practices.push('Festival Celebrations');
  }
  if (content.toLowerCase().includes('prayer') || content.toLowerCase().includes('meditation')) {
    practices.push('Spiritual Practices');
  }
  if (content.toLowerCase().includes('craft') || content.toLowerCase().includes('artisan')) {
    practices.push('Traditional Crafts');
  }
  
  return practices;
}

function extractPeople(content: string): string[] {
  const people: string[] = [];
  const peopleKeywords = ['grandmother', 'grandfather', 'mother', 'father', 'aunt', 'uncle', 'sister', 'brother'];
  
  peopleKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) {
      people.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  return people;
}

function extractLocation(content: string): string | undefined {
  const locationKeywords = ['village', 'town', 'city', 'country', 'home', 'house', 'temple', 'church'];
  
  for (const keyword of locationKeywords) {
    if (content.toLowerCase().includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  return undefined;
}

function extractTemporalContext(content: string): string | undefined {
  const temporalKeywords = ['childhood', 'youth', 'young', 'old', 'ancient', 'traditional', 'modern'];
  
  for (const keyword of temporalKeywords) {
    if (content.toLowerCase().includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  return undefined;
}

function calculateCulturalSignificance(content: string, culturalElements: string[], userContext: { culturalBackground?: string; isVerified?: boolean } | null): number {
  let score = 0.5; // Base score
  
  // Increase score based on cultural elements found
  score += culturalElements.length * 0.1;
  
  // Increase score if user has cultural background
  if (userContext?.culturalBackground) {
    score += 0.2;
  }
  
  // Increase score for verified users
  if (userContext?.isVerified) {
    score += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(score, 1.0);
}

function generateTags(content: string, culturalElements: string[]): string[] {
  const tags = [...culturalElements];
  
  // Add content-based tags
  if (content.toLowerCase().includes('family')) tags.push('Family');
  if (content.toLowerCase().includes('heritage')) tags.push('Heritage');
  if (content.toLowerCase().includes('memory')) tags.push('Memory');
  if (content.toLowerCase().includes('story')) tags.push('Story');
  
  return [...new Set(tags)];
}

function generateTitle(content: string): string {
  const sentences = content.split(/[.!?]+/);
  const firstSentence = sentences[0]?.trim();
  
  if (firstSentence && firstSentence.length > 10) {
    return firstSentence.substring(0, 50) + (firstSentence.length > 50 ? '...' : '');
  }
  
  return 'Cultural Memory';
}

function categorizeMemory(content: string, culturalElements: string[]): string {
  if (culturalElements.includes('Culinary Heritage')) return 'Food & Recipes';
  if (culturalElements.includes('Artistic Heritage')) return 'Arts & Culture';
  if (culturalElements.includes('Linguistic Heritage')) return 'Language & Communication';
  if (culturalElements.includes('Family Heritage')) return 'Family History';
  if (culturalElements.includes('Cultural Traditions')) return 'Traditions & Customs';
  
  return 'Cultural Heritage';
}

async function storeAnalysisResult(userId: string, content: string, analysis: AIAnalysisResponse) {
  try {
    // Store the analysis result in a new table (you can create this table)
    // For now, we'll just log it
    console.log(`Storing analysis result for user ${userId}:`, {
      content: content.substring(0, 100) + '...',
      culturalElements: analysis.culturalElements,
      culturalSignificanceScore: analysis.culturalSignificanceScore,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to store analysis result:', error);
  }
}

export const POST = withOptionalAuth(analyzeMemoryHandler);
