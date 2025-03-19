import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get all books, no authentication required
    const books = await prisma.book.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        readingStates: {
          take: 1 // Just include one reading state for display
        }
      }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST method removed as it's not needed for public reading functionality 