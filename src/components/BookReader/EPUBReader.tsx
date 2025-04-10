'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Global declaration for TypeScript
declare global {
  interface Window {
    ePub: any;
    JSZip: any;
  }
}

// Constants for script URLs
const JSZIP_URL = '/vendor/jszip.min.js';
const EPUB_URL = '/vendor/epub.min.js';

interface EPUBReaderProps {
  url: string;
  className?: string;
  onProgressUpdate?: (progress: number) => void;
}

export function EPUBReader({ url, className = '', onProgressUpdate }: EPUBReaderProps) {
  // Convert Cloudinary URLs to use our proxy to avoid CORS issues
  const proxyUrl = useMemo(() => {
    if (!url) return '';
    if (url.includes('cloudinary.com')) {
      return `/api/proxy/epub?url=${encodeURIComponent(url)}`;
    }
    return url;
  }, [url]);

  const viewerRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef<boolean>(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  
  // New state variables for progress tracking
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [isFooterExpanded, setIsFooterExpanded] = useState<boolean>(false);
  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);

  // Debug logger function
  const logDebug = useCallback((message: string, obj?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] 📚 ${message}`;
    console.log(logMessage, obj !== undefined ? obj : '');
    setDebugInfo(prev => `${prev}\n${logMessage}`);
    return logMessage;
  }, []);

  // Load required scripts
  useEffect(() => {
    if (!url) return;
    
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
  }, [url, logDebug]);

  // Update progress helper function
  const updateProgress = useCallback(() => {
    if (!book || !rendition) return;

    try {
      const location = rendition.location.start;
      if (!location) return;

      const currentLoc = book.locations.locationFromCfi(location.cfi);
      const totalLocs = book.locations.total;
      const percentage = book.locations.percentageFromCfi(location.cfi);

      setProgress(percentage || 0);
      if (onProgressUpdate) {
        onProgressUpdate(percentage || 0);
      }

      // Calculate current page
      const currentPageNum = Math.max(1, Math.round(currentLoc));
      setCurrentPage(currentPageNum);
      setTotalPages(totalLocs);

      logDebug('Progress updated:', {
        currentPage: currentPageNum,
        totalPages: totalLocs,
        percentage: Math.round((percentage || 0) * 100) + '%',
        location: currentLoc
      });

      // Update chapter information
      if (location.href) {
        const chapter = book.spine.get(location.href);
        if (chapter && chapter.label) {
          setCurrentChapter(chapter.label);
        } else {
          const spinePosition = book.spine.spineItems.findIndex(
            (item: any) => item.href === location.href
          );
          setCurrentChapter(`Chapter ${spinePosition + 1}`);
        }
      }
    } catch (err) {
      logDebug('Error updating progress:', err);
    }
  }, [book, rendition, logDebug, onProgressUpdate]);

  // Initialize book after scripts are loaded
  useEffect(() => {
    if (!scriptsLoaded || !proxyUrl) return;
    
    const initializeBook = async () => {
      // Prevent multiple simultaneous initialization attempts
      if (isInitializingRef.current) {
        logDebug('Book initialization already in progress, skipping');
        return;
      }
      
      isInitializingRef.current = true;
      
      try {
        setLoading(true);
        setError(null);
        
        // Clean up any existing book instance before creating a new one
        if (book) {
          logDebug('Cleaning up previous book instance');
          book.destroy();
          setBook(null);
          setRendition(null);
        }
        
        // Set a timeout for the loading process
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        
        timeoutIdRef.current = setTimeout(() => {
          setTimeoutWarning(true);
          logDebug('⚠️ Book loading is taking longer than expected');
          // Log diagnostics
          logDebug('Diagnostics:', {
            url: proxyUrl,
            originalUrl: url,
            scriptsLoaded,
            bookCreated: !!book,
            renditionCreated: !!rendition,
            viewerRefExists: !!viewerRef.current,
            viewerRefHeight: viewerRef.current?.clientHeight,
            viewerRefWidth: viewerRef.current?.clientWidth,
          });
        }, 5000);

        logDebug(`Creating Book from URL: ${proxyUrl}`);
        const newBook = window.ePub(proxyUrl, {
          openAs: 'epub',
          requestHeaders: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Range',
            'Accept-Encoding': 'gzip',
          }
        });
        setBook(newBook);
        
        logDebug('Book created, waiting for ready state');
        await newBook.ready;
        logDebug('Book ready ✅');
        
        if (!viewerRef.current) {
          throw new Error('Viewer reference not available');
        }
        
        logDebug('Creating rendition with dimensions:', {
          width: viewerRef.current.clientWidth,
          height: viewerRef.current.clientHeight || 600,
        });
        
        const newRendition = newBook.renderTo(viewerRef.current, {
          width: 500,
          height: viewerRef.current.clientHeight || 600,
          spread: 'none',
          flow: 'paginated'
        });
        
        // Keep styling approach simple but effective
        newRendition.hooks.content.register((contents: any) => {
          // Apply a more comprehensive stylesheet that ensures text is centered
          contents.addStylesheet(`
            body {
              font-family: Georgia, serif;
              line-height: 1.8;
              margin: 0 auto;
              max-width: 800px;
              padding: 0 40px;
              text-align: justify;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            
            p, div, h1, h2, h3, h4, h5, h6, section, article {
              width: 100%;
              max-width: 100%;
              margin-left: auto;
              margin-right: auto;
              text-align: justify;
            }
            
            .epub-view > div {
              margin: 0 auto;
            }
            
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 0 auto;
            }
          `);
          
          // Additional direct DOM manipulation to ensure centering
          if (contents.document.body) {
            const body = contents.document.body;
            body.style.margin = "0 auto";
            body.style.maxWidth = "800px";
            body.style.textAlign = "justify";
            
            // Center all text containers
            const textContainers = body.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6');
            textContainers.forEach((el: any) => {
              el.style.marginLeft = 'auto';
              el.style.marginRight = 'auto';
              el.style.maxWidth = '100%';
              el.style.textAlign = 'justify';
            });
          }
        });
        
        setRendition(newRendition);
        logDebug('Rendition created ✅');
        
        // Generate locations for better progress tracking first
        try {
          logDebug('Generating location points for progress tracking');
          await newBook.locations.generate(1024); // Using power of 2 for better distribution
          logDebug(`Generated ${newBook.locations.total} location points`);
          setTotalPages(newBook.locations.total);
        } catch (err) {
          logDebug('Error generating locations:', err);
        }
        
        logDebug('Displaying content');
        await newRendition.display();
        logDebug('Content displayed ✅');
        
        // Register progress event handler
        newRendition.on('relocated', (location: any) => {
          try {
            // Get the current location information
            const currentLoc = newBook.locations.locationFromCfi(location.start.cfi);
            const totalLocs = newBook.locations.total;
            const percentage = newBook.locations.percentageFromCfi(location.start.cfi);
            
            // Update progress
            setProgress(percentage || 0);
            if (onProgressUpdate) {
              onProgressUpdate(percentage || 0);
            }
            
            // Calculate current page
            const currentPageNum = Math.max(1, Math.round(currentLoc));
            setCurrentPage(currentPageNum);
            setTotalPages(totalLocs);
            
            logDebug('Location updated:', {
              currentPage: currentPageNum,
              totalPages: totalLocs,
              percentage: Math.round((percentage || 0) * 100) + '%',
              location: currentLoc
            });
            
            // Try to get chapter information
            if (location.start.href) {
              const chapter = newBook.spine.get(location.start.href);
              if (chapter && chapter.label) {
                setCurrentChapter(chapter.label);
              } else {
                const spinePosition = newBook.spine.spineItems.findIndex(
                  (item: any) => item.href === location.start.href
                );
                setCurrentChapter(`Chapter ${spinePosition + 1}`);
              }
            }
          } catch (err) {
            logDebug('Error updating progress:', err);
          }
        });

        // Handle page changes
        newRendition.on('rendered', (section: any) => {
          // We'll update progress in a safer way that doesn't reference updateProgress
          try {
            const location = newRendition.location.start;
            if (location) {
              const percentage = newBook.locations.percentageFromCfi(location.cfi);
              setProgress(percentage || 0);
              if (onProgressUpdate) {
                onProgressUpdate(percentage || 0);
              }
            }
          } catch (error) {
            logDebug('Error in rendered event:', error);
          }
        });
        
        // Setup event listeners for navigation and display
        newRendition.on('keyup', (event: KeyboardEvent) => {
          if (event.key === 'ArrowRight') {
            newRendition.next();
          }
          if (event.key === 'ArrowLeft') {
            newRendition.prev();
          }
        });
        
        // Register touch events for swipe navigation
        const handleTouchStart = (e: TouchEvent) => {
          touchStartXRef.current = e.changedTouches[0].screenX;
        };
        
        const handleTouchEnd = (e: TouchEvent) => {
          touchEndXRef.current = e.changedTouches[0].screenX;
          if (touchStartXRef.current - touchEndXRef.current > 50) {
            newRendition.next();
          } else if (touchEndXRef.current - touchStartXRef.current > 50) {
            newRendition.prev();
          }
        };
        
        viewerRef.current.addEventListener('touchstart', handleTouchStart, { passive: true });
        viewerRef.current.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        clearTimeout(timeoutIdRef.current || undefined);
        timeoutIdRef.current = null;
        setTimeoutWarning(false);
        setLoading(false);
        logDebug('Book fully initialized and displayed 🎉');
        
        // Return cleanup function for touch events
        return () => {
          if (viewerRef.current) {
            viewerRef.current.removeEventListener('touchstart', handleTouchStart);
            viewerRef.current.removeEventListener('touchend', handleTouchEnd);
          }
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        logDebug(`❌ Error initializing book: ${errorMsg}`);
        setError(`Failed to load book: ${errorMsg}`);
        setLoading(false);
      } finally {
        isInitializingRef.current = false;
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
  }, [scriptsLoaded, proxyUrl, onProgressUpdate, logDebug]);

  // Handler for window resize
  useEffect(() => {
    if (!rendition) return;
    
    const handleResize = () => {
      if (viewerRef.current && rendition) {
        logDebug('Window resized, updating rendition dimensions');
        rendition.resize(
          500,
          viewerRef.current.clientHeight || 800
        );
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rendition, logDebug]);

  // Navigation handlers - simplify to the bare minimum
  const handlePrev = () => {
    if (rendition) {
      rendition.prev();
      updateProgress();
    }
  };

  const handleNext = () => {
    if (rendition) {
      rendition.next();
      updateProgress();
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

  // Toggle footer expansion
  const toggleFooter = () => {
    setIsFooterExpanded(!isFooterExpanded);
    
    // Auto-collapse after 4 seconds if expanded
    if (!isFooterExpanded) {
      const timer = setTimeout(() => {
        setIsFooterExpanded(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  };
  
  // Handle slider change for navigation
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!book || !rendition) return;
    
    const newProgress = parseFloat(e.target.value) / 100;
    
    try {
      // Navigate to the position
      if (book.locations && book.locations.total) {
        const cfi = book.locations.cfiFromPercentage(newProgress);
        if (cfi) {
          rendition.display(cfi).then(() => {
            updateProgress();
          });
        }
      }
    } catch (err) {
      logDebug('Error navigating with slider:', err);
    }
  };

  // Render a different UI if no URL is provided
  if (!url) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`} style={{ minHeight: '400px' }}>
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold mb-2">No book available</h3>
          <p className="text-gray-600">This book doesn't have an associated EPUB file. Please try another book or contact support.</p>
        </div>
      </div>
    );
  }

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
        
        /* Simple, clean styling for better performance */
        .epub-view {
          background-color: white;
        }
        
        /* Progress bar styles */
        .progress-container {
          height: 4px;
          background-color: rgba(229, 231, 235, 0.8);
          cursor: pointer;
          transition: height 0.3s ease;
          position: relative;
          z-index: 20;
          margin-bottom: 0;
        }
        
        .progress-container:hover {
          height: 8px;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #000;
          transition: width 0.3s ease;
        }
        
        .reader-footer {
          background-color: rgba(255, 255, 255, 0.95);
          transform: translateY(0);
          transition: transform 0.3s ease, height 0.3s ease;
          z-index: 20;
          box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
          padding-bottom: env(safe-area-inset-bottom, 12px);
          min-height: 32px;
        }
        
        .reader-footer.collapsed {
          transform: translateY(100%);
        }
        
        .reader-footer-content {
          padding: 12px 16px 4px;
          background-color: rgba(255, 255, 255, 0.95);
        }
        
        /* Always visible mini footer */
        .mini-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px 16px;
          background-color: rgba(255, 255, 255, 0.95);
          z-index: 19;
          border-top: 1px solid rgba(229, 231, 235, 0.8);
          margin-top: 1px;
        }
        
        .progress-slider {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          background: #e5e7eb;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .progress-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .progress-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        
        .progress-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        
        .progress-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
        
        /* Chapter marker styles */
        .chapter-marker {
          width: 2px;
          height: 8px;
          background-color: rgba(0, 0, 0, 0.3);
          position: absolute;
          bottom: 0;
          transform: translateX(-50%);
        }
      `}</style>
      
      {/* Viewer Area - Added padding-bottom to make room for progress bar */}
      <div 
        ref={viewerRef} 
        className="w-full h-full bg-white pb-12"
        style={{ position: 'relative' }}
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
          
          {/* Progress Footer - Fixed positioning at the bottom of the container */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            {/* Progress Bar and Footer Container */}
            <div className="bg-white">
              {/* Thin Progress Bar (Always Visible) */}
              <div 
                className="progress-container w-full"
                onClick={toggleFooter}
              >
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
              
              {/* Always visible mini footer */}
              <div className="mini-footer">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {Math.round(progress * 100)}% Complete
                  </div>
                </div>
              </div>
              
              {/* Expandable Footer with Details */}
              <div className={`reader-footer ${isFooterExpanded ? '' : 'h-0 overflow-hidden'}`}>
                <div className="reader-footer-content">
                  {/* Middle Row: Current Chapter */}
                  {currentChapter && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Current Chapter:</span> {currentChapter}
                    </div>
                  )}
                  
                  {/* Bottom Row: Interactive Slider */}
                  <div className="relative w-full px-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress * 100}
                      onChange={handleSliderChange}
                      className="progress-slider w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 