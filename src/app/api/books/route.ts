import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
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
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, author, coverUrl, epubUrl, isPublicDomain = false } = data;

    const book = await prisma.book.create({
      data: {
        title,
        author,
        coverUrl,
        epubUrl,
        isPublicDomain,
        uploadedById: session.user.id
      }
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 