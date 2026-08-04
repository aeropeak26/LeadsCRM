'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  Users,
  Upload,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, isAdmin, logout } = useAuth();

  if (pathname === '/login') return null;

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: false },
    { name: 'Leads', href: '/leads', icon: Database, adminOnly: false },
    { name: 'Users', href: '/users', icon: Users, adminOnly: false },
    { name: 'Import', href: '/import', icon: Upload, adminOnly: false },
    { name: 'Follow-ups', href: '/followups', icon: CalendarClock, adminOnly: false },
    { name: 'Reports', href: '/reports', icon: BarChart3, adminOnly: true },
    { name: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
  ];

  return (
    <aside className="w-60 navy-sidebar flex flex-col h-screen sticky top-0 z-30 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <h1 className="text-xl font-black text-blue-500 tracking-tight">LeadSquare</h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logged In User Status */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Logged in as</p>
          <p className="text-xs font-bold text-white truncate">
            {currentUser?.name || 'Admin'} ({isAdmin ? 'Admin' : 'Sales Rep'})
          </p>
        </div>

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
