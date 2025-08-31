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

type MessageStatus = 'sending' | 'delivered' | 'processing' | 'completed' | 'failed' | 'retry';
// type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ConversationState {
  isOnboarding: boolean;
  hasGreeted: boolean;
  currentTopic?: string;
  memoryContext: {
    title?: string;
    category?: string;
    tags: string[];
    people: string[];
    locations: string[];
    timeframe?: string;
    emotions: string[];
  };
  followUpQuestions: string[];
  completedAspects: string[];
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  retryCount?: number;
  error?: string;
  isTyping?: boolean;
          metadata?: Record<string, unknown>;
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

export default function MemoryWeaverPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const connectionMonitor = useConnectionMonitor();
  const [conversationState, setConversationState] = useState<ConversationState>({
    isOnboarding: true,
    hasGreeted: false,
    memoryContext: {
      tags: [],
      people: [],
      locations: [],
      emotions: []
    },
    followUpQuestions: [],
    completedAspects: []
  });
  const [isAITyping, setIsAITyping] = useState(false);
  const [currentMemory, setCurrentMemory] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    location: '',
    date: '',
    mediaFiles: [] as Array<{id: number; name: string; type: string; size: number; file: File}>,
    culturalContext: '',
    familyMembers: [] as string[],
    emotionalSignificance: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on component mount
  useEffect(() => {
    if (messages.length === 0 && !conversationState.hasGreeted) {
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: 'welcome-' + Date.now(),
          type: 'ai',
          content: "Hi there! I'm Memory Weaver, your AI companion for preserving precious memories and cultural heritage. I'm here to help you capture the stories, traditions, and moments that matter most to you and your family. What memory would you like to share with me today?",
          timestamp: new Date(),
          status: 'completed'
        };
        setMessages([welcomeMessage]);
        setConversationState(prev => ({ ...prev, hasGreeted: true }));
      }, 1500);
    }
  }, [messages.length, conversationState.hasGreeted]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsProcessing(true);
    setProcessingStage('Sending message...');

    // Update message status to delivered
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'delivered' }
          : msg
      ));
      setProcessingStage('Analyzing content...');
    }, 500);

    try {
      setProcessingStage('Connecting to AI...');
      
      // Call AI analysis API for enhanced memory processing
      const response = await fetch('/api/ai/analyze-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputValue,
          culturalContext: user?.culturalBackground ? [user.culturalBackground] : [],
          language: 'en', // Detect from user preferences
          userId: user?.id || 'anonymous'
        }),
      });
      
      setProcessingStage('Processing AI response...');

      if (response.ok) {
        setProcessingStage('Analyzing your memory...');
        const analysis: AIAnalysisResponse = await response.json();
        
        // Update conversation state
        const newAspects: string[] = [];
        if (analysis.peopleIdentified?.length > 0) newAspects.push('people');
        if (analysis.emotionalSignificance) newAspects.push('emotions');
        if (analysis.locationContext) newAspects.push('location');
        if (analysis.temporalContext) newAspects.push('time');
        if (analysis.culturalPractices?.length > 0) newAspects.push('traditions');
        
        setConversationState(prev => ({
          ...prev,
          hasGreeted: true,
          isOnboarding: false,
          memoryContext: {
            ...prev.memoryContext,
            title: analysis.metadata.title,
            category: analysis.metadata.category,
            tags: [...new Set([...prev.memoryContext.tags, ...analysis.suggestedTags])],
            people: [...new Set([...prev.memoryContext.people, ...analysis.peopleIdentified])],
            locations: analysis.locationContext ? [...new Set([...prev.memoryContext.locations, analysis.locationContext])] : prev.memoryContext.locations,
            emotions: analysis.emotionalSignificance ? [...new Set([...prev.memoryContext.emotions, analysis.emotionalSignificance])] : prev.memoryContext.emotions
          },
          completedAspects: [...new Set([...prev.completedAspects, ...newAspects])]
        }));
        
        // Update current memory with AI-generated metadata
        setCurrentMemory(prev => ({
          ...prev,
          title: analysis.metadata.title || prev.title,
          category: analysis.metadata.category || prev.category,
          tags: [...new Set([...prev.tags, ...analysis.suggestedTags])],
          culturalContext: analysis.culturalElements.join(', '),
          emotionalSignificance: analysis.emotionalSignificance
        }));

        // Update user message to completed
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'completed' }
            : msg
        ));

        setProcessingStage('Crafting response...');
        
        // Generate conversational AI response
        const conversationalResponse = generateConversationalResponse(inputValue, conversationState, analysis);
        
        setTimeout(() => {
          addAIMessageWithTyping(conversationalResponse, {
            title: analysis.metadata.title,
            category: analysis.metadata.category,
            tags: analysis.suggestedTags,
            culturalSignificance: analysis.culturalSignificanceScore
          });
        }, 800);
      } else {
        // Update user message to failed and AI fails
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'failed', error: 'AI analysis failed' }
            : msg
        ));
        
        setProcessingStage('Using fallback response...');
        
        // Update conversation state even without AI analysis
        setConversationState(prev => ({ ...prev, hasGreeted: true, isOnboarding: false }));
        
        const fallbackResponse = generateConversationalResponse(inputValue, conversationState);
        setTimeout(() => {
          addAIMessageWithTyping(fallbackResponse, extractMetadata(inputValue));
        }, 1000);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      setProcessingStage('Connection failed');
      
      // Update user message to failed
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'failed', error: error instanceof Error ? error.message : 'Network error' }
          : msg
      ));
      
      // Fallback to mock response after delay
      setTimeout(() => {
        // Update conversation state even on error
        setConversationState(prev => ({ ...prev, hasGreeted: true, isOnboarding: false }));
        
        const fallbackResponse = "I'm experiencing some technical difficulties, but I'm still here to help you preserve this memory. " + generateConversationalResponse(inputValue, conversationState);
        addAIMessageWithTyping(fallbackResponse, extractMetadata(inputValue));
      }, 2000);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateConversationalResponse = (userInput: string, state: ConversationState, analysis?: AIAnalysisResponse): string => {
    // Initial greeting
    if (!state.hasGreeted) {
      return "Hi there! I'm Memory Weaver, your AI companion for preserving precious memories and cultural heritage. I'd love to help you capture a meaningful memory today. What would you like to share with me?";
    }

    // If we have analysis, use it for context-aware responses
    if (analysis) {
      const responses = [
        `Thank you for sharing that with me. I can sense this memory holds deep meaning for you${analysis.emotionalSignificance ? ` - there's a beautiful sense of ${analysis.emotionalSignificance} here` : ''}. ${analysis.peopleIdentified.length > 0 ? `I noticed you mentioned ${analysis.peopleIdentified.join(', ')} - ` : ''}tell me more about what made this moment so special for you?`,
        
        `What a wonderful memory! ${analysis.culturalElements.length > 0 ? `I can see the cultural richness here, especially around ${analysis.culturalElements.slice(0, 2).join(' and ')}.` : ''} ${analysis.locationContext ? `It sounds like ${analysis.locationContext} was an important place for this memory.` : ''} Can you help me understand what this moment meant to your family or community?`,
        
        `This sounds like such a meaningful experience. ${analysis.culturalSignificanceScore > 0.5 ? 'I can tell this has deep cultural significance.' : ''} ${analysis.peopleIdentified.length > 0 ? `The people you mentioned - ${analysis.peopleIdentified.join(', ')} - ` : 'The people involved '}must have been very important to you. What roles did they play in this memory?`,
        
        `I'm honored you're sharing this with me. ${analysis.temporalContext ? `The timing you mentioned - ${analysis.temporalContext} - ` : 'When this happened '}seems significant. ${analysis.culturalPractices.length > 0 ? `And the cultural practices like ${analysis.culturalPractices.join(', ')} ` : 'The traditions involved '}sound really meaningful. What emotions do you remember feeling during this time?`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Natural follow-up questions based on conversation context
    const aspects = ['people', 'emotions', 'location', 'time', 'traditions', 'significance'];
    const missingAspects = aspects.filter(aspect => !state.completedAspects.includes(aspect));
    
    if (missingAspects.length > 0) {
      const aspect = missingAspects[0];
      const followUps = {
        people: "Who else was part of this memory? Tell me about the important people who were there.",
        emotions: "What emotions come up for you when you think about this memory? How did it make you feel?",
        location: "Where did this take place? What was special about that location for you and your family?",
        time: "When did this happen? What was going on in your life or your family's life around that time?",
        traditions: "Were there any cultural traditions, customs, or rituals that were part of this experience?",
        significance: "What makes this memory so important to preserve? How has it shaped you or your family?"
      };
      
      return followUps[aspect as keyof typeof followUps] || "Tell me more about this memory. What other details would you like to capture?";
    }
    
    // Wrap-up responses
    const wrapUpResponses = [
      "Thank you for sharing such a beautiful and meaningful memory with me. This sounds like something truly worth preserving for future generations. Would you like to add any final thoughts or details?",
      "What a rich and touching memory you've shared. I can see how much this means to you and your family's story. Is there anything else about this experience that you'd like to make sure we capture?",
      "This memory is a treasure. You've painted such a vivid picture of this meaningful moment. Would you like to share any other aspects of this experience before we preserve it?"
    ];
    
    return wrapUpResponses[Math.floor(Math.random() * wrapUpResponses.length)];
  };

  const extractMetadata = (input: string) => {
    // Simple metadata extraction - in real app, this would use AI
    const metadata: Record<string, string> = {};
    if (input.toLowerCase().includes('family')) metadata.category = 'Family';
    if (input.toLowerCase().includes('tradition')) metadata.category = 'Cultural';
    if (input.toLowerCase().includes('childhood')) metadata.category = 'Personal';
    return metadata;
  };

  // Add delay to simulate natural typing
  const addAIMessageWithTyping = async (content: string, metadata?: Record<string, unknown>) => {
    setIsAITyping(true);
    
    // Simulate typing delay based on message length
    const typingDelay = Math.min(Math.max(content.length * 30, 1000), 3000);
    
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content,
        timestamp: new Date(),
        status: 'completed',
        metadata,
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsAITyping(false);
    }, typingDelay);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        file
      }));
      setCurrentMemory(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, ...newFiles]
      }));
    }
  };

          const handleSaveMemory = async () => {
    // TODO: Implement IPFS storage and blockchain recording
    console.log('Saving memory:', currentMemory);
    alert('Memory saved successfully! (Demo mode)');
  };

  const retryMessage = async (messageId: string) => {
    const messageToRetry = messages.find(msg => msg.id === messageId);
    if (!messageToRetry) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'retry', retryCount: (msg.retryCount || 0) + 1 }
        : msg
    ));
    
    // Remove the failed message and retry
    const originalInput = messageToRetry.content;
    setInputValue(originalInput);
    
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isProcessing) {
        handleSendMessage();
      }
    }
  };

  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('Memory Weaver Error:', error, errorInfo);
      // Here you could send error to logging service
    }}>
      <AsyncErrorBoundary onError={(error) => {
        console.error('Async Error in Memory Weaver:', error);
      }}>
        <div className="min-h-screen"
             style={{
               background: 'linear-gradient(135deg, #f8f7f5 0%, #ffffff 30%, #f5f4f2 70%, #e8e6e3 100%)'
             }}>
      {/* Header */}
      <div className="sticky top-0 z-50"
           style={{
             background: 'rgba(255, 255, 255, 0.95)',
             backdropFilter: 'blur(20px) saturate(180%)',
             boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
             borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
           }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                   style={{
                     background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                     boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0,0,0,0.1), 0 2px 8px rgba(210, 180, 140, 0.3)'
                   }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 font-playfair">Memory Weaver</h1>
                <p className="text-sm text-stone-600">AI-Powered Memory Preservation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <AuthStatus />
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
                title="Help & Tips"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200" title="Settings">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Prompt Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-8 font-playfair leading-tight"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #1a1a1a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Prompt. Preserve. Remember.
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-stone-700 mb-6 font-inter leading-relaxed"
          >
            Build real, working memories just by describing them
          </motion.p>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-stone-600 font-inter"
          >
            Memory Weaver helps you capture and preserve ancestral memories with AI assistance
          </motion.p>
        </div>

        {/* Central Prompt Input */}
        <div className="max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
                         {/* Action Icons Above Text Box */}
             <div className="flex justify-center space-x-8">
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="flex flex-col items-center space-y-2 p-4 rounded-2xl hover:bg-stone-100 transition-all duration-300 group"
                 title="Upload photos, videos, or audio files"
               >
                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(145deg, #f5f4f2, #e8e6e3)',
                        boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.5), inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(210, 180, 140, 0.2)'
                      }}>
                   <Camera className="w-8 h-8 text-stone-600" />
                 </div>
                 <span className="text-sm font-medium text-stone-700">Add Media</span>
               </button>
               
               <button className="flex flex-col items-center space-y-2 p-4 rounded-2xl hover:bg-stone-100 transition-all duration-300 group" title="Fill out memory details manually">
                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(145deg, #f5f4f2, #e8e6e3)',
                        boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.5), inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(210, 180, 140, 0.2)'
                      }}>
                   <BookOpen className="w-8 h-8 text-stone-600" />
                 </div>
                 <span className="text-sm font-medium text-stone-700">Manual Input</span>
               </button>
             </div>

            {/* Text Input Box */}
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={conversationState.hasGreeted 
                  ? "Continue sharing your memory..."
                  : "Tell me about a memory you'd like to preserve..."}
                className="w-full p-6 text-lg border border-stone-300 rounded-2xl focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none shadow-lg"
                rows={conversationState.hasGreeted ? 2 : 4}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
                aria-label="Send memory"
                title={isProcessing ? 'Processing...' : 'Send memory'}
                className="absolute right-4 top-4 p-3 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                  }
                }}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </motion.div>
        </div>

        {/* Help Section */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto mb-16"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border"
                   style={{
                     background: 'rgba(255, 255, 255, 0.9)',
                     backdropFilter: 'blur(20px) saturate(180%)',
                     boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                     borderColor: 'rgba(255, 255, 255, 0.3)'
                   }}>
                <h3 className="text-2xl font-bold text-stone-900 mb-6 font-playfair text-center">How to Use Memory Weaver</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <div className="space-y-4">
                     <h4 className="text-lg font-semibold text-stone-800 flex items-center space-x-2">
                       <Heart className="w-5 h-5 text-stone-600" />
                       <span>Simple Prompts</span>
                     </h4>
                     <div className="space-y-3 text-sm text-stone-600">
                       <p className="flex items-start space-x-2">
                         <span>💡</span>
                         <span>&ldquo;Preserve my grandmother&apos;s recipe for traditional bread&rdquo;</span>
                       </p>
                       <p className="flex items-start space-x-2">
                         <span>💡</span>
                         <span>&ldquo;Save the story of our family&apos;s migration journey&rdquo;</span>
                       </p>
                       <p className="flex items-start space-x-2">
                         <span>💡</span>
                         <span>&ldquo;Remember the cultural festival from my childhood&rdquo;</span>
                       </p>
                     </div>
                   </div>
                   <div className="space-y-4">
                     <h4 className="text-lg font-semibold text-stone-800 flex items-center space-x-2">
                       <Bot className="w-5 h-5 text-stone-600" />
                       <span>AI Assistance</span>
                     </h4>
                     <div className="space-y-3 text-sm text-stone-600">
                       <p className="flex items-start space-x-2">
                         <span>🤖</span>
                         <span>Memory Weaver will ask follow-up questions</span>
                       </p>
                       <p className="flex items-start space-x-2">
                         <span>🤖</span>
                         <span>Automatically categorize and tag memories</span>
                       </p>
                       <p className="flex items-start space-x-2">
                         <span>🤖</span>
                         <span>Suggest cultural context and significance</span>
                       </p>
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Interface (Shows immediately with welcome message) */}
        {(messages.length > 0 || conversationState.hasGreeted) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="bg-white rounded-3xl shadow-xl border"
                 style={{
                   background: 'rgba(255, 255, 255, 0.9)',
                   backdropFilter: 'blur(20px) saturate(180%)',
                   boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                   borderColor: 'rgba(255, 255, 255, 0.3)'
                 }}>
              {/* Chat Header */}
              <div className="p-6 border-b border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                         style={{
                           background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                           boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0,0,0,0.1)'
                         }}>
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">Memory Weaver AI</h3>
                      <p className="text-sm text-stone-600">Your cultural heritage preservation companion</p>
                    </div>
                  </div>
                  
                  {/* Connection Status Indicator */}
                  <ConnectionStatusIndicator 
                    status={connectionMonitor.status}
                    showText={true}
                    size="md"
                  />
                </div>
                
                {/* Processing Status Bar */}
                <ProcessingProgress 
                  stage={processingStage}
                  isVisible={isProcessing && !!processingStage}
                />
              </div>

              {/* Chat Messages */}
              <div className="max-h-[500px] overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 relative ${
                        message.type === 'user'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-900'
                      }`}>
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            {message.metadata && (
                              <div className="mt-2 pt-2 border-t border-stone-200">
                                <p className="text-xs text-stone-500">
                                  Category: {(message.metadata as Record<string, unknown>).category as string || 'Uncategorized'}
                                </p>
                              </div>
                            )}
                            {message.error && (
                              <div className="mt-2 pt-2 border-t border-red-200">
                                <p className="text-xs text-red-500 flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>{message.error}</span>
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Message Status Indicator */}
                          <div className="flex-shrink-0 mt-1 group">
                            <MessageStatusIndicator 
                              status={message.status || 'completed'}
                              error={message.error}
                              retryCount={message.retryCount}
                              onRetry={() => retryMessage(message.id)}
                              size="sm"
                            />
                          </div>
                        </div>
                        
                      </div>
                    </motion.div>
                  ))}
                  {(isTyping || isAITyping) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div className="bg-stone-100 rounded-2xl px-4 py-3 flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-stone-500 italic">
                          {isAITyping ? 'Memory Weaver is thinking...' : 'Processing...'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
          </motion.div>
        )}

                 {/* Quick Actions Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
             <h3 className="text-xl font-semibold text-stone-900 mb-3">Upload Media</h3>
             <p className="text-stone-600 text-sm">Add photos, videos, and audio to enrich your memories</p>
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
             <h3 className="text-xl font-semibold text-stone-900 mb-3">Voice Stories</h3>
             <p className="text-stone-600 text-sm">Record oral histories and personal narratives</p>
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
             <h3 className="text-xl font-semibold text-stone-900 mb-3">Share Heritage</h3>
             <p className="text-stone-600 text-sm">Connect with family and community members</p>
           </motion.div>
         </div>
      </div>
    </div>
    </AsyncErrorBoundary>
  </ErrorBoundary>
  );
}
