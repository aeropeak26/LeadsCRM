'use client';

import React, { useState } from 'react';
import {
  Search,
  User,
  Shield,
  FileSpreadsheet,
  Bell,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { LeadImportModal } from '../leads/LeadImportModal';

export function Header() {
  const { currentUser, switchUser, switchRole, usersList, isAdmin } = useAuth();
  const { filters, setFilters, getDashboardStats } = useCRM();
  
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const stats = getDashboardStats();

  return (
    <header className="sticky top-0 z-20 glass-panel border-b border-gray-800 px-8 py-4 flex items-center justify-between shadow-sm backdrop-blur-md">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads by name, phone, company..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
        />
      </div>

      {/* Action Controls & User/Role Switcher */}
      <div className="flex items-center space-x-4">
        {/* Quick Excel Import Button (Admin & Rep) */}
        {isAdmin && (
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-950/40 transition-all duration-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel</span>
          </button>
        )}

        {/* Database Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800 text-xs text-gray-400">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>DB: Hybrid / Local + MongoDB</span>
        </div>

        {/* Follow-up Reminder Pill */}
        {stats.todayFollowups > 0 && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse">
            <Bell className="w-3.5 h-3.5" />
            <span>{stats.todayFollowups} Follow-ups Today</span>
          </div>
        )}

        {/* Role & User Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800/80 border border-gray-800 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-200">{currentUser.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">
                {currentUser.role === 'admin' ? 'Administrator' : 'Sales Representative'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Role Switcher Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl shadow-2xl border border-gray-700/80 py-3 px-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-gray-800 mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Simulate Role</p>
                <p className="text-[11px] text-gray-500">Switch user context for testing</p>
              </div>

              {/* Quick Role Toggles */}
              <div className="px-2 pb-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    switchRole('admin');
                    setShowRoleDropdown(false);
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    isAdmin
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
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
                  className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    !isAdmin
                      ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sales Rep</span>
                </button>
              </div>

              {/* User Selection Roster */}
              <div className="px-3 pt-2 border-t border-gray-800">
                <p className="text-[11px] font-semibold text-gray-400 mb-1.5">Select User Account:</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {usersList.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        user.id === currentUser.id
                          ? 'bg-blue-600/20 text-blue-300 font-semibold'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{user.name}</span>
                      </div>
                      {user.id === currentUser.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 ml-1 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Import Modal */}
      {isImportModalOpen && (
        <LeadImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      )}
    </header>
  );
}
