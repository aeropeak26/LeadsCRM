'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarClock,
  BarChart3,
  Settings,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, isAdmin } = useAuth();
  const { getDashboardStats } = useCRM();

  const stats = getDashboardStats();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false,
    },
    {
      name: 'Leads Directory',
      href: '/leads',
      icon: Layers,
      badge: stats.totalLeads,
      adminOnly: false,
    },
    {
      name: "Follow-ups",
      href: '/followups',
      icon: CalendarClock,
      badge: stats.todayFollowups > 0 ? stats.todayFollowups : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      adminOnly: false,
    },
    {
      name: 'Sales Team',
      href: '/users',
      icon: UserCheck,
      badge: stats.activeUsers,
      adminOnly: true,
    },
    {
      name: 'Reports & Analytics',
      href: '/reports',
      icon: BarChart3,
      badge: null,
      adminOnly: true,
    },
    {
      name: 'System Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-gray-800 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide leading-tight">LeadSquare</h1>
            <span className="text-xs text-blue-400 font-medium">CRM Enterprise</span>
          </div>
        </div>
      </div>

      {/* Role Badge Banner */}
      <div className="px-4 py-3 mx-4 my-4 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isAdmin ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
            }`}
          />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Active Role</div>
            <div className="text-sm font-semibold text-gray-200">
              {isAdmin ? 'Administrator' : 'Sales Representative'}
            </div>
          </div>
        </div>
        <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-emerald-400' : 'text-cyan-400'}`} />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-white border border-blue-500/30 shadow-md shadow-blue-950/40'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    item.badgeColor || 'bg-gray-800 text-gray-300 border border-gray-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Info */}
      <div className="p-4 border-t border-gray-800/80 bg-gray-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
