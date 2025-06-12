import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Use the exact redirect URI that is registered in Google Cloud Console
// For NextAuth, this is typically /api/auth/callback/google
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`;

// Route handler for initiating Google OAuth flow
export async function GET(request: NextRequest) {
  try {
    // Extract mode (signin or signup) from query params
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'signin';
    
    // Construct Google OAuth URL
    // Google OAuth2 authorization endpoint
    const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    
    // State parameter to pass through the flow (includes mode)
    const state = Buffer.from(JSON.stringify({ mode })).toString('base64');
    
    // OAuth parameters
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || '',
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    
    // Construct the full authorization URL
    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
    
    // Return the URL that the client will redirect to
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Google auth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    );
  }
}

// Callback handler (this would be implemented in a separate route)
// /api/proxy/auth/google/callback
