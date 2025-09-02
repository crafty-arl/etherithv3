import { Ai } from '@cloudflare/ai';

export interface Env {
  AI: Ai;
  DB: D1Database;
}

interface ConversationTurn {
  speaker: 'user' | 'ai';
  content: string;
  messageType?: 'memory' | 'question' | 'answer' | 'reflection' | 'analysis';
  followUpReason?: string;
  emotionalTone?: string;
  culturalCues?: string[];
  timestamp?: string;
  stage?: number;
}

interface ActiveListeningQuestion {
  question: string;
  followUpReason: string;
  emotionalTone: string;
  culturalCues: string[];
  stage: number;
}

interface AnalysisResult {
  culturalElements: string[];
  emotionalSignificance: string;
  culturalPractices: string[];
  peopleIdentified: string[];
  locationContext?: string;
  temporalContext?: string;
  culturalSignificanceScore: number;
  suggestedTags: string[];
  metadata: {
    title: string;
    category: string;
    culturalHeritage: string[];
  };
  activeListeningInsights?: string;
  conversationQuality?: number;
  confidenceScore?: number;
}

interface RequestBody {
  action: 'start' | 'listen' | 'analyze';
  queryId?: string;
  content?: string;
  userId?: string;
  conversationHistory?: ConversationTurn[];
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    try {
      const body: RequestBody = await request.json();
      const { action, queryId, content, userId, conversationHistory = [] } = body;

      let result;
      switch (action) {
        case 'start':
          result = await this.startActiveListening(env, { queryId, content, userId });
          break;
        case 'listen':
          result = await this.processUserResponse(env, { queryId, content, userId, conversationHistory });
          break;
        case 'analyze':
          result = await this.performFinalAnalysis(env, { queryId, userId, conversationHistory });
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action. Use: start, listen, or analyze' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error: any) {
      console.error('AI analysis error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'AI analysis failed', 
          details: error.message,
          action: 'error'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  },

  async startActiveListening(env: Env, params: { queryId?: string; content?: string; userId?: string }) {
    const { queryId, content, userId } = params;
    
    if (!content) {
      throw new Error('Content is required');
    }
    
    try {
      // First, analyze the initial memory content
      const initialAnalysis = await this.analyzeMemoryContent(env.AI, content);
      
      // Generate the first active listening question
      const question = await this.generateActiveListeningQuestion(env.AI, content, [], 1);
      
      // Generate a unique queryId if none provided
      const generatedQueryId = queryId || `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        queryId: generatedQueryId,
        stage: 1,
        totalStages: 3,
        question: question.question,
        followUpReason: question.followUpReason,
        emotionalTone: question.emotionalTone,
        culturalCues: question.culturalCues
      };
          } catch (error) {
        console.error('Failed to start active listening:', error);
        const generatedQueryId = queryId || `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return this.generateFallbackQuestion(content, 1, generatedQueryId);
      }
  },

  async processUserResponse(env: Env, params: { queryId?: string; content?: string; userId?: string; conversationHistory: ConversationTurn[] }) {
    const { queryId, content, conversationHistory } = params;
    
    if (!content) {
      throw new Error('Content is required');
    }
    
    try {
      // Analyze the user's response
      const responseAnalysis = await this.analyzeUserResponse(env.AI, content, conversationHistory);
      
      // Determine if we're ready for final analysis
      const currentStage = conversationHistory.filter((turn: ConversationTurn) => turn.speaker === 'ai' && turn.stage).length;
      
      if (currentStage >= 3) {
        return {
          status: 'ready_for_analysis',
          stage: 4
        };
      } else {
        // Continue with more questions
        const nextStage = currentStage + 1;
        const question = await this.generateActiveListeningQuestion(env.AI, content, conversationHistory, nextStage);
        
        return {
          status: 'continue',
          stage: nextStage,
          question: question.question,
          followUpReason: question.followUpReason,
          emotionalTone: question.emotionalTone,
          culturalCues: question.culturalCues
        };
      }
          } catch (error) {
        console.error('Failed to process user response:', error);
        return this.generateFallbackQuestion(content, 2, queryId);
      }
  },

  async performFinalAnalysis(env: Env, params: { queryId?: string; userId?: string; conversationHistory: ConversationTurn[] }) {
    const { queryId, userId, conversationHistory } = params;
    
    try {
      // Perform comprehensive analysis
      const analysis = await this.generateComprehensiveAnalysis(env.AI, conversationHistory);
      
      // Generate conclusion message
      const message = this.generateConclusionMessage(analysis, conversationHistory);
      
      return {
        analysis,
        message
      };
    } catch (error) {
      console.error('Failed to perform final analysis:', error);
      return {
        analysis: this.generateFallbackAnalysis(conversationHistory.map((turn: ConversationTurn) => turn.content)),
        message: "Thank you for sharing your memory. I've analyzed our conversation and identified several cultural elements and emotional significance."
      };
    }
  },

  async analyzeMemoryContent(ai: Ai, content: string) {
    try {
      const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: `You are a cultural heritage expert and memory preservation specialist. Analyze the following memory content and extract cultural significance, emotional context, and metadata. Focus on preserving cultural authenticity and identifying heritage elements.

Your task is to analyze a personal memory and identify:
1. Cultural elements and practices mentioned
2. Emotional significance and tone
3. People and relationships
4. Location and temporal context
5. Cultural heritage indicators

Respond with JSON only, following this exact format:
{
  "culturalCues": ["element1", "element2"],
  "emotionalTone": "primary emotion detected",
  "culturalSignificance": 0.85,
  "peopleIdentified": ["person1", "person2"],
  "locationContext": "location if mentioned",
  "temporalContext": "time period if mentioned"
}`
          },
          {
            role: 'user',
            content: `Analyze this memory: "${content}"`
          }
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 500
      });

      const aiResponse = response.response as string;
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(aiResponse);
        return {
          culturalCues: parsed.culturalCues || [],
          emotionalTone: parsed.emotionalTone || 'reflective',
          culturalSignificance: parsed.culturalSignificance || 0.5,
          peopleIdentified: parsed.peopleIdentified || [],
          locationContext: parsed.locationContext || undefined,
          temporalContext: parsed.temporalContext || undefined
        };
      } catch (parseError) {
        // Fallback to text analysis if JSON parsing fails
        return this.extractFallbackAnalysis(aiResponse);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.generateFallbackAnalysis([content]);
    }
  },

  async generateActiveListeningQuestion(ai: Ai, userInput: string, conversationHistory: ConversationTurn[], questionNumber: number): Promise<ActiveListeningQuestion> {
    try {
      const context = conversationHistory.length > 0 
        ? `Previous conversation: ${conversationHistory.map((turn: ConversationTurn) => `${turn.speaker}: ${turn.content}`).join('\n')}`
        : 'This is the first question about the memory.';

      const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: `You are an expert cultural memory analyst conducting active listening conversations. Your role is to ask thoughtful, culturally sensitive follow-up questions that help preserve and understand cultural heritage.

You are currently at question ${questionNumber} of 3 in an active listening session. Each question should build upon previous responses and explore deeper cultural and emotional dimensions.

Question ${questionNumber} focus areas:
- Stage 1: Emotional depth, personal connection, and initial cultural context
- Stage 2: Cultural traditions, timing, and family dynamics  
- Stage 3: Cultural significance, family legacy, and preservation importance

Generate a question that:
1. Shows you've listened to and understood the previous responses
2. Explores cultural elements mentioned
3. Demonstrates emotional intelligence
4. Encourages detailed, meaningful responses
5. Respects cultural sensitivity

Respond with JSON only:
{
  "question": "Your thoughtful follow-up question",
  "followUpReason": "Brief explanation of why this question is important",
  "emotionalTone": "emotional tone you detected in the response",
  "culturalCues": ["cultural elements you noticed"],
  "stage": ${questionNumber}
}`
          },
          {
            role: 'user',
            content: `User's latest response: "${userInput}"

${context}

Generate question ${questionNumber} for our active listening conversation about cultural memory preservation.`
          }
        ],
        stream: false,
        temperature: 0.4,
        max_tokens: 600
      });

      const aiResponse = response.response as string;
      
      try {
        const parsed = JSON.parse(aiResponse);
        return {
          question: parsed.question || this.generateFallbackQuestion(userInput, questionNumber).question,
          followUpReason: parsed.followUpReason || "I want to understand this memory better.",
          emotionalTone: parsed.emotionalTone || "reflective",
          culturalCues: parsed.culturalCues || [],
          stage: parsed.stage || questionNumber
        };
      } catch (parseError) {
        return this.generateFallbackQuestion(userInput, questionNumber);
      }
    } catch (error) {
      console.error('Failed to generate AI question:', error);
      return this.generateFallbackQuestion(userInput, questionNumber);
    }
  },

  async generateComprehensiveAnalysis(ai: Ai, conversationHistory: ConversationTurn[]): Promise<AnalysisResult> {
    try {
      const conversationText = conversationHistory
        .map((turn: ConversationTurn) => `${turn.speaker}: ${turn.content}`)
        .join('\n\n');

      const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: `You are a cultural memory analyst specializing in heritage preservation. Based on this complete conversation, provide a comprehensive analysis that captures the cultural significance and emotional depth of the shared memories.

Analyze the conversation and provide detailed insights about:
- Cultural elements and practices discovered
- Emotional significance and depth
- People mentioned and relationships
- Location and temporal context
- Cultural significance score (0-1)
- Suggested tags for categorization
- Overall insights gained through active listening

Conversation context:
${conversationText}

Respond with JSON only, following this exact format:
{
  "culturalElements": ["element1", "element2"],
  "emotionalSignificance": "description of emotional depth",
  "culturalPractices": ["practice1", "practice2"],
  "peopleIdentified": ["person1", "person2"],
  "locationContext": "location context if mentioned",
  "temporalContext": "time period if mentioned",
  "culturalSignificanceScore": 0.95,
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "metadata": {
    "title": "Generated title",
    "category": "Category",
    "culturalHeritage": ["heritage1", "heritage2"]
  },
  "activeListeningInsights": "What was learned through the listening process",
  "conversationQuality": 0.9,
  "confidenceScore": 0.85
}`
          }
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 800
      });

      const aiResponse = response.response as string;
      
      try {
        const parsed = JSON.parse(aiResponse);
        
        // Ensure required fields exist with fallbacks
        return {
          culturalElements: parsed.culturalElements || [],
          emotionalSignificance: parsed.emotionalSignificance || "meaningful and reflective",
          culturalPractices: parsed.culturalPractices || [],
          peopleIdentified: parsed.peopleIdentified || [],
          locationContext: parsed.locationContext || undefined,
          temporalContext: parsed.temporalContext || undefined,
          culturalSignificanceScore: parsed.culturalSignificanceScore || 0.7,
          suggestedTags: parsed.suggestedTags || [],
          metadata: {
            title: parsed.metadata?.title || "Cultural Memory",
            category: parsed.metadata?.category || "Heritage",
            culturalHeritage: parsed.metadata?.culturalHeritage || []
          },
          activeListeningInsights: parsed.activeListeningInsights || "The conversation revealed deep cultural connections.",
          conversationQuality: parsed.conversationQuality || 0.8,
          confidenceScore: parsed.confidenceScore || 0.75
        };
      } catch (parseError) {
        console.error('Failed to parse AI analysis response:', parseError);
        return this.generateFallbackAnalysis(conversationHistory.map((turn: ConversationTurn) => turn.content));
      }
    } catch (error) {
      console.error('AI comprehensive analysis failed:', error);
      return this.generateFallbackAnalysis(conversationHistory.map((turn: ConversationTurn) => turn.content));
    }
  },

  // Fallback methods for when AI fails
  generateFallbackQuestion(content: string, questionNumber: number, queryId?: string): any {
    const questions = {
      1: [
        "What emotions come up for you when you think about this memory? How did it make you feel at the time?",
        "Who else was part of this experience? Tell me about the important people who were there.",
        "Where did this take place? What was special about that location for you and your family?"
      ],
      2: [
        "When did this happen? What was going on in your life or your family's life around that time?",
        "Were there any cultural traditions, customs, or rituals that were part of this experience?",
        "What makes this memory so important to preserve? How has it shaped you or your family?"
      ],
      3: [
        "Can you tell me more about the cultural significance of this memory? What traditions or values does it represent?",
        "How has this memory been passed down in your family? What stories do you remember hearing about it?",
        "What would you want future generations to understand about this memory and its importance?"
      ]
    };
    
    const stageQuestions = questions[questionNumber as keyof typeof questions] || questions[1];
    const question = stageQuestions[Math.floor(Math.random() * stageQuestions.length)];
    
    return {
      queryId: queryId || `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stage: questionNumber,
      totalStages: 3,
      question,
      followUpReason: "I want to understand this memory better.",
      emotionalTone: "reflective",
      culturalCues: []
    };
  },

  generateFallbackAnalysis(memories: string[]): AnalysisResult {
    const memoryText = memories.join(' ');
    
    return {
      culturalElements: this.extractCulturalCues(memoryText),
      emotionalSignificance: "meaningful and reflective",
      culturalPractices: this.extractCulturalPractices(memories),
      peopleIdentified: this.extractPeople(memoryText),
      locationContext: this.extractLocation(memoryText),
      temporalContext: this.extractTimeContext(memoryText),
      culturalSignificanceScore: this.calculateCulturalSignificance(memoryText),
      suggestedTags: this.generateSuggestedTags(memories),
      metadata: {
        title: this.generateTitle(memories),
        category: this.determineCategory(memories),
        culturalHeritage: this.identifyCulturalHeritage(memories)
      },
      activeListeningInsights: "This memory shows deep cultural connections and family bonds.",
      conversationQuality: 0.7,
      confidenceScore: 0.6
    };
  },

  extractFallbackAnalysis(aiResponse: string) {
    // Extract basic information from AI response text
    const culturalCues = this.extractCulturalCues(aiResponse);
    const emotionalTone = this.analyzeEmotionalTone(aiResponse);
    
    return {
      culturalCues,
      emotionalTone,
      culturalSignificance: Math.min(culturalCues.length * 0.2, 0.8),
      peopleIdentified: this.extractPeople(aiResponse),
      locationContext: this.extractLocation(aiResponse),
      temporalContext: this.extractTimeContext(aiResponse)
    };
  },

  // Helper methods for content analysis
  extractCulturalCues(content: string): string[] {
    const culturalKeywords = [
      'tradition', 'culture', 'heritage', 'custom', 'ritual', 'ceremony',
      'family', 'ancestor', 'generation', 'festival', 'celebration', 'holiday',
      'recipe', 'food', 'music', 'dance', 'art', 'craft', 'language',
      'religion', 'spiritual', 'belief', 'value', 'story', 'legend'
    ];
    
    return culturalKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    );
  },

  analyzeEmotionalTone(content: string): string {
    const emotionalKeywords = {
      'joy': ['happy', 'joy', 'excited', 'celebrate', 'wonderful', 'amazing'],
      'nostalgia': ['remember', 'childhood', 'past', 'memory', 'nostalgic', 'miss'],
      'pride': ['proud', 'accomplishment', 'achievement', 'success', 'honor'],
      'love': ['love', 'care', 'family', 'together', 'bond', 'connection'],
      'reverence': ['sacred', 'holy', 'important', 'significant', 'meaningful']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        return emotion;
      }
    }
    
    return 'reflective';
  },

  calculateCulturalSignificance(content: string): number {
    const culturalCues = this.extractCulturalCues(content);
    const baseScore = Math.min(culturalCues.length * 0.2, 0.8);
    const emotionalBonus = content.includes('important') || content.includes('significant') ? 0.2 : 0;
    return Math.min(baseScore + emotionalBonus, 1.0);
  },

  extractPeople(content: string): string[] {
    const peoplePatterns = [
      /\b(mother|mom|mama|mum)\b/gi,
      /\b(father|dad|daddy|papa)\b/gi,
      /\b(grandmother|grandma|nana|granny)\b/gi,
      /\b(grandfather|grandpa|grandad|papa)\b/gi,
      /\b(sister|brother|sibling)\b/gi,
      /\b(aunt|uncle)\b/gi,
      /\b(cousin)\b/gi
    ];
    
    const people: string[] = [];
    peoplePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        people.push(...matches.map(match => match.toLowerCase()));
      }
    });
    
    return [...new Set(people)];
  },

  extractLocation(content: string): string | undefined {
    const locationPatterns = [
      /\b(home|house|kitchen|garden|yard)\b/gi,
      /\b(church|temple|mosque|synagogue)\b/gi,
      /\b(school|university|college)\b/gi,
      /\b(park|beach|mountain|forest)\b/gi,
      /\b(restaurant|cafe|market|shop)\b/gi
    ];
    
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0].toLowerCase();
      }
    }
    
    return undefined;
  },

  extractTimeContext(content: string): string | undefined {
    const timePatterns = [
      /\b(childhood|kid|young)\b/gi,
      /\b(teenager|adolescent|youth)\b/gi,
      /\b(adult|grown|mature)\b/gi,
      /\b(holiday|vacation|summer|winter)\b/gi,
      /\b(birthday|anniversary|wedding)\b/gi
    ];
    
    for (const pattern of timePatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0].toLowerCase();
      }
    }
    
    return undefined;
  },

  extractCulturalPractices(memories: string[]): string[] {
    const practices: string[] = [];
    const practiceKeywords = [
      'cooking', 'baking', 'singing', 'dancing', 'praying', 'meditating',
      'storytelling', 'crafting', 'gardening', 'fishing', 'hunting',
      'celebrating', 'gathering', 'sharing', 'teaching', 'learning'
    ];
    
    practiceKeywords.forEach(keyword => {
      if (memories.some(memory => memory.toLowerCase().includes(keyword))) {
        practices.push(keyword);
      }
    });
    
    return practices;
  },

  generateSuggestedTags(memories: string[]): string[] {
    const tags: string[] = [];
    
    // Extract cultural elements
    const culturalCues = memories.flatMap(memory => this.extractCulturalCues(memory));
    tags.push(...culturalCues.slice(0, 5));
    
    // Extract people
    const people = memories.flatMap(memory => this.extractPeople(memory));
    tags.push(...people.slice(0, 3));
    
    // Extract locations
    const locations = memories
      .map(memory => this.extractLocation(memory))
      .filter(location => location !== undefined) as string[];
    tags.push(...locations.slice(0, 2));
    
    // Extract time contexts
    const timeContexts = memories
      .map(memory => this.extractTimeContext(memory))
      .filter(time => time !== undefined) as string[];
    tags.push(...timeContexts.slice(0, 2));
    
    return [...new Set(tags)].slice(0, 10);
  },

  generateTitle(memories: string[]): string {
    const firstMemory = memories[0] || '';
    const culturalCues = this.extractCulturalCues(firstMemory);
    const people = this.extractPeople(firstMemory);
    
    if (culturalCues.length > 0 && people.length > 0) {
      return `${people[0]}'s ${culturalCues[0]} Memory`;
    } else if (culturalCues.length > 0) {
      return `Cultural ${culturalCues[0]} Memory`;
    } else if (people.length > 0) {
      return `${people[0]}'s Family Memory`;
    }
    
    return "Precious Family Memory";
  },

  determineCategory(memories: string[]): string {
    const culturalCues = memories.flatMap(memory => this.extractCulturalCues(memory));
    
    if (culturalCues.some(cue => ['food', 'recipe', 'cooking'].includes(cue))) {
      return 'Culinary Heritage';
    } else if (culturalCues.some(cue => ['music', 'dance', 'art'].includes(cue))) {
      return 'Artistic Tradition';
    } else if (culturalCues.some(cue => ['religion', 'spiritual', 'belief'].includes(cue))) {
      return 'Spiritual Heritage';
    } else if (culturalCues.some(cue => ['family', 'ancestor', 'generation'].includes(cue))) {
      return 'Family Legacy';
    }
    
    return 'Cultural Memory';
  },

  identifyCulturalHeritage(memories: string[]): string[] {
    const heritageKeywords = [
      'indigenous', 'native', 'aboriginal', 'first nations',
      'african', 'asian', 'european', 'latin american', 'middle eastern',
      'pacific islander', 'caribbean', 'mediterranean'
    ];
    
    return heritageKeywords.filter(keyword => 
      memories.some(memory => memory.toLowerCase().includes(keyword))
    );
  },

  generateConclusionMessage(analysis: AnalysisResult, conversationHistory: ConversationTurn[]): string {
    const userMemories = conversationHistory
      .filter(turn => turn.speaker === 'user')
      .map(turn => turn.content);
    
    const memoryText = userMemories.join(' ');
    
    return `Thank you for sharing such a meaningful memory with me. Through our conversation, I've learned about ${analysis.culturalElements.slice(0, 3).join(', ')}, and I can see how this experience holds deep ${analysis.emotionalSignificance} for you. 

This memory represents ${analysis.metadata.category.toLowerCase()} heritage and carries a cultural significance score of ${(analysis.culturalSignificanceScore * 100).toFixed(0)}%. 

The people you mentioned - ${analysis.peopleIdentified.slice(0, 3).join(', ')} - and the cultural practices like ${analysis.culturalPractices.slice(0, 2).join(', ')} make this a truly valuable piece of your family's story.

I've suggested tags like ${analysis.suggestedTags.slice(0, 5).join(', ')} to help categorize and preserve this memory for future generations. Your willingness to share these details shows the importance of preserving cultural heritage through personal stories.`;
  },

  async analyzeUserResponse(ai: Ai, content: string, conversationHistory: ConversationTurn[]): Promise<any> {
    // For now, use the same analysis as memory content
    return this.analyzeMemoryContent(ai, content);
  }
};