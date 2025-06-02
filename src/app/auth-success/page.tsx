'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import LoadingBook from '@/components/LoadingBook';

export default function AuthSuccessPage() {
  const router = useRouter();
  const { setToken, getProfile } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Extract token and redirect path from URL hash
        if (typeof window !== 'undefined') {
          const hash = window.location.hash.substring(1); // Remove the # character
          const params = new URLSearchParams(hash);
          const token = params.get('token');
          const redirectPath = params.get('redirect') || '/profile';

          if (token) {
            console.log('Auth success: Token received, setting in localStorage');
            
            // Store token in localStorage
            localStorage.setItem('auth_token', token);
            
            // Update auth context
            setToken(token);
            
            // Fetch user profile
            await getProfile();
            
            // Redirect to the specified path
            router.push(redirectPath);
          } else {
            console.error('No token found in URL hash');
            router.push('/auth?error=no_token');
          }
        }
      } catch (error) {
        console.error('Error processing authentication:', error);
        router.push('/auth?error=auth_processing_failed');
      }
    };

    handleAuthSuccess();
  }, [router, setToken, getProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingBook message="Completing authentication..." />
    </div>
  );
}
