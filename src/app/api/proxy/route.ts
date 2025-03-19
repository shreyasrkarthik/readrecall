import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    console.log(`Proxying request to: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return new NextResponse(`Failed to fetch from the original URL: ${response.status}`, {
        status: response.status
      });
    }
    
    // Get the data as array buffer
    const data = await response.arrayBuffer();
    
    // Set appropriate headers for EPUB files
    const headers = new Headers();
    headers.set('Content-Type', 'application/epub+zip');
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new NextResponse(data, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(`Error proxying the requested URL: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500 
    });
  }
} 