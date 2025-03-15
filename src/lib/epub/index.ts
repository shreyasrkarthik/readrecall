import { Book as EpubBook } from 'epubjs';
import { BookSection } from '@/types';

export async function processEpub(url: string): Promise<{
  sections: Omit<BookSection, 'id' | 'bookId' | 'createdAt'>[];
  metadata: {
    title: string;
    author: string;
    cover?: string;
  };
}> {
  // @ts-ignore - ePub is loaded from CDN
  const book = new ePub(url);
  await book.ready;

  // Get metadata
  const metadata = await book.loaded.metadata;
  const title = metadata.title;
  const author = metadata.creator;

  // Get cover
  let cover: string | undefined;
  try {
    const coverUrl = await book.coverUrl();
    if (coverUrl) {
      cover = coverUrl;
    }
  } catch (error) {
    console.warn('No cover found for book');
  }

  // Process sections
  const sections: Omit<BookSection, 'id' | 'bookId' | 'createdAt'>[] = [];
  const spine = await book.loaded.spine;
  let position = 0;

  for (let i = 0; i < spine.length; i++) {
    const item = spine[i];
    const content = await item.load();
    const text = content.textContent || '';
    const wordCount = text.split(/\s+/).length;

    sections.push({
      title: item.title || `Section ${i + 1}`,
      content: text,
      orderIndex: i,
      startPosition: position,
      endPosition: position + wordCount
    });

    position += wordCount;
  }

  return {
    sections,
    metadata: {
      title,
      author,
      cover
    }
  };
}

export function calculateReadingProgress(
  currentPosition: number,
  totalWords: number
): number {
  return Math.min(Math.round((currentPosition / totalWords) * 100), 100);
} 