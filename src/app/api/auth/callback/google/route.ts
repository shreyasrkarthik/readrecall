import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// This route handles the Google OAuth callback
// It simply redirects to our actual handler in the proxy API
export async function GET(request: NextRequest) {
  try {
    // Get the query parameters from the request
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // If there's an error, redirect to login with the error
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }
    
    // If no code, redirect to login
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }
    
    // Redirect to our proxy handler with all the query parameters
    const redirectUrl = new URL('/api/proxy/auth/google/callback', request.url);
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.append(key, value);
    });
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in Google callback redirect:', error);
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
  }
}
