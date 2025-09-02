import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ActiveListeningConversation from '@/components/ActiveListeningConversation';

// Mock fetch
global.fetch = jest.fn();

// Mock session
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User'
      }
    },
    status: 'authenticated'
  })
}));

describe('ActiveListeningConversation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<ActiveListeningConversation />);
    
    expect(screen.getByText('🌟 Share Your Cultural Memory')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...')).toBeInTheDocument();
    expect(screen.getByText('Share & Begin Journey')).toBeInTheDocument();
  });

  it('disables submit button when input is empty', () => {
    render(<ActiveListeningConversation />);
    
    const submitButton = screen.getByText('Share & Begin Journey');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has content', async () => {
    const user = userEvent.setup();
    render(<ActiveListeningConversation />);
    
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    const submitButton = screen.getByText('Share & Begin Journey');
    
    await user.type(textarea, 'My grandmother made special bread during winter solstice.');
    
    expect(submitButton).toBeEnabled();
  });

  it('starts conversation successfully', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      queryId: 'test-query-id',
      status: 'listening',
      stage: 1,
      totalStages: 3,
      question: 'Can you tell me more about how this memory makes you feel?',
      followUpReason: 'I want to understand the emotional significance',
      emotionalTone: 'curious',
      culturalCues: ['tradition', 'heritage']
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<ActiveListeningConversation />);
    
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    const submitButton = screen.getByText('Share & Begin Journey');
    
    await user.type(textarea, 'My grandmother made special bread during winter solstice.');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Stage 1/3')).toBeInTheDocument();
    });
    
    expect(screen.getByText('🤖 Cultural Analyst')).toBeInTheDocument();
    expect(screen.getByText('Can you tell me more about how this memory makes you feel?')).toBeInTheDocument();
    expect(screen.getByText('Why I\'m asking: I want to understand the emotional significance')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ActiveListeningConversation />);
    
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    const submitButton = screen.getByText('Share & Begin Journey');
    
    await user.type(textarea, 'Test memory');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('continues conversation flow', async () => {
    const user = userEvent.setup();
    
    // Mock first response
    const firstResponse = {
      queryId: 'test-query-id',
      status: 'listening',
      stage: 1,
      totalStages: 3,
      question: 'Can you tell me more about how this memory makes you feel?',
      followUpReason: 'I want to understand the emotional significance',
      emotionalTone: 'curious',
      culturalCues: ['tradition']
    };

    // Mock second response
    const secondResponse = {
      queryId: 'test-query-id',
      status: 'listening',
      stage: 2,
      totalStages: 3,
      question: 'Are there cultural traditions connected to this memory?',
      followUpReason: 'I want to understand the cultural context',
      emotionalTone: 'respectful',
      culturalCues: ['heritage', 'tradition']
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => firstResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => secondResponse
      });

    render(<ActiveListeningConversation />);
    
    // Start conversation
    const initialTextarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    await user.type(initialTextarea, 'Test memory');
    await user.click(screen.getByText('Share & Begin Journey'));
    
    await waitFor(() => {
      expect(screen.getByText('Stage 1/3')).toBeInTheDocument();
    });

    // Continue conversation
    const conversationTextarea = screen.getByPlaceholderText('Share your thoughts...');
    await user.type(conversationTextarea, 'It makes me feel connected to my heritage.');
    await user.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Stage 2/3')).toBeInTheDocument();
    });

    expect(screen.getByText('Are there cultural traditions connected to this memory?')).toBeInTheDocument();
  });

  it('moves to analysis after 3 stages', async () => {
    const user = userEvent.setup();
    
    // Mock responses for all 3 stages
    const responses = [
      {
        queryId: 'test-query-id',
        status: 'listening',
        stage: 1,
        totalStages: 3,
        question: 'First question',
        followUpReason: 'First reason'
      },
      {
        queryId: 'test-query-id',
        status: 'listening',
        stage: 2,
        totalStages: 3,
        question: 'Second question',
        followUpReason: 'Second reason'
      },
      {
        queryId: 'test-query-id',
        status: 'ready_for_analysis',
        stage: 4,
        totalStages: 3,
        message: 'Ready for analysis'
      },
      {
        queryId: 'test-query-id',
        status: 'completed',
        stage: 4,
        totalStages: 3,
        analysis: {
          culturalElements: ['heritage', 'tradition'],
          emotionalSignificance: 'deeply meaningful',
          culturalPractices: ['bread making'],
          peopleIdentified: ['grandmother'],
          culturalSignificanceScore: 0.9,
          suggestedTags: ['heritage', 'tradition', 'family'],
          metadata: {
            title: 'Grandmother\'s Bread Tradition',
            category: 'Family Heritage',
            culturalHeritage: ['bread making', 'winter solstice']
          },
          activeListeningInsights: 'Strong connection to ancestral traditions',
          confidenceScore: 0.85
        },
        message: '✨ Analysis complete!'
      }
    ];

    responses.forEach((response, index) => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => response
      });
    });

    render(<ActiveListeningConversation />);
    
    // Start conversation
    const initialTextarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    await user.type(initialTextarea, 'Test memory');
    await user.click(screen.getByText('Share & Begin Journey'));
    
    await waitFor(() => {
      expect(screen.getByText('Stage 1/3')).toBeInTheDocument();
    });

    // Continue through stages
    let conversationTextarea = screen.getByPlaceholderText('Share your thoughts...');
    await user.clear(conversationTextarea);
    await user.type(conversationTextarea, 'Response 1');
    await user.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Stage 2/3')).toBeInTheDocument();
    });

    conversationTextarea = screen.getByPlaceholderText('Share your thoughts...');
    await user.clear(conversationTextarea);
    await user.type(conversationTextarea, 'Response 2');
    await user.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('✨ Analysis Complete!')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText('90%')).toBeInTheDocument(); // Cultural significance score
    expect(screen.getByText('85%')).toBeInTheDocument(); // Confidence score
    expect(screen.getByText('heritage')).toBeInTheDocument(); // Tags
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(<ActiveListeningConversation />);
    
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    
    await user.type(textarea, 'Test memory');
    await user.keyboard('{Enter}');
    
    // Should trigger start conversation
    expect(global.fetch).toHaveBeenCalledWith('/api/ai/conversation', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        action: 'start',
        content: 'Test memory'
      })
    }));
  });

  it('prevents submission during processing', async () => {
    const user = userEvent.setup();
    
    // Mock slow response
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<ActiveListeningConversation />);
    
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    const submitButton = screen.getByText('Share & Begin Journey');
    
    await user.type(textarea, 'Test memory');
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Starting...')).toBeInTheDocument();
  });

  it('calls onAnalysisComplete callback', async () => {
    const onAnalysisComplete = jest.fn();
    const user = userEvent.setup();
    
    const analysisResult = {
      culturalElements: ['test'],
      emotionalSignificance: 'meaningful',
      culturalPractices: [],
      peopleIdentified: [],
      culturalSignificanceScore: 0.8,
      suggestedTags: ['test'],
      metadata: {
        title: 'Test',
        category: 'Test',
        culturalHeritage: []
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        queryId: 'test',
        status: 'completed',
        analysis: analysisResult,
        message: 'Complete'
      })
    });

    render(<ActiveListeningConversation onAnalysisComplete={onAnalysisComplete} />);
    
    // Simulate analysis completion by directly calling performFinalAnalysis
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    await user.type(textarea, 'Test memory');
    
    // Start the conversation to get queryId, then simulate analysis
    await user.click(screen.getByText('Share & Begin Journey'));
    
    await waitFor(() => {
      expect(onAnalysisComplete).toHaveBeenCalledWith(analysisResult);
    });
  });

  it('resets conversation when start over is clicked', async () => {
    const user = userEvent.setup();
    
    render(<ActiveListeningConversation />);
    
    // Simulate error state
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    await user.type(textarea, 'Test memory');
    await user.click(screen.getByText('Share & Begin Journey'));
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Start Over'));
    
    expect(screen.getByText('🌟 Share Your Cultural Memory')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...')).toBeInTheDocument();
  });

  it('displays cultural cues and emotional tones', async () => {
    const user = userEvent.setup();
    
    const mockResponse = {
      queryId: 'test-query-id',
      status: 'listening',
      stage: 1,
      totalStages: 3,
      question: 'Test question',
      followUpReason: 'Test reason',
      emotionalTone: 'curious and empathetic',
      culturalCues: ['tradition', 'heritage', 'family']
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<ActiveListeningConversation />);
    
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    await user.type(textarea, 'Test memory');
    await user.click(screen.getByText('Share & Begin Journey'));
    
    await waitFor(() => {
      expect(screen.getByText('Why I\'m asking: Test reason')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Emotional tone I detected: curious and empathetic')).toBeInTheDocument();
    expect(screen.getByText('Cultural elements noticed: tradition, heritage, family')).toBeInTheDocument();
  });

  it('handles server errors appropriately', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    });

    render(<ActiveListeningConversation />);
    
    const textarea = screen.getByPlaceholderText('Tell me about a memory that holds cultural significance for you...');
    await user.type(textarea, 'Test memory');
    await user.click(screen.getByText('Share & Begin Journey'));
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Internal server error')).toBeInTheDocument();
  });
});