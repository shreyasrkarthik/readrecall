import { useEffect, useRef, useState } from 'react';
import { Book as EpubBook } from 'epubjs';
import { ReadingState } from '@/types';

interface EPUBReaderProps {
  url: string;
  onProgressUpdate?: (progress: number) => void;
  initialLocation?: string;
  className?: string;
}

export function EPUBReader({
  url,
  onProgressUpdate,
  initialLocation,
  className = 'w-full h-full'
}: EPUBReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const initBook = async () => {
      // @ts-ignore - ePub is loaded from CDN
      const newBook = new ePub(url);
      setBook(newBook);

      const newRendition = newBook.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none'
      });

      setRendition(newRendition);

      if (initialLocation) {
        await newRendition.display(initialLocation);
      } else {
        await newRendition.display();
      }

      newRendition.on('locationChanged', (location: any) => {
        const progress = newBook.locations.percentageFromCfi(location);
        onProgressUpdate?.(progress);
      });
    };

    initBook();

    return () => {
      if (book) {
        book.destroy();
      }
    };
  }, [url, initialLocation]);

  const handleNext = () => {
    rendition?.next();
  };

  const handlePrev = () => {
    rendition?.prev();
  };

  return (
    <div className={className}>
      <div ref={viewerRef} className="w-full h-full" />
      <div className="fixed bottom-4 right-4 flex gap-2">
        <button
          onClick={handlePrev}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
} 