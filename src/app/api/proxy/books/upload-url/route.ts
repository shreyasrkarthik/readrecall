import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';

// Proxy endpoint to get a presigned URL for uploading books
export async function POST(request: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession();
    console.log('Session in upload-url endpoint:', session);
    
    // Bypass authentication for now to debug the flow
    // Instead of rejecting, we'll log and continue
    if (!session?.user) {
      console.warn('No user session found, but continuing for debugging');
      // We'll continue the request instead of returning 401
    }

    // Get request data
    const data = await request.json();
    const { user_id, file_name, content_type } = data;
    
    console.log('Proxy: Received upload request:', { user_id, file_name, content_type });

    // Endpoint for getting presigned URL from AWS
    const apiUrl = 'https://hgtv5vd4n3.execute-api.us-east-1.amazonaws.com/prod/user/books/upload';
    console.log('Proxy: Requesting presigned URL from:', apiUrl);

    // Get the Authorization header from the request
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    // Get auth token from cookie as fallback
    const cookieHeader = request.headers.get('cookie');
    const authTokenCookie = cookieHeader?.match(/auth_token=([^;]+)/)?.[1];
    console.log('Auth token cookie present:', !!authTokenCookie);
    
    // Determine which auth token to use (header takes precedence if valid)
    let jwtToken = ''; // Initialize as empty
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const candidate = authHeader.substring(7).trim();
      if (jwtRegex.test(candidate)) {
        jwtToken = candidate;
        console.log('Proxy: Valid JWT found in Authorization header.');
      } else {
        // Explicitly ensure jwtToken remains empty if candidate is not a valid JWT
        jwtToken = ''; 
        console.warn('Proxy: Authorization header present, but token is not a valid JWT:', authHeader);
      }
    }

    // Cookie fallback (only if jwtToken is still empty and cookie exists)
    if (!jwtToken && authTokenCookie) {
      if (jwtRegex.test(authTokenCookie)) {
        jwtToken = authTokenCookie;
        console.log('Proxy: Valid JWT found in auth_token cookie.');
      } else {
        // Explicitly ensure jwtToken remains empty if cookie token is not a valid JWT
        jwtToken = ''; 
        console.warn('Proxy: auth_token cookie present, but token is not a valid JWT.');
      }
    }

    if (jwtToken) {
      console.log('Proxy: A valid JWT will be considered for forwarding to AWS:', jwtToken);
    } else {
      console.log('Proxy: No valid JWT found in header or cookie to forward.');
    }
    
    // Prepare headers for AWS request
    const awsRequestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (jwtToken) {
      console.warn('Proxy: Valid JWT found, but intentionally not forwarding Authorization header to AWS as API Gateway method is configured with Authorization: NONE.');
    } else {
      console.warn('Proxy: No valid JWT found, and Authorization header will not be sent to AWS (API Gateway method is Authorization: NONE).');
    }
    // Do not add Authorization header to awsRequestHeaders

    // Forward the request to AWS API (POST with JSON body)
    console.log('Proxy: Forwarding POST request to AWS with body:', { user_id, file_name, content_type });
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: awsRequestHeaders,
      body: JSON.stringify({
        user_id,
        file_name,
        content_type: content_type || 'application/octet-stream' // Default content_type if not provided
      })
    });

    // Get the response from AWS
    const awsData = await response.json();

    // If there's an error in the AWS response
    if (!response.ok || awsData.error) {
      console.error('Proxy: Error getting presigned URL:', awsData);
      return NextResponse.json(
        { error: awsData.error || 'Failed to get upload URL' },
        { status: response.status }
      );
    }

    console.log('Proxy: Successfully got presigned URL');
    return NextResponse.json(awsData);
  } catch (error) {
    console.error('Proxy: Exception getting presigned URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
