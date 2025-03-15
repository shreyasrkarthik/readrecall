import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { calculateReadingProgress } from '@/lib/epub';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const progress = await prisma.readingState.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: params.id
        }
      }
    });

    if (!progress) {
      return new NextResponse('Reading progress not found', { status: 404 });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    const { position } = data;

    // Get the book's total word count
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        sections: {
          orderBy: {
            orderIndex: 'desc'
          },
          take: 1
        }
      }
    });

    if (!book) {
      return new NextResponse('Book not found', { status: 404 });
    }

    const totalWords = book.sections[0]?.endPosition || 0;
    const progress = calculateReadingProgress(position, totalWords);

    // Update reading progress
    const updatedProgress = await prisma.readingState.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: params.id
        }
      },
      update: {
        currentPosition: position,
        progress,
        lastRead: new Date()
      },
      create: {
        userId: session.user.id,
        bookId: params.id,
        currentPosition: position,
        progress
      }
    });

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 