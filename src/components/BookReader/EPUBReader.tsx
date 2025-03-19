'use client';

import { useState, useEffect, useRef } from 'react';

// Global declaration for TypeScript
declare global {
  interface Window {
    ePub: any;
    JSZip: any;
  }
}

// Constants for script URLs
const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
const EPUB_URL = 'https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js';

interface EPUBReaderProps {
  url: string;
  className?: string;
  onProgressUpdate?: (progress: number) => void;
}

export function EPUBReader({ url, className = '', onProgressUpdate }: EPUBReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  // Debug logger function
  const logDebug = (message: string, obj?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] 📚 ${message}`;
    console.log(logMessage, obj !== undefined ? obj : '');
    setDebugInfo(prev => `${prev}\n${logMessage}`);
    return logMessage;
  };

  // Load required scripts
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Check if scripts are already loaded
        if (typeof window.JSZip !== 'undefined' && typeof window.ePub !== 'undefined') {
          logDebug('Scripts already loaded in window ✅');
          setScriptsLoaded(true);
          return;
        }

        logDebug('Loading required scripts...');
        
        // Load JSZip first
        if (typeof window.JSZip === 'undefined') {
          logDebug('Loading JSZip...');
          await loadScript(JSZIP_URL);
          logDebug('JSZip loaded ✅');
        }
        
        // Then load EPUB.js
        if (typeof window.ePub === 'undefined') {
          logDebug('Loading EPUB.js...');
          await loadScript(EPUB_URL);
          logDebug('EPUB.js loaded ✅');
        }
        
        // Verify scripts are loaded
        if (typeof window.JSZip === 'undefined' || typeof window.ePub === 'undefined') {
          throw new Error('Failed to load required scripts');
        }
        
        setScriptsLoaded(true);
        logDebug('All scripts loaded successfully ✅');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error loading scripts';
        logDebug(`❌ Script loading error: ${errorMsg}`);
        setError(`Failed to load required scripts: ${errorMsg}`);
      }
    };
    
    // Helper function to load a script
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        
        document.head.appendChild(script);
      });
    };
    
    loadScripts();
  }, []);

  // Initialize book after scripts are loaded
  useEffect(() => {
    if (!scriptsLoaded || !url) return;
    
    const initializeBook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set a timeout for the loading process
        const timeoutId = setTimeout(() => {
          setTimeoutWarning(true);
          logDebug('⚠️ Book loading is taking longer than expected');
          // Log diagnostics
          logDebug('Diagnostics:', {
            url,
            scriptsLoaded,
            bookCreated: !!book,
            renditionCreated: !!rendition,
            viewerRefExists: !!viewerRef.current,
            viewerRefHeight: viewerRef.current?.clientHeight,
            viewerRefWidth: viewerRef.current?.clientWidth,
          });
        }, 5000);

        logDebug(`Creating Book from URL: ${url}`);
        const newBook = window.ePub(url);
        setBook(newBook);
        
        logDebug('Book created, waiting for ready state');
        await newBook.ready;
        logDebug('Book ready ✅');
        
        if (!viewerRef.current) {
          throw new Error('Viewer reference not available');
        }
        
        logDebug('Creating rendition with dimensions:', {
          width: viewerRef.current.clientWidth,
          height: viewerRef.current.clientHeight
        });
        
        const newRendition = newBook.renderTo(viewerRef.current, {
          width: viewerRef.current.clientWidth,
          height: viewerRef.current.clientHeight || 600, // Adjusted fallback height
          spread: 'auto',
          flow: 'paginated'
        });
        
        setRendition(newRendition);
        logDebug('Rendition created ✅');
        
        logDebug('Displaying content');
        await newRendition.display();
        logDebug('Content displayed ✅');
        
        // Register progress event handler
        if (onProgressUpdate) {
          newBook.on('rendition:relocated', (location: any) => {
            const progress = newBook.locations.percentageFromCfi(location.start.cfi);
            onProgressUpdate(progress);
          });
          logDebug('Progress tracking initialized');
        }
        
        clearTimeout(timeoutId);
        setTimeoutWarning(false);
        setLoading(false);
        logDebug('Book fully initialized and displayed 🎉');
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        logDebug(`❌ Error initializing book: ${errorMsg}`);
        setError(`Failed to load book: ${errorMsg}`);
        setLoading(false);
      }
    };
    
    initializeBook();
    
    // Cleanup function
    return () => {
      if (book) {
        logDebug('Cleaning up book resources');
        book.destroy();
      }
    };
  }, [scriptsLoaded, url, onProgressUpdate]);

  // Handler for window resize
  useEffect(() => {
    if (!rendition) return;
    
    const handleResize = () => {
      if (viewerRef.current && rendition) {
        logDebug('Window resized, updating rendition dimensions');
        rendition.resize(
          viewerRef.current.clientWidth,
          viewerRef.current.clientHeight || 800
        );
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rendition]);

  // Navigation handlers
  const handlePrev = () => {
    if (rendition) {
      logDebug('Navigating to previous page');
      rendition.prev();
    }
  };

  const handleNext = () => {
    if (rendition) {
      logDebug('Navigating to next page');
      rendition.next();
    }
  };

  // Retry loading
  const handleRetry = () => {
    logDebug('Retry requested, reloading book');
    setBook(null);
    setRendition(null);
    setLoading(true);
    setError(null);
    setTimeoutWarning(false);
  };

  return (
    <div className={`flex flex-col relative ${className}`}>
      {/* Add global styles for content */}
      <style jsx global>{`
        /* Ensure content fills available space */
        .epub-container {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        
        /* Make iframe take full height */
        .epub-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Style content within iframe */
        .epub-container iframe html,
        .epub-container iframe body {
          width: 100% !important;
          height: auto !important;
          margin: 0 auto !important;
          padding: 20px !important;
          font-family: Georgia, serif !important;
          font-size: 1.1em !important;
          line-height: 1.6 !important;
        }
        
        /* Add padding to content for readability */
        .epub-view > div {
          padding: 0 10px !important;
        }
        
        /* Ensure images scale properly */
        .epub-container img {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
      
      {/* Viewer Area */}
      <div 
        ref={viewerRef} 
        className="w-full h-full bg-white"
      >
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-700 text-center mb-2">Loading book...</p>
            
            {timeoutWarning && (
              <>
                <p className="text-amber-600 text-center mt-4 mb-2">
                  Loading is taking longer than expected
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                >
                  Retry
                </button>
                <div className="mt-4 p-4 bg-gray-100 rounded max-w-md overflow-auto max-h-[200px] text-xs text-gray-800 font-mono whitespace-pre-wrap">
                  {debugInfo || 'No debug information available'}
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center h-full bg-red-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
              <h3 className="text-xl font-bold text-red-700 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="mb-4 p-4 bg-gray-100 rounded overflow-auto max-h-[200px] text-xs text-gray-800 font-mono whitespace-pre-wrap">
                {debugInfo || 'No debug information available'}
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Controls - Now positioned as side buttons */}
      {!loading && !error && (
        <>
          {/* Previous button - left side */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 px-3 py-6 bg-black bg-opacity-70 text-white rounded-md hover:bg-opacity-90 focus:outline-none transition-all duration-200 shadow-lg z-10"
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Next button - right side */}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-6 bg-black bg-opacity-70 text-white rounded-md hover:bg-opacity-90 focus:outline-none transition-all duration-200 shadow-lg z-10"
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
} 