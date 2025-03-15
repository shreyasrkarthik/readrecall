import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        readingStates: {
          where: { userId: session.user.id }
        },
        sections: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!book) {
      return new NextResponse('Book not found', { status: 404 });
    }

    // Check if user has access to this book
    if (!book.isPublicDomain && book.uploadedById !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, author, coverUrl, epubUrl } = data;

    const book = await prisma.book.findUnique({
      where: { id: params.id }
    });

    if (!book) {
      return new NextResponse('Book not found', { status: 404 });
    }

    // Only allow updates by the book's owner
    if (book.uploadedById !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: {
        title,
        author,
        coverUrl,
        epubUrl
      }
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id }
    });

    if (!book) {
      return new NextResponse('Book not found', { status: 404 });
    }

    // Only allow deletion by the book's owner
    if (book.uploadedById !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.book.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting book:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 