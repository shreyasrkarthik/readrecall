import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const positionParam = searchParams.get('position') || '0';
    const position = parseInt(positionParam);
    const { id: bookId } = await context.params;
    
    console.log('Processing request:', { bookId, position });

    // Check if we already have a saved summary for this position
    console.log('Checking for existing summary...');
    const existingSummary = await prisma.summary.findFirst({
      where: {
        bookId: bookId,
        position: {
          lte: position
        }
      },
      orderBy: {
        position: 'desc'
      }
    });

    if (existingSummary) {
      console.log('Found existing summary:', { id: existingSummary.id, position: existingSummary.position });
      return NextResponse.json(existingSummary, { status: 200 });
    }

    // If no summary exists, return a placeholder
    console.log('No summary found, returning placeholder');
    return NextResponse.json({ 
      id: 'placeholder', 
      bookId: bookId, 
      position, 
      content: 'No summary available for this position yet.', 
      createdAt: new Date() 
    }, { status: 200 });
  } catch (error) {
    console.error('Error in summary API:', error);
    return NextResponse.json(
      { 
        id: 'error', 
        bookId: (await context.params).id || 'unknown', 
        position: 0, 
        content: 'We encountered an error retrieving the summary. Please try again later.', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 