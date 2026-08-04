'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/storage/mockData';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  usersList: User[];
  isAdmin: boolean;
  isSalesRepresentative: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [usersList] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default Admin session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Load saved session
  useEffect(() => {
    const savedUserId = localStorage.getItem('leadsquare_auth_user');
    const savedAuth = localStorage.getItem('leadsquare_is_authenticated');

    if (savedAuth === 'false') {
      setIsAuthenticated(false);
      setCurrentUser(null);
    } else if (savedUserId) {
      const found = usersList.find((u) => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
      }
    }
  }, [usersList]);

  // Protect private routes
  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  const login = (email: string, preferredRole?: UserRole) => {
    const found = usersList.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        (preferredRole && u.role === preferredRole)
    );

    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('leadsquare_auth_user', found.id);
      localStorage.setItem('leadsquare_is_authenticated', 'true');
      router.push('/');
      return true;
    }

    // Default fallback to Admin
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
    localStorage.setItem('leadsquare_auth_user', INITIAL_USERS[0].id);
    localStorage.setItem('leadsquare_is_authenticated', 'true');
    router.push('/');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.setItem('leadsquare_is_authenticated', 'false');
    localStorage.removeItem('leadsquare_auth_user');
    router.push('/login');
  };

  const switchUser = (userId: string) => {
    const found = usersList.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('leadsquare_auth_user', found.id);
    }
  };

  const switchRole = (role: UserRole) => {
    const found = usersList.find((u) => u.role === role && u.status === 'active');
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('leadsquare_auth_user', found.id);
    }
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
        switchUser,
        switchRole,
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
