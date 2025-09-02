import { NextRequest, NextResponse } from 'next/server';

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

interface StartRequest {
  action: 'start';
  content: string;
  userId?: string;
}

interface ListenRequest {
  action: 'listen';
  queryId: string;
  content: string;
  conversationHistory: ConversationTurn[];
}

interface AnalyzeRequest {
  action: 'analyze';
  queryId: string;
  conversationHistory: ConversationTurn[];
}

type RequestBody = StartRequest | ListenRequest | AnalyzeRequest;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    
    // Get the Cloudflare Worker URL from environment variables
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
    
    if (!workerUrl) {
      console.error('CLOUDFLARE_WORKER_URL environment variable not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Forward the request to the Cloudflare AI Worker
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: body.action,
        queryId: 'action' in body && body.action === 'start' ? undefined : (body as ListenRequest | AnalyzeRequest).queryId,
        content: 'content' in body ? body.content : undefined,
        userId: 'userId' in body ? body.userId : undefined,
        conversationHistory: 'conversationHistory' in body ? body.conversationHistory : []
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Worker error: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Conversation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET endpoint for retrieving conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('queryId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!queryId) {
      return NextResponse.json(
        { error: 'QueryId is required' },
        { status: 400 }
      );
    }

    // In a production system, you would query your database here
    // For now, return a placeholder response
    return NextResponse.json({
      queryId,
      conversations: [],
      pagination: {
        limit,
        offset,
        total: 0
      }
    });

  } catch (error: any) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversation history' },
      { status: 500 }
    );
  }
}