'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'

export default function HomePage() {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen"
         style={{
           background: 'linear-gradient(135deg, #f8f7f5 0%, #ffffff 30%, #f5f4f2 70%, #e8e6e3 100%)'
         }}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Navigation Header */}
        <nav className="flex justify-between items-center mb-16 rounded-2xl px-8 py-5 border transition-all duration-300"
             style={{
               background: 'rgba(255, 255, 255, 0.95)',
               backdropFilter: 'blur(20px) saturate(180%)',
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
               borderColor: 'rgba(255, 255, 255, 0.3)'
             }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                 style={{
                   background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                   boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0,0,0,0.1), 0 2px 8px rgba(210, 180, 140, 0.3)'
                 }}>
              <div className="w-6 h-6 bg-white rounded-lg opacity-90"
                   style={{
                     boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                   }}></div>
            </div>
            <span className="text-3xl font-bold text-stone-900 font-playfair">Etherith</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="#features" className="text-stone-600 hover:text-stone-900 font-medium transition-all duration-200 hover:scale-105">Features</Link>
            <Link href="#about" className="text-stone-600 hover:text-stone-900 font-medium transition-all duration-200 hover:scale-105">About</Link>
            <Link href="#contact" className="text-stone-600 hover:text-stone-900 font-medium transition-all duration-200 hover:scale-105">Contact</Link>
            {user ? (
              <>
                <Link href="/memory-weaver" className="text-stone-600 hover:text-stone-900 font-medium transition-all duration-200 hover:scale-105">Memory Weaver</Link>
                <span className="text-stone-700 font-medium">Welcome, {user.firstName}!</span>
                <button
                  onClick={logout}
                  className="text-stone-600 hover:text-stone-900 font-medium transition-all duration-200 hover:scale-105"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-stone-600 hover:text-stone-900 font-medium transition-all duration-200 hover:scale-105">Sign In</Link>
                <Link href="/signup" className="px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                      }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex space-x-3">
            {user ? (
              <>
                <Link href="/memory-weaver" className="text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors duration-200">Memory Weaver</Link>
                <span className="text-stone-700 font-medium text-sm">Hi, {user.firstName}!</span>
                <button
                  onClick={logout}
                  className="text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors duration-200">Sign In</Link>
                <Link href="/signup" className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-300"
                      style={{
                        background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Main Hero Content */}
        <div className="text-center max-w-5xl mx-auto mb-24">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 font-playfair leading-tight"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #1a1a1a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}>
            Etherith
          </h1>
          <p className="text-xl md:text-2xl text-stone-700 mb-6 font-inter leading-relaxed max-w-4xl mx-auto">
            Preserving ancestral memories, stories, and cultural heritage for future generations
          </p>
          <p className="text-lg mb-12 font-inter"
             style={{ color: '#8b7355' }}>
            Join us in protecting what makes our communities unique and valuable
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            {user ? (
              <>
                <Button 
                  asChild 
                  size="lg" 
                  className="px-10 py-4 text-lg font-bold rounded-2xl text-white transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <Link href="/memory-weaver">
                    Memory Weaver
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="px-10 py-4 text-lg font-semibold rounded-2xl border-2 transition-all duration-300"
                  style={{
                    borderColor: '#d2b48c',
                    color: '#8b7355',
                    background: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 4px 20px rgba(210, 180, 140, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d2b48c';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(210, 180, 140, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.color = '#8b7355';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(210, 180, 140, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                  }}
                >
                  <Link href="/memories">
                    View Memories
                  </Link>
                </Button>
              </>
            ) : (
              <>
            <Button 
              asChild 
              size="lg" 
                  className="px-10 py-4 text-lg font-bold rounded-2xl text-white transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <Link href="/signup">
                Preserve Your Heritage
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
                  className="px-10 py-4 text-lg font-semibold rounded-2xl border-2 transition-all duration-300"
                  style={{
                    borderColor: '#d2b48c',
                    color: '#8b7355',
                    background: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 4px 20px rgba(210, 180, 140, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d2b48c';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(210, 180, 140, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.color = '#8b7355';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(210, 180, 140, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                  }}
                >
                  <Link href="/login">
                    Sign In
              </Link>
            </Button>
              </>
            )}
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="flex justify-center mb-24">
          <div className="relative">
            <img 
              src="/head-shot.jpg" 
              alt="Etherith Hero Image" 
              className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl"
              style={{
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            />
            <div className="absolute inset-0 rounded-full border-4 border-white opacity-20"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto mb-24">
          {/* Feature 1 */}
          <div className="rounded-3xl p-10 transition-all duration-500 hover:scale-105 cursor-pointer border"
               style={{
                 background: 'rgba(255, 255, 255, 0.9)',
                 backdropFilter: 'blur(20px) saturate(180%)',
                 boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                 borderColor: 'rgba(255, 255, 255, 0.3)'
               }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 mx-auto"
                 style={{
                   background: 'linear-gradient(145deg, #f5f4f2, #e8e6e3)',
                   boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.5), inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(210, 180, 140, 0.2)'
                 }}>
              <div className="w-10 h-10 rounded-xl"
                   style={{
                     background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                     boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.1)'
                   }}></div>
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-6 font-playfair text-center">
              Cultural Preservation
            </h3>
            <p className="text-stone-600 leading-relaxed font-inter text-center">
              Safeguard ancestral memories and cultural stories from being lost or appropriated. 
              Our platform ensures your heritage remains protected for generations.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="rounded-3xl p-10 transition-all duration-500 hover:scale-105 cursor-pointer border"
               style={{
                 background: 'rgba(255, 255, 255, 0.9)',
                 backdropFilter: 'blur(20px) saturate(180%)',
                 boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                 borderColor: 'rgba(255, 255, 255, 0.3)'
               }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 mx-auto"
                 style={{
                   background: 'linear-gradient(145deg, #f5f4f2, #e8e6e3)',
                   boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.5), inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(210, 180, 140, 0.2)'
                 }}>
              <div className="w-10 h-10 rounded-xl"
                   style={{
                     background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                     boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.1)'
                   }}></div>
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-6 font-playfair text-center">
              AI-Enhanced Memory
            </h3>
            <p className="text-stone-600 leading-relaxed font-inter text-center">
              Leverage artificial intelligence to intelligently organize and preserve memories with 
              rich metadata and cultural context recognition.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="rounded-3xl p-10 transition-all duration-500 hover:scale-105 cursor-pointer border"
               style={{
                 background: 'rgba(255, 255, 255, 0.9)',
                 backdropFilter: 'blur(20px) saturate(180%)',
                 boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                 borderColor: 'rgba(255, 255, 255, 0.3)'
               }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 mx-auto"
                 style={{
                   background: 'linear-gradient(145deg, #f5f4f2, #e8e6e3)',
                   boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.5), inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(210, 180, 140, 0.2)'
                 }}>
              <div className="w-10 h-10 rounded-xl"
                   style={{
                     background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                     boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.1)'
                   }}></div>
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-6 font-playfair text-center">
              IPFS Storage
            </h3>
            <p className="text-stone-600 leading-relaxed font-inter text-center">
              Permanent, decentralized storage on the IPFS network via Pinata ensures your 
              memories are preserved forever, beyond any single platform.
            </p>
          </div>
        </div>

        {/* Cultural Heritage Banner */}
        <div className="rounded-3xl p-16 text-center border transition-all duration-300 hover:scale-[1.02]"
             style={{
               background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
               boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.5)',
               borderColor: 'rgba(255, 255, 255, 0.1)'
             }}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-playfair leading-tight">
            More Than Technology
            <br />
            <span style={{ color: '#d2b48c' }}>A Cultural Movement</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto font-inter leading-relaxed">
            Etherith represents a cultural movement to reclaim and preserve our collective heritage. 
            In a world where cultural appropriation and erasure are rampant, we provide the tools 
            needed to protect what makes our communities unique.
          </p>
          <Button 
            asChild 
            size="lg" 
            variant="outline"
            className="px-10 py-4 text-lg font-semibold rounded-2xl border-2 transition-all duration-300"
            style={{
              borderColor: '#d2b48c',
              color: '#d2b48c',
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 4px 20px rgba(210, 180, 140, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d2b48c';
              e.currentTarget.style.color = '#1a1a1a';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(210, 180, 140, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#d2b48c';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(210, 180, 140, 0.2)';
            }}
          >
            <Link href="/mission">
              Our Mission
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}