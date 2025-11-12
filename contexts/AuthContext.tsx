import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'vetsync_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (role: Role) => {
    // In a real app, this would involve a call to a backend API
    const mockUsers: Record<Role, User> = {
        'Pet Parent': { name: 'Alex', role: 'Pet Parent' },
        'Veterinarian': { id: 'v1', name: 'Dr. Emily Carter', role: 'Veterinarian' },
        'Clinic Admin': { name: 'Clinic Manager', role: 'Clinic Admin' },
        'Admin': { name: 'Admin User', role: 'Admin' }
    };
    const newUser = mockUsers[role];
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const value = { user, login, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};