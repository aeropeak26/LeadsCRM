'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Shield, Bell, User, ChevronDown, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';

export function Header() {
  const pathname = usePathname();
  const { currentUser, switchUser, switchRole, usersList, isAdmin } = useAuth();
  const { filters, setFilters, getDashboardStats } = useCRM();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  if (pathname === '/login') return null;

  const stats = getDashboardStats();

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search name, company, or email..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Action Controls & Role Switcher */}
      <div className="flex items-center space-x-4">
        {/* Follow-up Reminder Counter */}
        {stats.todayFollowups > 0 && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>{stats.todayFollowups} Follow-ups Today</span>
          </div>
        )}

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-left transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">
                {currentUser?.role === 'admin' ? 'Admin' : 'Sales Representative'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulate Role</p>
                <p className="text-[11px] text-slate-500">Switch user role context</p>
              </div>

              <div className="px-2 pb-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    switchRole('admin');
                    setShowRoleDropdown(false);
                  }}
                  className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    isAdmin
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={() => {
                    switchRole('sales_rep');
                    setShowRoleDropdown(false);
                  }}
                  className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    !isAdmin
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sales Rep</span>
                </button>
              </div>

              <div className="px-3 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Select User Account:</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {usersList.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        user.id === currentUser?.id
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{user.name}</span>
                      </div>
                      {user.id === currentUser?.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 ml-1 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
