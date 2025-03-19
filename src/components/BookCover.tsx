'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BookCoverProps {
  title: string;
  author: string;
  coverUrl?: string;
  className?: string;
}

export function BookCover({ title, author, coverUrl, className = '' }: BookCoverProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // For debugging
  if (coverUrl) {
    console.log('📘 BookCover component rendering with URL:', coverUrl);
  } else {
    console.log('📘 BookCover component rendering without URL');
  }

  // Render placeholder if no URL or error occurred
  if (!coverUrl || imageError) {
    return (
      <div className={`aspect-[2/3] relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-700 to-gray-900 p-4 text-white">
          <div className="text-center max-w-full break-words">
            <div className="text-xs uppercase tracking-wide mb-2 opacity-75">
              {imageError ? 'Cover image failed' : 'No cover available'}
            </div>
            <div className="font-serif font-bold text-xl">{title}</div>
            <div className="mt-2 text-sm opacity-90">{author}</div>
          </div>
        </div>
      </div>
    );
  }

  // Render actual image with fallback handling
  return (
    <div className={`aspect-[2/3] relative bg-gray-200 shadow-inner overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse w-16 h-16 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      {/* Actual image */}
      <Image
        src={coverUrl}
        alt={`Cover of ${title}`}
        fill
        className="object-cover z-20"
        sizes="(max-width: 768px) 100vw, 300px"
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          console.error('Failed to load cover image:', coverUrl);
          setImageError(true);
        }}
        unoptimized={true}
        priority={true}
      />
    </div>
  );
} 