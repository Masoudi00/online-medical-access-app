"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated as checkAuth } from '@/app/utils/auth';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture: string | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      console.log('Profile data:', data);
      
      // Ensure role is set correctly
      const userRole = data.role || 'user';
      console.log('User role:', userRole);
      console.log('User ID:', data.id); // Debug log
      
      const userData = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        role: userRole,
        profile_picture: data.profile_picture
      };
      
      console.log('Setting user data:', userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'not found');
    
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile(token).catch(error => {
        console.error('Failed to fetch user profile:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 