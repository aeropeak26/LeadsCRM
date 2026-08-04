import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CRMProvider } from '@/context/CRMContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'LeadSquare CRM - Lead Management System',
  description: 'Enterprise Bulk Lead Import, Assignment, Lifecycle Tracking, and Analytics System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <AuthProvider>
          <CRMProvider>
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </CRMProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
