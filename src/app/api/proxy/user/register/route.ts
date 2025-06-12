import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Register request body:', { email: body.email, name: body.name, hasPassword: !!body.password });
    
    const response = await fetch('https://hgtv5vd4n3.execute-api.us-east-1.amazonaws.com/prod/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Register API response status:', response.status);
    const data = await response.json();
    console.log('Register API response:', data);
    
    // Check if the response was successful
    if (!response.ok) {
      // Pass through the error from the AWS API
      console.log('Registration failed with status:', response.status);
      return NextResponse.json(
        { error: data.message || 'Registration failed. This email might already be in use.' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error('Proxy register error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
