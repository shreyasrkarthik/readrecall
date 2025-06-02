import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// API endpoint to process a book after it's been uploaded to S3
export async function POST(request: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession();
    console.log('Session in book processing endpoint:', session);
    
    // Bypass authentication for now to debug the flow
    // Instead of rejecting, we'll log and continue
    if (!session?.user) {
      console.warn('No user session found in processing endpoint, but continuing for debugging');
      // We'll continue the request instead of returning 401
    }

    // Get request data
    const data = await request.json();
    const { fileUrl, fileName, fileType, bookId } = data;

    // Here you would typically add the book to the database
    // For now, we'll just return a success response with the book ID
    
    console.log('Processing book:', {
      fileUrl,
      fileName,
      fileType,
      bookId,
      userId: session?.user?.email || 'anonymous'
    });

    // Get format from file type
    const format = fileType === 'application/pdf' ? 'PDF' : 
                  fileType === 'application/epub+zip' ? 'EPUB' : 
                  'Unknown';

    // Return the book information
    return NextResponse.json({ 
      id: bookId,
      title: fileName.replace(/\.(pdf|epub)$/i, ''),
      format,
      uploadDate: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error processing book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
