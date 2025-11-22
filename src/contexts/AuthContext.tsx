import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockUser } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  updateAvatar: (avatar: string) => void;
  deleteAvatar: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('inventory_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, accept any email/password
    const loggedInUser = { ...mockUser, email };
    setUser(loggedInUser);
    setIsAuthenticated(true);
    localStorage.setItem('inventory_user', JSON.stringify(loggedInUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('inventory_user', JSON.stringify(newUser));
  };

  const updateProfile = async (name: string, email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (user) {
      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
      localStorage.setItem('inventory_user', JSON.stringify(updatedUser));
    }
  };

  const updateAvatar = (avatar: string) => {
    if (user) {
      const updatedUser = { ...user, avatar };
      setUser(updatedUser);
      localStorage.setItem('inventory_user', JSON.stringify(updatedUser));
    }
  };

  const deleteAvatar = () => {
    if (user) {
      const updatedUser = { ...user };
      delete updatedUser.avatar;
      setUser(updatedUser);
      localStorage.setItem('inventory_user', JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, verify currentPassword and update in backend
    // For demo, we'll just simulate success
  };

  const deleteAccount = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clear all data
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('inventory_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      updateProfile, 
      updateAvatar, 
      deleteAvatar,
      changePassword, 
      deleteAccount, 
      isAuthenticated 
    }}>
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
