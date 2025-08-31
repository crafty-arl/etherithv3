'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { User, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function AuthStatus() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-stone-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-stone-600" />
          <span className="text-stone-700 font-medium">
            Welcome, {user.firstName || user.username}!
          </span>
        </div>
        {user.culturalBackground && (
          <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
            {user.culturalBackground}
          </span>
        )}
        {!user.isVerified && (
          <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
            Unverified
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <LogIn className="w-4 h-4 text-stone-600" />
      <Link 
        href="/auth/signin" 
        className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
      >
        Sign In
      </Link>
      <span className="text-stone-400">|</span>
      <Link 
        href="/auth/signup" 
        className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
      >
        Sign Up
      </Link>
    </div>
  );
}
