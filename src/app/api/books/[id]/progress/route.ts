import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create a mock reading progress for any book
    const mockProgress = {
      userId: 'anonymous',
      bookId: params.id,
      currentPosition: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json(mockProgress);
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { progress, currentPosition } = data;

    // No need to store progress, just acknowledge receipt
    return NextResponse.json({
      userId: 'anonymous',
      bookId: params.id,
      currentPosition,
      progress,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 