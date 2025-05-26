import { NextResponse } from 'next/server';

// Redirect users to our new auth system
export function GET() {
  return NextResponse.redirect(new URL('/auth', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}

export function POST() {
  return NextResponse.redirect(new URL('/auth', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
} 