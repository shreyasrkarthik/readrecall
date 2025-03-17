import { getServerSession } from 'next-auth';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { BookCard } from '@/components/Books/BookCard';
import { PrismaClient } from '@prisma/client';
import { getBookTheme, getAppTheme } from '@/lib/colors';

type Book = NonNullable<Awaited<ReturnType<PrismaClient['book']['findUnique']>>>;
type ReadingState = NonNullable<Awaited<ReturnType<PrismaClient['readingState']['findUnique']>>>;

type BookWithReadingStates = Book & {
  readingStates: ReadingState[];
};

// Book card component for horizontal layout
function HorizontalBookCard({ book }: { book: BookWithReadingStates }) {
  const theme = getBookTheme(book.title);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-1/3 h-48 md:h-auto relative">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-black p-4 text-white`}>
              <span className="text-center font-medium">{book.title}</span>
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col justify-between flex-1">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
            <p className="text-gray-600 mb-4">{book.author}</p>
            <p className="text-gray-500 text-sm">
              Public Domain Classic
            </p>
          </div>
          <Link 
            href={`/books/${book.id}`}
            className="mt-4 inline-flex items-center font-medium text-teal-600 hover:text-teal-700"
          >
            <span>Read now</span>
            <svg className="ml-1 w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function BooksPage() {
  const session = await getServerSession();
  const appTheme = getAppTheme();
  
  const books = await prisma.book.findMany({
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
      readingStates: {
        where: {
          userId: session?.user?.id
        }
      }
    }
  }) as BookWithReadingStates[];

  // Get featured books (first 3)
  const featuredBooks = books.slice(0, 3);
  // Get remaining books
  const remainingBooks = books.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-8">
      <div className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="mb-12 text-center">
          <h1 className={`text-4xl font-bold mb-4 ${appTheme.primary} ${appTheme.darkPrimary}`}>
            Discover Your Next Great Read
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of {books.length} {books.length === 1 ? 'book' : 'books'} and find your next adventure.
          </p>
        </div>
        
        {/* Action bar */}
        <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
              {books.length} {books.length === 1 ? 'book' : 'books'} available
            </span>
            <div className="h-4 w-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">
              Sort by: <span className="font-medium">Recently Added</span>
            </span>
          </div>
          
          {session?.user && (
            <Link
              href="/books/upload"
              className="rounded-lg bg-teal-600 px-4 py-2 text-white shadow-sm hover:bg-teal-700 transition-all duration-200"
            >
              Upload Book
            </Link>
          )}
        </div>

        {books.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
            <div className="text-center max-w-md p-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">No books available</h2>
              <p className="text-gray-600 mb-6">
                Our library is currently empty. Check back soon for our growing collection of books.
              </p>
              {session?.user && (
                <Link
                  href="/books/upload"
                  className={`inline-flex items-center ${appTheme.accent} font-medium ${appTheme.hover}`}
                >
                  <span>Upload your first book</span>
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Featured books section */}
            {featuredBooks.length > 0 && (
              <div className="mb-12">
                <h2 className={`text-2xl font-bold ${appTheme.primary} ${appTheme.darkPrimary} mb-6`}>Featured Books</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredBooks.map((book) => (
                    <HorizontalBookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}
            
            {/* All books section */}
            {remainingBooks.length > 0 && (
              <div>
                <h2 className={`text-2xl font-bold ${appTheme.primary} ${appTheme.darkPrimary} mb-6`}>More Books to Explore</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                  {remainingBooks.map((book) => (
                    <HorizontalBookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 