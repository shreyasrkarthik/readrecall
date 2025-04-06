'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { EPUBReader } from '@/components/BookReader/EPUBReader';
import { getBookTheme } from '@/lib/colors';
import { BookCover } from '@/components/BookCover';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  epubUrl?: string;
  isPublicDomain: boolean;
  uploadedById?: string;
  createdAt: string;
  updatedAt: string;
}

// For testing, use a known working EPUB URL if a book's URL is missing
const FALLBACK_EPUB_URL = 'https://s3.amazonaws.com/moby-dick/moby-dick.epub';

// Create a memoized version of the EPUBReader component
const MemoizedEPUBReader = memo(({ url, className, onProgressUpdate }: { 
  url: string, 
  className: string, 
  onProgressUpdate: (progress: number) => void 
}) => {
  console.log('📚 Rendering Memoized EPUBReader with URL:', url);
  return (
    <EPUBReader 
      url={url} 
      className={className}
      onProgressUpdate={onProgressUpdate}
    />
  );
});
MemoizedEPUBReader.displayName = 'MemoizedEPUBReader';

// Create a separate component for the Summary section to isolate state changes
const SummarySection = memo(({ book, currentPosition }: { book: Book, currentPosition: number }) => {
  console.log('Rendering SummarySection');
  
  const [summaryContent, setSummaryContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  
  // Fetch summary when position changes
  useEffect(() => {
    const fetchSummary = async () => {
      if (!book?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching summary for book ${book.id} at position ${currentPosition}`);
        
        // Call the summary API with the current position
        const response = await fetch(`/api/books/${book.id}/summary?position=${currentPosition}`, {
          cache: 'no-store'
        });
        
        // Parse response as JSON
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Valid summary response
        setSummaryContent(data.content || '');
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError('We couldn\'t load the summary right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, [book?.id, currentPosition]);

  
  // Format the reading progress for display
  const formattedProgress = Math.round((currentPosition / 10000) * 100);
  
  // Handle toggle click
  const handleToggleClick = () => {
    console.log('Toggle clicked, current showSummary:', showSummary);
    setShowSummary(!showSummary);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Book Summary</h2>
        <button 
          onClick={handleToggleClick}
          className="px-3 py-1 text-sm rounded border border-gray-300 bg-black text-white hover:bg-gray-800 transition-colors"
        >
          {showSummary ? 'Hide Summary' : 'Show Summary'}
        </button>
      </div>
      
      <div className="prose max-w-none">
        {showSummary ? (
          <>
            {currentPosition > 0 && (
              <div className="mb-4 text-sm text-gray-500 italic border-b border-gray-200 pb-2">
                Summary up to {formattedProgress}% of the book
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                <p className="mt-2 text-gray-600">Loading summary...</p>
              </div>
            ) : error ? (
              <div className="py-4">
                <p className="text-red-500 mb-2">{error}</p>
              </div>
            ) : summaryContent ? (
              <div className="text-gray-700">
                {summaryContent.split('\n').map((paragraph, index) => (
                  <p key={index} className={index < summaryContent.split('\n').length - 1 ? 'mb-3' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-8">
                {currentPosition === 0 
                  ? 'Start reading to see a summary of the book.' 
                  : 'No summary available for your current reading position.'}
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic text-center py-8">
            Click "Show Summary" to view a summary up to your current reading position.
          </p>
        )}
      </div>
    </div>
  );
});
SummarySection.displayName = 'SummarySection';

// Create a separate component for the Characters section
const CharactersSection = memo(({ book, currentPosition }: { book: Book | null, currentPosition: number }) => {
  const [showCharacters, setShowCharacters] = useState(false);
  
  // Format the reading progress for display
  const formattedProgress = Math.round((currentPosition / 10000) * 100);
  
  // Handle toggle click
  const handleToggleClick = () => {
    setShowCharacters(!showCharacters);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Key Characters</h2>
        <button 
          onClick={handleToggleClick}
          className="px-3 py-1 text-sm rounded border border-gray-300 bg-black text-white hover:bg-gray-800 transition-colors"
        >
          {showCharacters ? 'Hide Characters' : 'Show Characters'}
        </button>
      </div>
      
      <div className="prose max-w-none">
        {showCharacters ? (
          <>
            {currentPosition > 0 && (
              <div className="mb-4 text-sm text-gray-500 italic border-b border-gray-200 pb-2">
                Characters up to {formattedProgress}% of the book
              </div>
            )}
            
            <p className="text-gray-500 italic text-center py-8">
              Character information feature is currently under development. Check back soon!
            </p>
          </>
        ) : (
          <p className="text-gray-500 italic text-center py-8">
            Click "Show Characters" to view characters encountered up to your current reading position.
          </p>
        )}
      </div>
    </div>
  );
});
CharactersSection.displayName = 'CharactersSection';

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  
  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Fetch the book from the API
        console.log(`📚 Fetching book with ID: ${bookId}`);
        const response = await fetch(`/api/books/${bookId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed to load book: ${response.status} ${response.statusText}`, errorText);
          setError(`Failed to load book: ${errorText || response.statusText}`);
          return;
        }
        
        const data = await response.json();
        console.log('📕 Book data retrieved:', {
          id: data.id,
          title: data.title,
          author: data.author,
          hasEpubUrl: !!data.epubUrl,
          hasCoverUrl: !!data.coverUrl,
          coverUrl: data.coverUrl,
        });
        
        // Validate the coverUrl if it exists
        if (data.coverUrl) {
          try {
            const urlObj = new URL(data.coverUrl);
            console.log('📘 Cover URL appears valid:', urlObj.toString());
          } catch (e) {
            console.warn('⚠️ Cover URL is not a valid URL:', data.coverUrl);
          }
        }
        
        setBook(data);
      } catch (err) {
        console.error('❌ Error fetching book:', err);
        setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [bookId, router]);
  
  // Get the theme for the book if it exists
  const theme = book ? getBookTheme(book.title) : {};
  
  // Function to get a reliable EPUB URL
  const getReliableEpubUrl = (book: Book | null) => {
    if (!book) return null;
    
    // Use the book's EPUB URL if available
    if (book.epubUrl) {
      console.log('📚 Using book\'s EPUB URL:', book.epubUrl);
      return book.epubUrl;
    }
    
    // Fall back to a known working URL for testing
    console.log('⚠️ Book has no EPUB URL, using fallback URL for testing');
    return FALLBACK_EPUB_URL;
  };
  
  // Track if scripts are loaded
  useEffect(() => {
    const checkScriptsLoaded = () => {
      const scriptsLoaded = typeof window.ePub !== 'undefined';
      console.log('EPUBjs available in window:', scriptsLoaded ? 'Yes ✅' : 'No ❌');
    };
    
    // Check on mount
    checkScriptsLoaded();
    
    // And after a delay
    const timer = setTimeout(checkScriptsLoaded, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  // Memoize the progress update handler to prevent recreating on each render
  const handleProgressUpdate = useCallback((progress: number) => {
    console.log(`Reading progress: ${Math.round(progress * 100)}%`);
    
    // Update current position when progress changes
    if (book) {
      // Estimate position based on progress percentage
      // This is a simplification - ideally we would get the actual position from the reader
      const estimatedPosition = Math.round(progress * 10000); // Scale to a reasonable number
      setCurrentPosition(estimatedPosition);
    }
  }, [book]);
  
  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : error || !book ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error || 'Book not found'}</p>
            <Link href="/books" className="mt-4 inline-block text-teal-600 hover:text-teal-700">
              ← Back to Books
            </Link>
          </div>
        </div>
      ) : isReading ? (
        <div className="min-h-screen flex flex-col w-full">
          <div className="bg-white shadow-sm p-4 flex items-center justify-between w-full border-b border-gray-200">
            <Link href="/books" className="text-teal-600 hover:text-teal-700 flex items-center">
              ← Back to Books
            </Link>
            <h1 className="text-lg font-bold text-center flex-1 truncate px-4">{book.title}</h1>
            <button 
              onClick={() => setIsReading(false)}
              className="text-teal-600 hover:text-teal-700"
            >
              Exit Reader
            </button>
          </div>
          
          {/* Main content area with consistent styling */}
          <div className="bg-gray-100 w-full px-4 py-6 flex-1">
            <div className="container mx-auto">
              {/* EPUBReader Section */}
              <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Reading: {book.title}</h2>
                  <div className="text-sm text-gray-500">By {book.author}</div>
                </div>
                <div className="reader-container p-0" style={{ 
                  height: 'calc(100vh - 320px)',
                  minHeight: '500px',
                  width: '100%',
                  position: 'relative'
                }}>
                  {(() => {
                    // Log outside of JSX to avoid linter errors
                    console.log('📚 Preparing to render EPUBReader with URL:', getReliableEpubUrl(book));
                    return null;
                  })()}
                  <MemoizedEPUBReader 
                    url={getReliableEpubUrl(book) || ''} 
                    className="w-full h-full"
                    onProgressUpdate={handleProgressUpdate}
                  />
                </div>
              </div>
              
              {/* Summary and Characters Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Book Summary Section */}
                {book && <SummarySection book={book} currentPosition={currentPosition} />}
                
                {/* Characters Section */}
                <CharactersSection book={book} currentPosition={currentPosition} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Link href="/books" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8">
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="black">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Books
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 relative">
                  <BookCover
                    title={book.title}
                    author={book.author}
                    coverUrl={book.coverUrl}
                  />
                </div>
                
                <div className="p-8 md:w-2/3">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                  <p className="text-xl text-gray-600 mb-6">{book.author}</p>
                  
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">About this book</h2>
                    <p className="text-gray-600">
                      {book.isPublicDomain 
                        ? 'This is a public domain classic available for everyone to read.' 
                        : 'This book was uploaded by a user.'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsReading(true)}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Read Now
                    <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 