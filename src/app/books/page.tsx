import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { BookCard } from '@/components/Books/BookCard';
import { PrismaClient } from '@prisma/client';

type Book = NonNullable<Awaited<ReturnType<PrismaClient['book']['findUnique']>>>;
type ReadingState = NonNullable<Awaited<ReturnType<PrismaClient['readingState']['findUnique']>>>;

type BookWithReadingStates = Book & {
  readingStates: ReadingState[];
};

export default async function BooksPage() {
  const session = await getServerSession();

  if (!session?.user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in to view your books</h1>
          <p className="mt-2 text-gray-600">You need to be signed in to access your library.</p>
        </div>
      </div>
    );
  }

  const books = await prisma.book.findMany({
    where: {
      OR: [
        { isPublicDomain: true },
        { uploadedById: session.user.id }
      ]
    },
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
      readingStates: {
        where: {
          userId: session.user.id
        }
      }
    }
  }) as BookWithReadingStates[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Library</h1>
          <p className="mt-1 text-gray-600">
            {books.length} {books.length === 1 ? 'book' : 'books'} in your collection
          </p>
        </div>
        
        <Link
          href="/books/upload"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
        >
          Upload Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-900">No books yet</h2>
            <p className="mt-1 text-gray-600">
              Upload your first book or explore our public domain collection
            </p>
            <Link
              href="/books/upload"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
            >
              Upload a Book
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
} 