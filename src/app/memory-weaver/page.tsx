'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, Settings, ArrowLeft, HelpCircle, User, BookOpen, Heart, Camera, Users, Mic } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    title?: string;
    category?: string;
    tags?: string[];
    location?: string;
    date?: string;
  };
}

export default function MemoryWeaverPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        metadata: extractMetadata(inputValue),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateAIResponse = (_userInput: string): string => {
    const responses = [
      "That's a beautiful memory! Let me help you capture the details. What year did this happen?",
      "I can sense the emotional significance of this memory. Could you tell me more about the people involved?",
      "This sounds like an important cultural moment. What traditions or customs were part of this memory?",
      "I'd love to help preserve this memory. What location was this memory associated with?",
      "This memory seems to have deep family significance. Can you describe the emotions you felt?",
      "Let me help you organize this memory properly. What category would you place this in?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const extractMetadata = (input: string) => {
    // Simple metadata extraction - in real app, this would use AI
    const metadata: Record<string, string> = {};
    if (input.toLowerCase().includes('family')) metadata.category = 'Family';
    if (input.toLowerCase().includes('tradition')) metadata.category = 'Cultural';
    if (input.toLowerCase().includes('childhood')) metadata.category = 'Personal';
    return metadata;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleSaveMemory = async () => {
    // TODO: Implement IPFS storage and blockchain recording
    console.log('Saving memory:', currentMemory);
    alert('Memory saved successfully! (Demo mode)');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
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
              {user && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-stone-600" />
                  <span className="text-stone-700 font-medium">Welcome, {user.firstName}!</span>
                </div>
              )}
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
                placeholder="Ask Memory Weaver to preserve a memory about..."
                className="w-full p-6 text-lg border border-stone-300 rounded-2xl focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none shadow-lg"
                rows={4}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
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
                <Send className="w-5 h-5" />
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

        {/* Chat Interface (Hidden by default, shows after first message) */}
        {messages.length > 0 && (
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
              </div>

              {/* Chat Messages */}
              <div className="max-h-96 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        {message.metadata && (
                          <div className="mt-2 pt-2 border-t border-stone-200">
                            <p className="text-xs text-stone-500">
                              Category: {message.metadata.category || 'Uncategorized'}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-stone-100 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
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
  );
}
