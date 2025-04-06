import Image from 'next/image';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { getBookTheme } from '@/lib/colors';

type Book = NonNullable<Awaited<ReturnType<PrismaClient['book']['findUnique']>>>;
type ReadingState = NonNullable<Awaited<ReturnType<PrismaClient['readingState']['findUnique']>>>;

type BookWithReadingStates = Book & {
  readingStates: ReadingState[];
};

interface BookCardProps {
  book: BookWithReadingStates;
}

export function BookCard({ book }: BookCardProps) {
  const readingState = book.readingStates[0];
  // Calculate progress from position (assuming position ranges from 0 to 10000)
  const progress = readingState ? Math.min(Math.round((readingState.position / 10000) * 100), 100) : 0;
  
  // Get the consistent theme for this book
  const theme = getBookTheme(book.title);
  
  // Generate a pattern for books without covers
  const getPatternStyle = (title: string) => {
    const patterns = [
      'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
      'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
      'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
      'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)',
      'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
    ];
    
    const sum = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return patterns[sum % patterns.length];
  };

  return (
    <Link href={`/books/${book.id}`} className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 shadow-md transition-all duration-200 group-hover:shadow-xl group-hover:translate-y-[-5px] border border-gray-200">
        {/* Book cover */}
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div 
            className="flex h-full items-center justify-center p-4 bg-black text-white"
            style={{ 
              backgroundImage: getPatternStyle(book.title),
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Book spine */}
            <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gray-800"></div>
            
            {/* Book title */}
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold mb-2 text-white line-clamp-4">{book.title}</div>
              <div className="text-sm font-medium text-gray-300">{book.author}</div>
            </div>
            
            {/* Book decoration */}
            <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Overlay with book info on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 flex flex-col justify-end p-3 transition-all duration-300 group-hover:bg-opacity-70">
          <div className="transform translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <h3 className="text-white font-bold text-sm line-clamp-2">{book.title}</h3>
            <p className="text-white text-xs opacity-80">{book.author}</p>
          </div>
        </div>
        
        {/* Reading progress */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800 bg-opacity-50">
            <div
              className="h-full bg-teal-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* "New" badge for recently added books */}
        {new Date(book.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            NEW
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:text-gray-800">
          {book.title}
        </h3>
        <p className="text-sm text-gray-500">{book.author}</p>
      </div>
    </Link>
  );
} 