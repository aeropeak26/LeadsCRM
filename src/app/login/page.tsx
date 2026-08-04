'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@leadsquare.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-8">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md shadow-blue-500/30">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">LeadSquare</h1>
          <p className="text-sm text-slate-500 font-medium">Log in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@leadsquare.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm light-input rounded-xl focus:ring-2 focus:ring-blue-600 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm light-input rounded-xl focus:ring-2 focus:ring-blue-600 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline font-semibold">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Preset Quick Login Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider text-center">
            Or Sign In with Demo Account
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => login('admin@leadsquare.com', 'admin')}
              className="flex items-center justify-center space-x-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Admin Demo</span>
            </button>

            <button
              onClick={() => login('alex.j@leadsquare.com', 'sales_rep')}
              className="flex items-center justify-center space-x-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Sales Rep Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
