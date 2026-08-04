'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/storage/mockData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
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

  // Sync usersList from localStorage CRM state if available
  useEffect(() => {
    const saved = localStorage.getItem('leadsquare_crm_state_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.users && Array.isArray(parsed.users)) {
          setUsersList(parsed.users);
        }
      } catch (e) {
        console.error('Failed to load users for auth', e);
      }
    }
  }, []);

  // Restore authenticated session from localStorage
  useEffect(() => {
    const isAuth = localStorage.getItem('leadsquare_is_authenticated') === 'true';
    const savedUserId = localStorage.getItem('leadsquare_auth_user');

    if (isAuth && savedUserId) {
      const found = usersList.find((u) => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
      } else {
        // Default fallback to Admin
        setCurrentUser(usersList[0] || INITIAL_USERS[0]);
        setIsAuthenticated(true);
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

  const login = (email: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim();

    // Read current users from localStorage
    let currentRoster = usersList;
    const savedCRMState = localStorage.getItem('leadsquare_crm_state_v1');
    if (savedCRMState) {
      try {
        const parsed = JSON.parse(savedCRMState);
        if (parsed.users && Array.isArray(parsed.users)) {
          currentRoster = parsed.users;
        }
      } catch (e) {}
    }

    const found = currentRoster.find((u) => u.email.toLowerCase().trim() === normalizedEmail);

    if (found) {
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
