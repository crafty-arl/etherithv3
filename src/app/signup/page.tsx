'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleDiscordSignup = async () => {
    try {
      setError('');
      const result = await signIn('discord', { 
        callbackUrl: '/memory-weaver',
        redirect: false 
      });
      
      if (result?.error) {
        setError('Failed to sign up with Discord. Please try again.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Discord signup error:', error);
      setError('An error occurred during Discord signup.');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      const result = await signIn('google', { 
        callbackUrl: '/memory-weaver',
        redirect: false 
      });
      
      if (result?.error) {
        setError('Failed to sign up with Google. Please try again.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Google signup is not yet configured.');
    }
  };

  return (
    <div className="min-h-screen flex"
         style={{
           background: 'linear-gradient(135deg, #f8f7f5 0%, #ffffff 30%, #f5f4f2 70%, #e8e6e3 100%)'
         }}>
      {/* Left Side - Visual Elements */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
           style={{
             background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)'
           }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Decorative Phone Screens */}
          <div className="relative">
            {/* Main Phone Screen */}
            <motion.div
              initial={{ rotate: 15, scale: 0.8 }}
              animate={{ rotate: [15, 10, 15], scale: [0.8, 0.85, 0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-64 h-80 rounded-3xl relative border-2"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="w-full h-full rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                       style={{
                         background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                         boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0,0,0,0.1), 0 2px 8px rgba(210, 180, 140, 0.3)'
                       }}>
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-stone-700 font-medium font-playfair">Join Us</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Icons */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [-20, 20, -20], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -left-8 w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                boxShadow: '0 8px 20px rgba(210, 180, 140, 0.4), inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <CheckCircle className="w-6 h-6 text-white" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [20, -20, 20], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255,255,255,0.1), inset -1px -1px 2px rgba(0,0,0,0.5)'
              }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [-20, 20, -20], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -bottom-6 -left-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                boxShadow: '0 4px 12px rgba(210, 180, 140, 0.3), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <Heart className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-8 rounded-3xl border"
             style={{
               background: 'rgba(255, 255, 255, 0.95)',
               backdropFilter: 'blur(20px) saturate(180%)',
               boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
               borderColor: 'rgba(255, 255, 255, 0.3)'
             }}>
          <div className="text-center">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold mb-2 font-playfair"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #1a1a1a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Join Etherith
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg font-inter"
              style={{ color: '#8b7355' }}
            >
              Start preserving memories today
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Google Signup */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full text-gray-700 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 font-inter border"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#d2b48c',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-stone-600 font-inter"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}>OR</span>
              </div>
            </div>

            {/* Discord Signup */}
            <button
              type="button"
              onClick={handleDiscordSignup}
              className="w-full text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 font-inter"
              style={{
                background: 'linear-gradient(145deg, #5865F2, #4752C4)',
                boxShadow: '0 6px 20px rgba(88, 101, 242, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(88, 101, 242, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(88, 101, 242, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Sign up with Discord</span>
            </button>
          </motion.div>

          {/* Login Link */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <p className="text-stone-600 font-inter">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium transition-colors"
                style={{ color: '#8b7355' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#6b5b47'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8b7355'; }}
              >
                Sign in
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
