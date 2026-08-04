'use client';

import React, { useState } from 'react';
import { UserCheck, UserPlus, Shield, KeyRound, UserX, X, Mail, Phone, Layers } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { User, UserRole } from '@/lib/types';

export function UserManagement() {
  const { users, leads, addUser, updateUser } = useCRM();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales_rep' as UserRole,
  });

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      ...newUserForm,
      status: 'active',
    });
    setNewUserForm({ name: '', email: '', phone: '', role: 'sales_rep' });
    setIsAddModalOpen(false);
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    updateUser(user.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sales Team & User Management</h1>
            <p className="text-xs text-gray-400">Configure team roles, active status, and lead assignments</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-950 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Sales User</span>
        </button>
      </div>

      {/* Roster Table */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/80 text-gray-400 font-semibold border-b border-gray-800 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Leads</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {users.map((u) => {
                const assignedCount = leads.filter((l) => l.assignedUserId === u.id).length;
                return (
                  <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-xs text-gray-500">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-1.5 text-gray-300">
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                          <span>{u.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-400">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          <span>{u.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-200">
                      <div className="flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>{assignedCount} leads</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-full border uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          u.status === 'active'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.status === 'active' ? 'Disable User' : 'Enable User'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="font-bold text-white text-base">Add New User Account</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Full Name *</label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full glass-input rounded-xl p-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Email Address *</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full glass-input rounded-xl p-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Phone Number *</label>
                <input
                  type="text"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full glass-input rounded-xl p-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                  className="w-full glass-input rounded-xl p-2.5 text-sm bg-gray-900"
                >
                  <option value="sales_rep">Sales Representative</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
