import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const positionParam = searchParams.get('position') || '0';
  const position = parseInt(positionParam);

  try {
    // First, check if we already have a summary for this position
    const existingSummary = await prisma.summary.findFirst({
      where: {
        bookId: params.id,
        position: {
          lte: position
        }
      },
      orderBy: {
        position: 'desc'
      }
    });

    if (existingSummary) {
      return NextResponse.json(existingSummary);
    }

    // If no summary exists, get the book content up to the position
    const sections = await prisma.bookSection.findMany({
      where: {
        bookId: params.id,
        endPosition: {
          lte: position
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    if (sections.length === 0) {
      return new NextResponse('No content found up to this position', { status: 404 });
    }

    // Combine the content from all sections
    const content = sections.map(s => s.content).join('\n\n');

    // Generate summary using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise book summaries. Focus on key plot points, character developments, and major themes. Avoid any spoilers beyond the provided content.'
        },
        {
          role: 'user',
          content: `Please provide a summary of the following book content. Be concise but cover all important events and character developments:\n\n${content.substring(0, 4000)}...`
        }
      ],
      max_tokens: 500
    });

    const summary = response.choices[0].message.content || '';

    // Store the summary in the database
    const newSummary = await prisma.summary.create({
      data: {
        bookId: params.id,
        position,
        content: summary
      }
    });

    return NextResponse.json(newSummary);
  } catch (error) {
    console.error('Error generating summary:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 