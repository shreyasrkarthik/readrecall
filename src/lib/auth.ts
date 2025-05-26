// Proxy API routes to avoid CORS issues
export const AUTH_API = {
  LOGIN: '/api/proxy/user/login',
  REGISTER: '/api/proxy/user/register',
  PROFILE: '/api/proxy/user/me',
  GOOGLE_AUTH: '/api/proxy/auth/google',
  GOOGLE_CALLBACK: '/api/proxy/auth/google/callback',
};

// Types for authentication
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Helper functions for AWS authentication
export async function login(email: string, password: string) {
  try {
    console.log('auth.ts: Starting login request for', email);
    const response = await fetch(AUTH_API.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('auth.ts: Login response received:', { status: response.status, hasError: !!data.error });
    
    // Check if the response contains an error message
    if (!response.ok || data.error) {
      const errorMessage = data.error || 'Login failed';
      console.error('auth.ts: Login error:', errorMessage);
      
      // Create a real Error object with the message from the API
      const error = new Error(errorMessage);
      // Add the API response status to the error for better debugging
      (error as any).status = response.status;
      (error as any).apiError = true;
      
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('auth.ts: Login function error:', error);
    throw error;
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    const response = await fetch(AUTH_API.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    
    // Check if the response contains an error message
    if (!response.ok || data.error) {
      console.error('Registration error:', data.error || 'Unknown registration error');
      throw new Error(data.error || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Register function error:', error);
    throw error;
  }
}

export async function getProfile(token: string) {
  const response = await fetch(AUTH_API.PROFILE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

/**
 * Initiates Google OAuth flow for authentication
 * @param mode 'signin' or 'signup'
 * @returns URL to redirect to for Google authentication
 */
export async function initiateGoogleAuth(mode: 'signin' | 'signup') {
  try {
    const response = await fetch(`${AUTH_API.GOOGLE_AUTH}?mode=${mode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.url) {
      throw new Error('Failed to initiate Google authentication');
    }
    
    return data.url;
  } catch (error) {
    console.error('Google auth initiation error:', error);
    throw error;
  }
}