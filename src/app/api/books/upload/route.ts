import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/cloudinary';
import { processEpub } from '@/lib/epub';

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Upload file to Cloudinary
    const epubUrl = await uploadFile(file);

    // Process EPUB file
    const { sections, metadata } = await processEpub(epubUrl);

    // Create book in database
    const book = await prisma.book.create({
      data: {
        title: metadata.title,
        author: metadata.author,
        coverUrl: metadata.cover,
        epubUrl,
        uploadedById: session.user.id,
        sections: {
          create: sections
        }
      },
      include: {
        sections: true
      }
    });

    // Create initial reading state
    await prisma.readingState.create({
      data: {
        userId: session.user.id,
        bookId: book.id,
        currentPosition: 0,
        progress: 0
      }
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error uploading book:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 