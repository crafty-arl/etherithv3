'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  culturalBackground?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  session: any;
  status: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: { firstName: string; lastName: string; username: string; email: string; password: string }) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      // Transform NextAuth session to our User interface
      const transformedUser: User = {
        id: session.user.id || '',
        email: session.user.email || '',
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        avatar: session.user.image || '',
        username: (session.user as any).username || session.user.email?.split('@')[0] || '',
        culturalBackground: (session.user as any).culturalBackground || 'Default',
        isVerified: (session.user as any).isVerified || false,
      };
      setUser(transformedUser);
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, [session, status]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Session will be updated via useSession hook
      await refreshSession();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: { firstName: string; lastName: string; username: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      // Call our signup API endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // After successful signup, automatically log in
      await login(userData.email, userData.password);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const newSession = await getSession();
      if (newSession?.user) {
        // Update user state with new session data
        const transformedUser: User = {
          id: newSession.user.id || '',
          email: newSession.user.email || '',
          firstName: newSession.user.name?.split(' ')[0] || '',
          lastName: newSession.user.name?.split(' ').slice(1).join(' ') || '',
          avatar: newSession.user.image || '',
          username: (newSession.user as any).username || newSession.user.email?.split('@')[0] || '',
          culturalBackground: (newSession.user as any).culturalBackground || 'Default',
          isVerified: (newSession.user as any).isVerified || false,
        };
        setUser(transformedUser);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    session,
    status,
    login,
    logout,
    signup,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
