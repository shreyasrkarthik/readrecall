import Image from 'next/image';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

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
  const progress = readingState?.progress || 0;

  return (
    <Link href={`/books/${book.id}`} className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 shadow-md transition-all duration-200 hover:shadow-lg">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200 p-4">
            <span className="text-center text-gray-500">{book.title}</span>
          </div>
        )}
        
        {/* Progress bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="mt-2 space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
          {book.title}
        </h3>
        <p className="text-sm text-gray-500">{book.author}</p>
      </div>
    </Link>
  );
} 