import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for fetching EPUB files through the server to avoid CORS issues
 */
export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query params
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Only allow cloudinary URLs to prevent open proxy abuse
    if (!url.includes('cloudinary.com')) {
      return NextResponse.json({ error: 'Only Cloudinary URLs are allowed' }, { status: 403 });
    }

    // Fetch the file
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    // Get the file content
    const fileBuffer = await response.arrayBuffer();

    // Create response with appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/epub+zip');
    headers.set('Content-Length', fileBuffer.byteLength.toString());
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error proxying EPUB file:', error);
    return NextResponse.json({ error: 'Failed to proxy EPUB file' }, { status: 500 });
  }
} 