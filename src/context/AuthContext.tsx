'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/storage/mockData';

interface AuthContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  usersList: User[];
  isAdmin: boolean;
  isSalesRepresentative: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usersList] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default Admin

  // Load saved user session if available
  useEffect(() => {
    const savedUserId = localStorage.getItem('leadsquare_auth_user');
    if (savedUserId) {
      const found = usersList.find((u) => u.id === savedUserId);
      if (found) setCurrentUser(found);
    }
  }, [usersList]);

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

  const isAdmin = currentUser.role === 'admin';
  const isSalesRepresentative = currentUser.role === 'sales_rep';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
