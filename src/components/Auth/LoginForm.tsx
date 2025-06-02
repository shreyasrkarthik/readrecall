'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingBook from '@/components/LoadingBook';
import GoogleAuthButton from './GoogleAuthButton';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form: Submit clicked');
    
    // Clear previous error and set loading state
    setError('');
    setIsLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Make the request manually to get better error handling
      const response = await fetch('/api/proxy/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('Login response:', { status: response.status, data });
      
      // Handle error responses
      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.error || 'Invalid email or password';
        console.log('Login failed with error:', errorMessage);
        
        // Set error state to display in UI
        setError(errorMessage);
        setIsLoading(false);
        return;
      }
      
      // Check if we have token data
      if (!data.token) {
        setError('Authentication failed - no token received');
        setIsLoading(false);
        return;
      }
      
      // Success case - store token and redirect
      localStorage.setItem('auth_token', data.token);
      if (data.user) {
        // Use the login function for state management
        await login(email, password);
        router.push('/profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to authentication service. Please try again later.');
    }
    
    // Always reset loading state
    setIsLoading(false);
  };

  // If loading, show the book-themed loading component
  if (isLoading) {
    console.log('Login form: Rendering loading component');
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingBook message="Verifying your credentials..." />
      </div>
    );
  } else {
    console.log('Login form: Rendering login form, loading state:', isLoading);
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In to ReadRecall</h2>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6 flex items-center border-2 border-red-500 shadow-md error-message animate-pulse">
          <svg className="w-7 h-7 mr-3 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          <div className="font-semibold text-base">{error}</div>
        </div>
      )}
      
      {/* Debug info - remove in production */}
      <div className="hidden">
        <p>Debug - isLoading: {isLoading ? 'true' : 'false'}</p>
        <p>Debug - error: {error || 'none'}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 flex justify-center items-center"
        >
          <svg className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : 'hidden'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {isLoading ? 'Authenticating...' : 'Sign In'}
        </button>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          <div className="mt-6">
            <GoogleAuthButton mode="signin" />
          </div>
        </div>
      </form>
    </div>
  );
}
