'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestReaderPage() {
  const [bookUrl, setBookUrl] = useState('https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/downloads/pride-and-prejudice_jane-austen.epub');
  const [status, setStatus] = useState<string>('Not loaded');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Load required scripts
    const loadRequiredScripts = async () => {
      try {
        setStatus('Loading scripts...');
        
        // Load JSZip and EPUB.js
        await Promise.all([
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
          loadScript('https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js')
        ]);
        
        setStatus('Scripts loaded');
      } catch (err) {
        setError(`Failed to load scripts: ${err instanceof Error ? err.message : String(err)}`);
        setStatus('Script loading failed');
      }
    };
    
    loadRequiredScripts();
  }, []);
  
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      
      document.head.appendChild(script);
    });
  };
  
  const loadBook = async () => {
    try {
      setStatus('Loading book...');
      setError(null);
      
      // Clear previous book instance
      const container = document.getElementById('epub-container');
      if (container) container.innerHTML = '';
      
      // Check if we have the global ePub constructor
      if (typeof window.ePub !== 'function') {
        throw new Error('EPUB.js not loaded properly');
      }
      
      // Use proxy for external URLs
      const finalUrl = bookUrl.startsWith('http') 
        ? `/api/proxy?url=${encodeURIComponent(bookUrl)}`
        : bookUrl;
      
      setStatus(`Creating book instance from: ${finalUrl}`);
      
      // Create book instance
      const book = window.ePub(finalUrl);
      
      setStatus('Waiting for book to be ready...');
      await book.ready;
      
      setStatus('Book is ready, creating rendition...');
      
      // Get container
      if (!container) {
        throw new Error('Container element not found');
      }
      
      // Render the book
      const rendition = book.renderTo(container, {
        width: '100%',
        height: '100%'
      });
      
      setStatus('Displaying content...');
      await rendition.display();
      
      // Add navigation buttons
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      
      if (prevBtn) prevBtn.onclick = () => rendition.prev();
      if (nextBtn) nextBtn.onclick = () => rendition.next();
      
      setStatus('Book loaded successfully');
    } catch (err) {
      console.error('Error loading book:', err);
      setError(`${err instanceof Error ? err.message : String(err)}`);
      setStatus('Failed to load book');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <Link href="/books" className="text-teal-600 hover:text-teal-700">
            ← Back to Books
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-6">EPUB Reader Test Page</h1>
          
          <div className="bg-white p-4 rounded-md shadow mb-4">
            <h2 className="text-lg font-semibold mb-2">Book URL</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={bookUrl}
                onChange={(e) => setBookUrl(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              />
              <button 
                onClick={loadBook}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                Load Book
              </button>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-600">Status: <span className="font-medium">{status}</span></p>
              {error && (
                <p className="text-sm text-red-600 mt-1">Error: {error}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 mb-6">
          <div className="flex justify-between mb-4">
            <button 
              id="prev-btn"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Previous
            </button>
            <button 
              id="next-btn"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          
          <div 
            id="epub-container" 
            className="border border-gray-200 rounded-md h-[70vh] overflow-hidden"
          >
            <div className="flex items-center justify-center h-full text-gray-500">
              No book loaded. Enter a URL and click "Load Book" to start.
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Testing Instructions</h2>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>This page loads EPUB.js directly for debugging purposes</li>
            <li>You can test different EPUB sources by entering the URL and clicking "Load Book"</li>
            <li>The proxy will be used automatically for external URLs</li>
            <li>Check the browser console for more detailed error messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Declare the ePub global variable for TypeScript
declare global {
  interface Window {
    ePub: any;
  }
} 