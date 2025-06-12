'use client';

import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import { useSearchParams } from 'next/navigation';

function AuthContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  
  // Handle error parameters from URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam) {
      // Set appropriate error message based on error type
      if (messageParam) {
        setError(decodeURIComponent(messageParam));
      } else if (errorParam === 'google_auth_failed') {
        setError('Google authentication failed. Please try again or use email/password.');
      } else if (errorParam === 'auth_error') {
        setError('There was a problem with authentication. Please try again.');
      } else if (errorParam === 'no_token') {
        setError('No authentication token received. Please try again.');
      } else {
        setError('Authentication error. Please try again.');
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6 flex items-center border-2 border-red-500 shadow-md animate-pulse">
              <svg className="w-6 h-6 mr-3 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <div className="font-medium">{error}</div>
            </div>
          )}
          
          {/* Toggle Buttons */}
          <div className="bg-white p-1 rounded-lg shadow-sm flex mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-center text-sm font-medium transition-all duration-200 ${authMode === 'login' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-center text-sm font-medium transition-all duration-200 ${authMode === 'register' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Container */}
          <div className="transition-all duration-300">
            {authMode === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>

          {/* Alternative Toggler Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {authMode === 'login' ? (
                <>Need an account? <button onClick={() => setAuthMode('register')} className="text-black hover:text-teal-600 font-medium">Create one</button></>
              ) : (
                <>Already have an account? <button onClick={() => setAuthMode('login')} className="text-black hover:text-teal-600 font-medium">Sign in</button></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
