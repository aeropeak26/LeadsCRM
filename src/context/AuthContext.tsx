'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/storage/mockData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  usersList: User[];
  isAdmin: boolean;
  isSalesRepresentative: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const router = useRouter();
  const pathname = usePathname();

  // Load users from DB on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUsersList(data);
          }
        }
      } catch (e) {
        console.error('Failed to load users for auth', e);
      }
    };
    loadUsers();
  }, []);

  // Restore authenticated session from localStorage ID matching with usersList
  useEffect(() => {
    const isAuth = localStorage.getItem('leadsquare_is_authenticated') === 'true';
    const savedUserId = localStorage.getItem('leadsquare_auth_user');

    if (isAuth && savedUserId) {
      const found = usersList.find((u) => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
      } else {
        // If they have an ID but it's not in the list, just set auth false for now
        // This is safe since usersList might be empty initially before fetch
        if (usersList.length > 0) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, [usersList]);

  // Protect private routes
  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();

    // Re-fetch to ensure we have latest users (if a new one was created in another tab)
    let currentRoster = usersList;
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) currentRoster = data;
      }
    } catch(e) {}

    const found = currentRoster.find((u) => u.email.toLowerCase().trim() === normalizedEmail);

    if (found) {
      if (password) {
        if (!found.password) {
          // Fallback for mock/legacy users without passwords set
          if (found.email === 'info@aeropeak.tech' && password !== 'AeroPeak@26') return false;
          if (found.email === 'tharshinisaravanan06@gmail.com' && password !== 'Deva@26') return false;
          if (found.email === 'nivethav012@gmail.com' && password !== 'Nive@26') return false;
        } else {
          // Check actual password if set in DB
          if (found.password !== password) {
            return false;
          }
        }
      }

      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('leadsquare_auth_user', found.id);
      localStorage.setItem('leadsquare_is_authenticated', 'true');
      router.push('/');
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.setItem('leadsquare_is_authenticated', 'false');
    localStorage.removeItem('leadsquare_auth_user');
    router.push('/login');
  };

  const isAdmin = currentUser?.role === 'admin';
  const isSalesRepresentative = currentUser?.role === 'sales_rep';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        usersList,
        isAdmin,
        isSalesRepresentative,
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
