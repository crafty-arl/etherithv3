'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

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

interface StartResponse {
  queryId: string;
  stage: number;
  totalStages: number;
  question: string;
  followUpReason?: string;
  emotionalTone?: string;
  culturalCues?: string[];
}

interface ListenResponse {
  status: 'continue' | 'ready_for_analysis';
  stage: number;
  question?: string;
  followUpReason?: string;
  emotionalTone?: string;
  culturalCues?: string[];
}

interface AnalyzeResponse {
  analysis: AnalysisResult;
  message: string;
}

interface ConversationState {
  queryId: string | null;
  status: 'initial' | 'listening' | 'analyzing' | 'completed' | 'error';
  stage: number;
  totalStages: number;
  error?: string;
}

interface ActiveListeningConversationProps {
  onAnalysisComplete?: (analysis: AnalysisResult) => void;
  className?: string;
  userName?: string;
}

export default function ActiveListeningConversation({ 
  onAnalysisComplete,
  className = '',
  userName 
}: ActiveListeningConversationProps) {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    queryId: null,
    status: 'initial',
    stage: 0,
    totalStages: 3
  });
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const startConversation = async (memory: string) => {
    if (!memory.trim()) return;

    setIsProcessing(true);
    setConversation([]);
    setConversationState(prev => ({ ...prev, error: undefined }));

    try {
      const response = await fetch('/api/ai/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          content: memory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json() as StartResponse;
      
      setConversationState({
        queryId: result.queryId,
        status: 'listening',
        stage: result.stage || 1,
        totalStages: result.totalStages || 3
      });
      
      setConversation([
        { 
          speaker: 'user', 
          content: memory, 
          messageType: 'memory',
          timestamp: new Date().toISOString()
        },
        { 
          speaker: 'ai', 
          content: userName ? `Hi ${userName}! ${result.question}` : result.question, 
          messageType: 'question',
          followUpReason: result.followUpReason,
          emotionalTone: result.emotionalTone,
          culturalCues: result.culturalCues,
          stage: result.stage,
          timestamp: new Date().toISOString()
        }
      ]);

      setUserInput('');
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setConversationState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error.message 
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const submitResponse = async () => {
    if (!userInput.trim() || !conversationState.queryId || isProcessing) return;
    
    console.log('Submitting response for stage:', conversationState.stage, 'with queryId:', conversationState.queryId);
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'listen',
          queryId: conversationState.queryId,
          content: userInput,
          conversationHistory: conversation
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json() as ListenResponse;
      
      console.log('AI Worker Response:', result); // Debug log
      console.log('Current conversation state before update:', conversationState);
      console.log('Conversation length:', conversation.length);
      
      // Add user's response to conversation
      const userMessage: ConversationTurn = {
        speaker: 'user',
        content: userInput,
        messageType: 'answer',
        timestamp: new Date().toISOString()
      };

      if (result.status === 'ready_for_analysis') {
        // Ready for final analysis
        setConversation(prev => [...prev, userMessage]);
        setConversationState(prev => ({
          ...prev,
          status: 'analyzing',
          stage: result.stage || 4
        }));
        
        // Automatically trigger analysis
        await performFinalAnalysis([...conversation, userMessage]);
      } else if (result.status === 'continue') {
        // Continue conversation with next question
        setConversationState(prev => ({
          ...prev,
          stage: result.stage,
          status: 'listening'
        }));

        const aiMessage: ConversationTurn = {
          speaker: 'ai',
          content: result.question || 'Can you tell me more about this?',
          messageType: 'question',
          followUpReason: result.followUpReason || 'I want to understand this better',
          emotionalTone: result.emotionalTone || 'curious',
          culturalCues: result.culturalCues || [],
          stage: result.stage,
          timestamp: new Date().toISOString()
        };

        setConversation(prev => [...prev, userMessage, aiMessage]);
      } else {
        // Handle unexpected status or fallback
        console.warn('Unexpected response status:', result.status);
        setConversation(prev => [...prev, userMessage]);
        
        // Generate a fallback question
        const fallbackQuestion = `Thank you for sharing that. Can you tell me more about the cultural significance of this memory?`;
        const aiMessage: ConversationTurn = {
          speaker: 'ai',
          content: fallbackQuestion,
          messageType: 'question',
          followUpReason: 'I want to understand this better',
          emotionalTone: 'curious',
          culturalCues: [],
          stage: conversationState.stage + 1,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, aiMessage]);
        setConversationState(prev => ({
          ...prev,
          stage: prev.stage + 1,
          status: 'listening'
        }));
      }
      
      setUserInput('');
    } catch (error: any) {
      console.error('Failed to submit response:', error);
      setConversationState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error.message 
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const performFinalAnalysis = async (fullConversation?: ConversationTurn[]) => {
    if (!conversationState.queryId) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          queryId: conversationState.queryId,
          conversationHistory: fullConversation || conversation
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json() as AnalyzeResponse;
      
      setAnalysis(result.analysis);
      setConversationState(prev => ({
        ...prev,
        status: 'completed',
        stage: 4
      }));

      // Add final AI message
      const finalMessage: ConversationTurn = {
        speaker: 'ai',
        content: result.message,
        messageType: 'analysis',
        timestamp: new Date().toISOString()
      };

      setConversation(prev => [...prev, finalMessage]);

      // Call completion callback if provided
      if (onAnalysisComplete && result.analysis) {
        onAnalysisComplete(result.analysis);
      }
    } catch (error: any) {
      console.error('Failed to perform analysis:', error);
      setConversationState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error.message 
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (conversationState.status === 'initial') {
        startConversation(userInput);
      } else if (conversationState.status === 'listening') {
        submitResponse();
      }
    }
  };

  const resetConversation = () => {
    setConversation([]);
    setConversationState({
      queryId: null,
      status: 'initial',
      stage: 0,
      totalStages: 3
    });
    setUserInput('');
    setAnalysis(null);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          🌟 Share Your Cultural Memory
        </h2>
        {conversationState.status === 'initial' && (
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tell me about a memory that holds cultural significance for you. 
            I'll listen carefully and ask thoughtful questions to understand your experience better.
          </p>
        )}
      </div>

      {/* Progress Indicator */}
      {conversationState.status !== 'initial' && (
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-full px-6 py-3 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {conversationState.status === 'listening' && `Stage ${conversationState.stage}/3`}
              {conversationState.status === 'analyzing' && 'Analyzing...'}
              {conversationState.status === 'completed' && 'Complete ✨'}
              {conversationState.status === 'error' && 'Error ❌'}
            </span>
            
            {conversationState.status === 'listening' && (
              <div className="flex space-x-1">
                {[1, 2, 3].map(stage => (
                  <div
                    key={stage}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      stage <= conversationState.stage ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {conversationState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">❌</div>
            <div>
              <h3 className="font-medium text-red-900">Something went wrong</h3>
              <p className="text-red-700 text-sm mt-1">{conversationState.error}</p>
            </div>
          </div>
          <Button
            onClick={resetConversation}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Start Over
          </Button>
        </div>
      )}

      {/* Conversation Area */}
      <div className="space-y-4">
        {/* Initial Input */}
        {conversationState.status === 'initial' && (
          <div className="space-y-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Tell me about a memory that holds cultural significance for you..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <div className="flex justify-center">
              <Button
                onClick={() => startConversation(userInput)}
                disabled={!userInput.trim() || isProcessing}
                className="px-8 py-3"
              >
                {isProcessing ? 'Starting...' : 'Share & Begin Journey'}
              </Button>
            </div>
          </div>
        )}

        {/* Conversation Messages */}
        {conversation.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((turn, index) => (
              <div key={index} className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl p-4 rounded-lg ${
                  turn.speaker === 'user' 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">
                      {turn.speaker === 'user' ? 'You' : '🤖 Cultural Analyst'}
                    </p>
                    {turn.stage && (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        Stage {turn.stage}
                      </span>
                    )}
                  </div>
                  
                  <p className="mb-2 whitespace-pre-wrap">{turn.content}</p>
                  
                  {turn.speaker === 'ai' && turn.followUpReason && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                      <strong>Why I'm asking:</strong> {turn.followUpReason}
                    </div>
                  )}
                  
                  {turn.speaker === 'ai' && turn.emotionalTone && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                      <strong>Emotional tone I detected:</strong> {turn.emotionalTone}
                    </div>
                  )}

                  {turn.speaker === 'ai' && turn.culturalCues && turn.culturalCues.length > 0 && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                      <strong>Cultural elements noticed:</strong> {turn.culturalCues.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* User Input During Conversation */}
        {conversationState.status === 'listening' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share your thoughts..."
                className="flex-1 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isProcessing}
              />
              <Button
                onClick={submitResponse}
                disabled={!userInput.trim() || isProcessing}
                className="self-end px-6 py-4"
              >
                {isProcessing ? 'Processing...' : 'Continue'}
              </Button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {(conversationState.status === 'analyzing' || isProcessing) && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {conversationState.status === 'analyzing' 
                ? 'Analyzing your cultural memory...' 
                : 'Processing your response...'}
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {conversationState.status === 'completed' && analysis && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              ✨ Analysis Complete!
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-green-700">Cultural Significance:</strong>
                <div className="text-green-600 text-lg font-semibold">
                  {(analysis.culturalSignificanceScore * 100).toFixed(0)}%
                </div>
              </div>
              
              <div>
                <strong className="text-green-700">Confidence Score:</strong>
                <div className="text-green-600 text-lg font-semibold">
                  {((analysis.confidenceScore || 0.8) * 100).toFixed(0)}%
                </div>
              </div>

              <div className="md:col-span-2">
                <strong className="text-green-700">Suggested Tags:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysis.suggestedTags.map((tag, index) => (
                    <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {analysis.culturalElements.length > 0 && (
                <div className="md:col-span-2">
                  <strong className="text-green-700">Cultural Elements:</strong>
                  <div className="text-green-600 mt-1">
                    {analysis.culturalElements.join(', ')}
                  </div>
                </div>
              )}

              {analysis.activeListeningInsights && (
                <div className="md:col-span-2">
                  <strong className="text-green-700">Key Insights:</strong>
                  <div className="text-green-600 mt-1">
                    {analysis.activeListeningInsights}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={resetConversation} variant="outline">
                Share Another Memory
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}