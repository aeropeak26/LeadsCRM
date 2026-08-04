'use client';

import React, { useState } from 'react';
import { Plus, Trash2, X, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { User, UserRole } from '@/lib/types';

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser } = useCRM();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales_rep' as UserRole,
  });

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      ...newUserForm,
      status: 'active',
    });
    setNewUserForm({ name: '', email: '', phone: '', password: '', role: 'sales_rep' });
    setIsAddModalOpen(false);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      deleteUser(user.id);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !passwordInput.trim()) return;

    updateUser(selectedUserForPassword.id, { password: passwordInput });
    setPasswordSuccessMsg(`Password updated for ${selectedUserForPassword.name}!`);
    setTimeout(() => setPasswordSuccessMsg(''), 3000);
    setSelectedUserForPassword(null);
    setPasswordInput('');
  };

  const toggleUserPasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header matching Screenshot #3 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Users</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage team members, login passwords, and access.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {passwordSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{passwordSuccessMsg}</span>
        </div>
      )}

      {/* Roster Table matching Screenshot #3 */}
      <div className="light-card rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Password</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-slate-700 bg-white">
              {users.map((u) => {
                const isPassVisible = !!visiblePasswords[u.id];
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {u.role === 'admin' ? 'ADMIN' : 'EMPLOYEE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 font-bold">
                          {isPassVisible ? (u.password || 'N/A') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleUserPasswordVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                          title={isPassVisible ? 'Hide Password' : 'Show Password'}
                        >
                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Set / Reset Password Button */}
                        <button
                          onClick={() => {
                            setSelectedUserForPassword(u);
                            setPasswordInput(u.password || '');
                            setShowPasswordInModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                          title="Set or Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span className="text-[11px] font-medium hidden sm:inline">Password</span>
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name *</label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full light-input rounded-xl p-2.5 text-xs text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Email Address *</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full light-input rounded-xl p-2.5 text-xs text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone Number *</label>
                <input
                  type="text"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full light-input rounded-xl p-2.5 text-xs text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Set User Password *</label>
                <div className="relative">
                  <input
                    type={showAddUserPassword ? 'text' : 'password'}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="Set user password (e.g. Deva@26)"
                    className="w-full light-input rounded-xl p-2.5 pr-10 text-xs text-slate-900 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddUserPassword(!showAddUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showAddUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                  className="w-full light-input rounded-xl p-2.5 text-xs bg-white text-slate-900"
                >
                  <option value="sales_rep">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set / Reset Password Modal */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Set User Password</h3>
              </div>
              <button onClick={() => setSelectedUserForPassword(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-6 space-y-4 text-xs">
              <p className="text-slate-500 font-medium">
                Setting login password for <span className="font-bold text-slate-900">{selectedUserForPassword.name}</span> ({selectedUserForPassword.email}):
              </p>

              <div>
                <label className="font-semibold text-slate-600 mb-1 block">New Password *</label>
                <div className="relative">
                  <input
                    type={showPasswordInModal ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="e.g. Deva@26"
                    className="w-full light-input rounded-xl p-2.5 pr-10 text-xs text-slate-900 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedUserForPassword(null)} className="px-4 py-2 font-semibold text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
