import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login request body:', { email: body.email, hasPassword: !!body.password });
    
    const response = await fetch('https://hgtv5vd4n3.execute-api.us-east-1.amazonaws.com/prod/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Login API response status:', response.status);
    const data = await response.json();
    console.log('Login API response:', data);
    
    // Check if the response was successful
    if (!response.ok) {
      // Pass through the error from the AWS API with detailed logging
      console.log('Login failed with status:', response.status);
      console.log('API error response:', data);
      
      // Create a clear error message
      const errorMessage = data.message || 
        (response.status === 401 ? 'Invalid email or password' : 
         response.status === 404 ? 'User not found' : 
         'Authentication failed');
         
      console.log('Returning error message to client:', errorMessage);
      
      // The format is critical - the frontend is looking for this exact structure
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // For successful responses, ensure we have a properly structured response
    const formattedResponse = {
      token: data.token || '',
      user: {
        id: data.userId || data.user?.id || '',
        name: data.name || data.user?.name || body.email.split('@')[0],
        email: data.email || data.user?.email || body.email,
        role: data.role || data.user?.role || 'user'
      }
    };
    
    // Verify we have a valid token before returning success
    if (!formattedResponse.token) {
      console.log('No token in response despite status code:', response.status);
      return NextResponse.json(
        { error: 'Authentication failed - no token received' },
        { status: 401 }
      );
    }
    
    console.log('Formatted login response:', formattedResponse);
    return NextResponse.json(formattedResponse, {
      status: 200,
    });
  } catch (error) {
    console.error('Proxy login error:', error);
    return NextResponse.json(
      { error: 'Failed to login user' },
      { status: 500 }
    );
  }
}
