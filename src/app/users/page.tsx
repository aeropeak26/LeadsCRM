'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserManagement } from '@/components/users/UserManagement';

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return <UserManagement />;
}
