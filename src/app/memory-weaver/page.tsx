'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, Settings, ArrowLeft, HelpCircle, BookOpen, Heart, Camera, Users, Mic, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import { useConnectionMonitor } from '@/hooks/useConnectionMonitor';
import { ConnectionStatusIndicator, MessageStatusIndicator, ProcessingProgress } from '@/components/ui/status-indicators';
import ErrorBoundary, { AsyncErrorBoundary } from '@/components/ui/error-boundary';
import { AuthStatus } from '@/components/ui/auth-status';

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

interface ConversationState {
  queryId: string | null;
  status: 'initial' | 'listening' | 'analyzing' | 'completed' | 'error';
  stage: number;
  totalStages: number;
  error?: string;
}

export default function MemoryWeaverPage() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    queryId: null,
    status: 'initial',
    stage: 0,
    totalStages: 3
  });
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const connectionMonitor = useConnectionMonitor();
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
          content: memory,
          userId: user?.id || 'anonymous'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json() as {
        queryId: string;
        stage: number;
        totalStages: number;
        question: string;
        followUpReason: string;
        emotionalTone: string;
        culturalCues: string[];
      };
      
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
          content: user?.name ? `Hi ${user.name}! ${result.question}` : result.question, 
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

      const result = await response.json() as {
        status: string;
        stage: number;
        question: string;
        followUpReason: string;
        emotionalTone: string;
        culturalCues: string[];
      };
      
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
      } else {
        // Continue conversation
        setConversationState(prev => ({
          ...prev,
          stage: result.stage,
          status: 'listening'
        }));

        const aiMessage: ConversationTurn = {
          speaker: 'ai',
          content: result.question,
          messageType: 'question',
          followUpReason: result.followUpReason,
          emotionalTone: result.emotionalTone,
          culturalCues: result.culturalCues,
          stage: result.stage,
          timestamp: new Date().toISOString()
        };

        setConversation(prev => [...prev, userMessage, aiMessage]);
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

      const result = await response.json() as {
        analysis: AnalysisResult;
        message: string;
      };
      
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
    <ErrorBoundary>
      <AsyncErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <Link href="/" className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                  </Link>
                  <div className="h-6 w-px bg-stone-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-stone-900">Memory Weaver</h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <ConnectionStatusIndicator status={connectionMonitor.status} />
                  <AuthStatus />
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Help"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">
                AI-Powered Memory Preservation
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
                Share your precious memories with Memory Weaver, your AI companion that uses active listening to understand 
                and preserve your cultural heritage, family stories, and meaningful moments.
              </p>
            </motion.div>

            {/* Memory Input Section */}
            {conversationState.status === 'initial' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-12"
              >
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-stone-200">
                  <h3 className="text-2xl font-semibold text-stone-900 mb-6 text-center">
                    🌟 Share Your Cultural Memory
                  </h3>
                  <p className="text-stone-600 text-center mb-8">
                    Tell me about a memory that holds cultural significance for you. 
                    I'll listen carefully and ask thoughtful questions to understand your experience better.
                  </p>
                  
                  <div className="space-y-4">
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Tell me about a memory that holds cultural significance for you..."
                      className="w-full h-32 p-4 border border-stone-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      disabled={isProcessing}
                    />
                    <div className="flex justify-center">
                      <button
                        onClick={() => startConversation(userInput)}
                        disabled={!userInput.trim() || isProcessing}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg disabled:opacity-50 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium"
                      >
                        {isProcessing ? 'Starting...' : 'Share & Begin Journey'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Progress Indicator */}
            {conversationState.status !== 'initial' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-8"
              >
                <div className="bg-white/80 backdrop-blur-md rounded-full px-6 py-3 flex items-center space-x-4 shadow-lg border border-stone-200">
                  <span className="text-sm font-medium text-stone-700">
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
                            stage <= conversationState.stage ? 'bg-amber-500' : 'bg-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {conversationState.error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-red-600">❌</div>
                    <div>
                      <h3 className="font-medium text-red-900">Something went wrong</h3>
                      <p className="text-red-700 text-sm mt-1">{conversationState.error}</p>
                    </div>
                  </div>
                  <button
                    onClick={resetConversation}
                    className="mt-3 px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </motion.div>
            )}

            {/* Conversation Area */}
            {conversation.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-stone-200">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {conversation.map((turn, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          turn.speaker === 'user'
                            ? 'bg-amber-500 text-white'
                            : 'bg-stone-100 text-stone-900'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold">
                              {turn.speaker === 'user' ? 'You' : '🤖 Memory Weaver'}
                            </p>
                            {turn.stage && (
                              <span className="text-xs text-stone-500 bg-stone-200 px-2 py-1 rounded">
                                Stage {turn.stage}
                              </span>
                            )}
                          </div>
                          
                          <p className="mb-2 whitespace-pre-wrap">{turn.content}</p>
                          
                          {turn.speaker === 'ai' && turn.followUpReason && (
                            <div className="text-xs text-stone-600 bg-stone-50 p-2 rounded mt-2">
                              <strong>Why I'm asking:</strong> {turn.followUpReason}
                            </div>
                          )}

                          {turn.speaker === 'ai' && turn.culturalCues && turn.culturalCues.length > 0 && (
                            <div className="text-xs text-stone-600 bg-stone-50 p-2 rounded mt-2">
                              <strong>Cultural elements noticed:</strong> {turn.culturalCues.join(', ')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* User Input During Conversation */}
            {conversationState.status === 'listening' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-stone-200">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Share your thoughts..."
                        className="flex-1 p-4 border border-stone-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        rows={3}
                        disabled={isProcessing}
                      />
                      <button
                        onClick={submitResponse}
                        disabled={!userInput.trim() || isProcessing}
                        className="self-end px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg disabled:opacity-50 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium"
                      >
                        {isProcessing ? 'Processing...' : 'Continue'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Processing State */}
            {(conversationState.status === 'analyzing' || isProcessing) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-8 text-center"
              >
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-stone-200">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                  <p className="text-stone-600 text-lg">
                    {conversationState.status === 'analyzing' 
                      ? 'Memory Weaver is analyzing your cultural memory...' 
                      : 'Processing your response...'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Analysis Results */}
            {conversationState.status === 'completed' && analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="bg-green-50 border border-green-200 rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
                    ✨ Analysis Complete!
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
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
                      <div className="flex flex-wrap gap-2 mt-2">
                        {analysis.suggestedTags.map((tag, index) => (
                          <span key={index} className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {analysis.culturalElements.length > 0 && (
                      <div className="md:col-span-2">
                        <strong className="text-green-700">Cultural Elements:</strong>
                        <div className="text-green-600 mt-2">
                          {analysis.culturalElements.join(', ')}
                        </div>
                      </div>
                    )}

                    {analysis.activeListeningInsights && (
                      <div className="md:col-span-2">
                        <strong className="text-green-700">Key Insights:</strong>
                        <div className="text-green-600 mt-2">
                          {analysis.activeListeningInsights}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-4 mt-8">
                    <button 
                      onClick={resetConversation}
                      className="px-6 py-3 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Share Another Memory
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-all duration-300 group-hover:scale-110"
                     style={{
                       background: 'linear-gradient(145deg, #f5f4f2, #e8e6e3)',
                       boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.5), inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(210, 180, 140, 0.2)'
                     }}>
                  <Camera className="w-10 h-10 text-stone-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mb-3">Upload Media</h3>
                <p className="text-stone-600 text-xs sm:text-sm">Add photos, videos, and audio to enrich your memories</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-all duration-300 group-hover:scale-110"
                     style={{
                       background: 'linear-gradient(145deg, #f5f4f2, #e8e6e3)',
                       boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.5), inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(210, 180, 140, 0.2)'
                     }}>
                  <Mic className="w-10 h-10 text-stone-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mb-3">Voice Stories</h3>
                <p className="text-stone-600 text-xs sm:text-sm">Record oral histories and personal narratives</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-all duration-300 group-hover:scale-110"
                     style={{
                       background: 'linear-gradient(145deg, #f5f4f2, #e8e6e3)',
                       boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.5), inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(210, 180, 140, 0.2)'
                     }}>
                  <Users className="w-10 h-10 text-stone-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mb-3">Share Heritage</h3>
                <p className="text-stone-600 text-xs sm:text-sm">Connect with family and community members</p>
              </motion.div>
            </div>
          </div>
        </div>
      </AsyncErrorBoundary>
    </ErrorBoundary>
  );
}
