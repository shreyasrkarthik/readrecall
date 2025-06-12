import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Use the exact redirect URI that is registered in Google Cloud Console
// For NextAuth, this is typically /api/auth/callback/google
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// AWS authentication endpoints - use standard endpoints since there's no Google-specific endpoint
const AWS_AUTH_API = {
  LOGIN: 'https://hgtv5vd4n3.execute-api.us-east-1.amazonaws.com/prod/user/login',
  REGISTER: 'https://hgtv5vd4n3.execute-api.us-east-1.amazonaws.com/prod/user/register',
};

export async function GET(request: NextRequest) {
  try {
    // Extract authorization code from query params
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
    
    // Decode state parameter to get mode (signin or signup)
    let mode = 'signin';
    if (stateParam) {
      try {
        const stateObj = JSON.parse(Buffer.from(stateParam, 'base64').toString());
        mode = stateObj.mode || 'signin';
      } catch (e) {
        console.error('Error parsing state parameter:', e);
      }
    }
    
    // Exchange code for tokens with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }
    
    // Get user info from Google with the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    const googleUser = await userInfoResponse.json();
    
    if (!userInfoResponse.ok) {
      console.error('Failed to get user info:', googleUser);
      return NextResponse.redirect(new URL('/login?error=user_info_failed', request.url));
    }
    
    // Always try to register first, then login if that fails
    // This ensures we create an account if needed
    
    // Generate a deterministic password based on user's Google ID and our app secret
    // This allows the same user to log in consistently with Google
    const googleUserId = googleUser.id || googleUser.sub;
    const generatedPassword = `google-${googleUserId}-${NEXTAUTH_SECRET?.substring(0, 10) || 'readrecall'}`;
    
    // Create user data for registration
    const userData = {
      name: googleUser.name,
      email: googleUser.email,
      password: generatedPassword
    };
    
    console.log(`Processing Google auth for: ${googleUser.email}`);
    
    // Try to register the user first (will fail if user exists)
    try {
      const registerResponse = await fetch(AWS_AUTH_API.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const registerData = await registerResponse.json();
      
      if (registerResponse.ok) {
        console.log('Successfully registered Google user');
      } else {
        console.log('Registration result:', registerData);
        // Registration failed, but might be because user already exists
      }
    } catch (regError) {
      console.error('Registration attempt error:', regError);
      // Continue to login anyway
    }
    
    // Now try to log in regardless of registration result
    console.log('Attempting login for Google user');
    const loginResponse = await fetch(AWS_AUTH_API.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: googleUser.email,
        password: generatedPassword
      }),
    });
    
    const authData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('AWS authentication failed:', authData);
      // Redirect to auth page with error message
      return NextResponse.redirect(new URL(`/auth?error=google_auth_failed&message=${encodeURIComponent(authData.message || 'Authentication failed')}`, request.url));
    }
    
    // Store token in localStorage on client side via a redirect with hash fragment
    // This matches how the regular login works
    
    // Create URL with token in hash (not sent to server)
    const successUrl = new URL('/auth-success', request.url);
    successUrl.hash = `token=${authData.token}&redirect=/profile`;
    
    console.log('Authentication successful, redirecting to:', successUrl.pathname);
    const response = NextResponse.redirect(successUrl);
    
    return response;
  } catch (error) {
    console.error('Google auth callback error:', error);
    return NextResponse.redirect(new URL('/auth?error=auth_error', request.url));
  }
}
