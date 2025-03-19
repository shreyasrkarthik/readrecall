import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Attempting to fetch book with ID:', params.id);
    
    if (!params.id) {
      console.error('Missing book ID parameter');
      return new NextResponse('Missing book ID', { status: 400 });
    }
    
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        readingStates: {
          take: 1 // Just get one reading state for display purposes
        },
        sections: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!book) {
      console.log(`Book not found with ID: ${params.id}`);
      return new NextResponse('Book not found', { status: 404 });
    }

    // Allow access to all books without authentication
    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

// PUT and DELETE methods are removed as they're not needed for basic reading functionality
// If editing functionality is needed later, they can be reimplemented without authentication requirements 