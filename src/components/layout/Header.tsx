'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, LogOut, Mail, Phone, Shield, User, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const { currentUser, logout, isAdmin } = useAuth();
  const { filters, setFilters, getDashboardStats } = useCRM();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  if (pathname === '/login') return null;

  const stats = getDashboardStats();

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs gap-4">
      <div className="flex items-center space-x-3 flex-1">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 focus:outline-none rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="relative w-full max-w-xs lg:max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, company, or email..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Action Controls & User Account Menu */}
      <div className="flex items-center space-x-4">
        {/* Follow-up Reminder Counter */}
        {stats.todayFollowups > 0 && (
          <div className="flex items-center space-x-2 px-2 md:px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{stats.todayFollowups} Follow-ups Today</span>
            <span className="sm:hidden">{stats.todayFollowups}</span>
          </div>
        )}

        {/* Real User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-left transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">{currentUser?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
                {currentUser?.role === 'admin' ? 'Admin' : 'Sales Representative'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
              {/* Profile Card Header */}
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.name}</p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                      isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isAdmin ? 'ADMIN ACCOUNT' : 'SALES REP'}
                  </span>
                </div>
              </div>

              {/* User Account Info */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate font-medium">{currentUser?.email}</span>
                </div>
                {currentUser?.phone && (
                  <div className="flex items-center space-x-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate font-medium">{currentUser?.phone}</span>
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
