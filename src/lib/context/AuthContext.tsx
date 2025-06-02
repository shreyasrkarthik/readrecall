'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, login as apiLogin, register as apiRegister, getProfile as apiGetProfile } from '../auth';

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getProfile: () => Promise<void>;
  setToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Set a timeout for the profile fetch
        const profilePromise = apiGetProfile(storedToken);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timed out')), 3000)
        );
        
        // Race the profile fetch against a timeout
        const userData = await Promise.race([profilePromise, timeoutPromise]);
        
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Attempting login for email:', email);
      
      // Attempt to login via the API
      const data = await apiLogin(email, password);
      console.log('AuthContext: Login response:', data);
      
      // Check if we have a valid token
      if (!data || !data.token) {
        console.error('AuthContext: No token in login response');
        return false;
      }

      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);

      // Update auth state
      setToken(data.token);
      setIsAuthenticated(true);

      // If login response includes user data, set it directly
      if (data.user) {
        console.log('AuthContext: Setting user data from login response:', data.user);
        setUser(data.user);
      } else {
        // Otherwise, fetch the user profile
        console.log('AuthContext: No user data in login response, fetching profile...');
        await getProfile();
      }

      return true;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      // Show more detailed error message in console for debugging
      if (error instanceof Error) {
        console.error('AuthContext: Error message:', error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiRegister(name, email, password);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async (): Promise<void> => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userData = await apiGetProfile(token);
      if (!userData || !userData.id) {
        throw new Error('Invalid user data received');
      }
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Clear auth state on error
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('auth_token');
    
    // Reset auth state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        getProfile,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
