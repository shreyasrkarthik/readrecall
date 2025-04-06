'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EPUBReader } from '@/components/BookReader/EPUBReader';

// A public domain EPUB for demo purposes - using a reliable source
const DEMO_EPUB_URL = 'https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/downloads/pride-and-prejudice_jane-austen.epub';

// Alternative sources if one fails
const BACKUP_EPUB_URLS = [
  'https://s3.amazonaws.com/moby-dick/moby-dick.epub',
  'https://www.gutenberg.org/ebooks/1342.epub.images'
];

export default function DemoPage() {
  const [isReading, setIsReading] = useState(false);
  const [currentEpubIndex, setCurrentEpubIndex] = useState(0);
  
  // Cycle through available EPUB sources
  const allEpubUrls = [DEMO_EPUB_URL, ...BACKUP_EPUB_URLS];
  
  const handleSourceChange = () => {
    setCurrentEpubIndex((prevIndex) => (prevIndex + 1) % allEpubUrls.length);
  };
  
  const currentEpubUrl = allEpubUrls[currentEpubIndex];
  const bookTitle = currentEpubIndex === 0 ? 'Pride and Prejudice' : 
                    currentEpubIndex === 1 ? 'Moby Dick' : 
                    'Pride and Prejudice (alt)';
  
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {isReading ? (
          <div className="flex flex-col h-screen">
            <div className="bg-white shadow-sm p-4 flex items-center justify-between">
              <button 
                onClick={() => setIsReading(false)}
                className="text-teal-600 hover:text-teal-700"
              >
                Exit Reader
              </button>
              <h1 className="text-lg font-bold text-center flex-1 truncate px-4">{bookTitle}</h1>
              <button
                onClick={handleSourceChange}
                className="text-teal-600 hover:text-teal-700 text-sm"
              >
                Try Another Source
              </button>
            </div>
            
            <div className="flex-1 relative">
              <EPUBReader 
                url={`/api/proxy?url=${encodeURIComponent(currentEpubUrl)}`}
                className="w-full h-full min-h-[calc(100vh-64px)]"
                key={currentEpubUrl} // Force remount when URL changes
              />
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Link href="/books" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8">
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Books
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">EPUB Reader Demo</h1>
              <p className="text-lg text-gray-600 mb-6">
                This is a demonstration of the EPUB reader functionality. Click the button below to read a sample book.
              </p>
              
              <button
                onClick={() => setIsReading(true)}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Open Demo Book
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">How it works</h2>
                <p className="text-blue-700">
                  This demo uses a public domain EPUB file and proxies it through our API to avoid CORS issues. 
                  The reader has next and previous buttons to navigate through the book.
                </p>
                <p className="text-blue-700 mt-2">
                  If one source doesn't load properly, you can try alternative sources using the "Try Another Source" button.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 