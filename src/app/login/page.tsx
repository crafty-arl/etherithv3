'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, MessageCircle, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData.email, formData.password);
      router.push('/'); // Redirect to home page after successful login
    } catch {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleDiscordLogin = () => {
    // TODO: Implement Discord OAuth
    console.log('Discord login clicked');
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
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: [-15, -10, -15], scale: [0.8, 0.85, 0.8] }}
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
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-stone-700 font-medium font-playfair">Memories</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Icons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [20, -20, 20], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                boxShadow: '0 8px 20px rgba(210, 180, 140, 0.4), inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [-20, 20, -20], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255,255,255,0.1), inset -1px -1px 2px rgba(0,0,0,0.5)'
              }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [20, -20, 20], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -bottom-6 -right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                boxShadow: '0 4px 12px rgba(210, 180, 140, 0.3), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <CheckCircle className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
              Etherith
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg font-inter"
              style={{ color: '#8b7355' }}
            >
              Ancestral Memory Preservation
            </motion.p>
          </div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2 font-inter">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                      style={{ color: '#8b7355' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200 border font-inter"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#d2b48c',
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.05), 0 2px 8px rgba(210, 180, 140, 0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c8a882';
                    e.target.style.boxShadow = '0 0 0 3px rgba(210, 180, 140, 0.2), inset 2px 2px 4px rgba(0,0,0,0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d2b48c';
                    e.target.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,0.05), 0 2px 8px rgba(210, 180, 140, 0.1)';
                  }}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2 font-inter">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                      style={{ color: '#8b7355' }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 rounded-lg transition-all duration-200 border font-inter"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#d2b48c',
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.05), 0 2px 8px rgba(210, 180, 140, 0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c8a882';
                    e.target.style.boxShadow = '0 0 0 3px rgba(210, 180, 140, 0.2), inset 2px 2px 4px rgba(0,0,0,0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d2b48c';
                    e.target.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,0.05), 0 2px 8px rgba(210, 180, 140, 0.1)';
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: '#8b7355' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#6b5b47'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8b7355'; }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden font-inter"
              style={{
                background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
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

            {/* Discord Login */}
            <button
              type="button"
              onClick={handleDiscordLogin}
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
              <span>Continue with Discord</span>
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <a
                href="#"
                className="text-sm font-medium transition-colors font-inter"
                style={{ color: '#8b7355' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#6b5b47'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8b7355'; }}
              >
                Forgot your password?
              </a>
            </div>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <p className="text-stone-600 font-inter">
              Don&apos;t have an account?{' '}
              <a
                href="/signup"
                className="font-medium transition-colors"
                style={{ color: '#8b7355' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#6b5b47'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8b7355'; }}
              >
                Sign up
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
