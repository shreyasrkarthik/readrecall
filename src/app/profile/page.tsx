'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-20 flex justify-center">
        <div className="animate-pulse w-full max-w-3xl bg-white rounded-lg shadow p-8 mt-8">
          <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-900 py-8">
          <div className="flex flex-col items-center">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'Profile picture'}
                width={128}
                height={128}
                className="rounded-full border-4 border-white shadow"
                priority
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-teal-800 flex items-center justify-center text-white text-4xl font-bold">
                {session.user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <h1 className="mt-4 text-2xl font-bold text-white">{session.user?.name || 'User'}</h1>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-gray-500 sm:w-32">Email</span>
                  <span className="mt-1 sm:mt-0 text-gray-800">{session.user?.email || 'Not provided'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-gray-500 sm:w-32">User ID</span>
                  <span className="mt-1 sm:mt-0 text-gray-800">{session.user?.id || 'Not available'}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800">Account Settings</h2>
              <div className="mt-4">
                <button
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 transition-colors"
                  onClick={() => router.push('/books')}
                >
                  View My Books
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 