/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST, GET, OPTIONS } from '@/app/api/ai/conversation/route';
import { getServerSession } from 'next-auth/next';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/auth/config', () => ({
  authConfig: {}
}));

// Mock fetch
global.fetch = jest.fn();

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('/api/ai/conversation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock session
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User'
      }
    } as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({ action: 'start', content: 'test' }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('returns 400 when action is missing', async () => {
      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({ content: 'test' }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Action is required');
    });

    it('returns 400 when content is missing for start action', async () => {
      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({ action: 'start' }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Content is required for starting a conversation');
    });

    it('returns 400 when queryId is missing for listen action', async () => {
      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({ action: 'listen', content: 'test' }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('QueryId is required for listen and analyze actions');
    });

    it('successfully starts conversation', async () => {
      const mockWorkerResponse = {
        queryId: 'test-query-id',
        status: 'listening',
        stage: 1,
        totalStages: 3,
        question: 'How does this memory make you feel?',
        followUpReason: 'I want to understand the emotional significance',
        emotionalTone: 'curious',
        culturalCues: ['tradition'],
        message: "I'm listening to understand your experience better...",
        action: 'continue'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkerResponse
      });

      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          content: 'My grandmother made special bread during winter solstice.'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.queryId).toBe('test-query-id');
      expect(data.status).toBe('listening');
      expect(data.question).toBe('How does this memory make you feel?');
      expect(data.userId).toBe('test-user-1');
      expect(data.timestamp).toBeDefined();
      expect(data.sessionId).toBe('test-user-1');
    });

    it('successfully continues conversation', async () => {
      const mockWorkerResponse = {
        queryId: 'test-query-id',
        status: 'listening',
        stage: 2,
        totalStages: 3,
        question: 'Can you tell me about the cultural significance?',
        followUpReason: 'I want to understand the cultural context',
        emotionalTone: 'respectful',
        culturalCues: ['heritage', 'tradition'],
        message: "I'm really listening to understand your cultural background...",
        action: 'continue'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkerResponse
      });

      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({
          action: 'listen',
          queryId: 'test-query-id',
          content: 'It makes me feel connected to my heritage.',
          conversationHistory: [
            { speaker: 'user', content: 'My grandmother made special bread during winter solstice.' },
            { speaker: 'ai', content: 'How does this memory make you feel?', stage: 1 }
          ]
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.queryId).toBe('test-query-id');
      expect(data.status).toBe('listening');
      expect(data.stage).toBe(2);
      expect(data.question).toBe('Can you tell me about the cultural significance?');
    });

    it('successfully completes analysis', async () => {
      const mockAnalysisResult = {
        culturalElements: ['bread making', 'winter solstice', 'heritage'],
        emotionalSignificance: 'deeply meaningful connection to ancestors',
        culturalPractices: ['seasonal bread making', 'family traditions'],
        peopleIdentified: ['grandmother'],
        locationContext: 'family home',
        temporalContext: 'winter solstice',
        culturalSignificanceScore: 0.92,
        suggestedTags: ['heritage', 'tradition', 'family', 'bread', 'solstice'],
        metadata: {
          title: 'Grandmother\'s Winter Solstice Bread Tradition',
          category: 'Family Heritage',
          culturalHeritage: ['bread making traditions', 'seasonal celebrations']
        },
        activeListeningInsights: 'Strong emotional connection to ancestral traditions passed down through food preparation',
        conversationQuality: 0.9,
        confidenceScore: 0.88
      };

      const mockWorkerResponse = {
        queryId: 'test-query-id',
        status: 'completed',
        stage: 4,
        totalStages: 3,
        analysis: mockAnalysisResult,
        message: '✨ Analysis complete! Thank you for sharing your cultural memory with me.',
        action: 'complete'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkerResponse
      });

      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze',
          queryId: 'test-query-id',
          conversationHistory: [
            { speaker: 'user', content: 'My grandmother made special bread during winter solstice.' },
            { speaker: 'ai', content: 'How does this memory make you feel?', stage: 1 },
            { speaker: 'user', content: 'It makes me feel connected to my heritage.' },
            { speaker: 'ai', content: 'Can you tell me about the cultural significance?', stage: 2 },
            { speaker: 'user', content: 'It was a tradition passed down through generations.' }
          ]
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.queryId).toBe('test-query-id');
      expect(data.status).toBe('completed');
      expect(data.analysis).toEqual(mockAnalysisResult);
      expect(data.message).toContain('Analysis complete');
    });

    it('handles worker service unavailable error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce({
        code: 'ECONNREFUSED'
      });

      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          content: 'Test memory'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Unable to connect to AI service');
      expect(data.details).toBe('The AI worker is temporarily unavailable');
    });

    it('handles worker error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'AI processing failed', details: 'Model timeout' })
      });

      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          content: 'Test memory'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process conversation');
      expect(data.details).toBe('AI processing failed');
      expect(data.workerStatus).toBe(500);
    });

    it('handles invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('calls worker with correct parameters', async () => {
      const mockWorkerResponse = {
        queryId: 'test-query-id',
        status: 'listening',
        stage: 1
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkerResponse
      });

      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          content: 'Test memory',
          queryId: 'custom-query-id'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      await POST(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String), // Worker URL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Etherith-Frontend/1.0'
          },
          body: JSON.stringify({
            action: 'start',
            queryId: 'custom-query-id',
            content: 'Test memory',
            userId: 'test-user-1',
            conversationHistory: []
          })
        }
      );
    });

    it('handles network timeout', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce({
        code: 'ENOTFOUND'
      });

      const request = new NextRequest('http://localhost/api/ai/conversation', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          content: 'Test memory'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Unable to connect to AI service');
    });
  });

  describe('GET', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/ai/conversation?queryId=test');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('returns 400 when queryId is missing', async () => {
      const request = new NextRequest('http://localhost/api/ai/conversation');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('QueryId is required');
    });

    it('returns conversation history successfully', async () => {
      const request = new NextRequest('http://localhost/api/ai/conversation?queryId=test-query&limit=25&offset=10');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.queryId).toBe('test-query');
      expect(data.conversations).toEqual([]);
      expect(data.pagination).toEqual({
        limit: 25,
        offset: 10,
        total: 0
      });
    });

    it('uses default pagination parameters', async () => {
      const request = new NextRequest('http://localhost/api/ai/conversation?queryId=test-query');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toEqual({
        limit: 50,
        offset: 0,
        total: 0
      });
    });

    it('handles GET request errors', async () => {
      mockGetServerSession.mockRejectedValueOnce(new Error('Session error'));
      
      const request = new NextRequest('http://localhost/api/ai/conversation?queryId=test');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to retrieve conversation history');
    });
  });

  describe('OPTIONS', () => {
    it('returns CORS headers', async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });
  });
});