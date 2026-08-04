'use client';

import React, { useState } from 'react';
import { Settings, Database, CheckCircle2, Save, Shield, Server, FileSpreadsheet } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function SettingsView() {
  const { settings, updateSettings } = useCRM();

  const [form, setForm] = useState({
    companyName: settings.companyName,
    supportEmail: settings.supportEmail,
    currency: settings.currency,
    autoDistributionEnabled: settings.autoDistributionEnabled,
    duplicateCheckPhone: settings.duplicateCheckPhone,
    defaultFollowupDays: settings.defaultFollowupDays,
  });

  const [mongoUri, setMongoUri] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-3 glass-panel p-6 rounded-3xl border border-gray-800">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">System Settings & Connections</h1>
          <p className="text-xs text-gray-400">Configure company profile, lead import policies, and database connection</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      {/* MongoDB Atlas Online Database Connection Section */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">MongoDB Online (MongoDB Atlas) Integration</h2>
              <p className="text-xs text-gray-400">Connect LeadSquare CRM directly to your MongoDB Atlas cloud database cluster</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center space-x-1.5">
            <Server className="w-3.5 h-3.5" />
            <span>Mongoose Ready</span>
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-300 leading-relaxed">
            LeadSquare CRM includes full online MongoDB Atlas Mongoose models (<code className="text-blue-400">User</code>, <code className="text-blue-400">Lead</code>, <code className="text-blue-400">Followup</code>, <code className="text-blue-400">LeadNote</code>, <code className="text-blue-400">ExcelUpload</code>). To connect to MongoDB Atlas, add your connection string in your <code className="text-amber-400">.env.local</code> file:
          </p>

          <div className="glass-card p-4 rounded-2xl border border-gray-800 font-mono text-xs text-emerald-400 overflow-x-auto">
            MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/leadsquare_crm?retryWrites=true&amp;w=majority
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400 pt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Smart Fallback Active: System automatically runs seamlessly in offline/local reactive mode when MONGODB_URI is not set.</span>
          </div>
        </div>
      </div>

      {/* Business Configuration Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-4">Business & Lead Import Rules</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1 block">Company Name</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full glass-input rounded-xl p-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1 block">Support Email</label>
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full glass-input rounded-xl p-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1 block">Currency Symbol</label>
            <input
              type="text"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full glass-input rounded-xl p-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1 block">Default Follow-up Reminder (Days)</label>
            <input
              type="number"
              value={form.defaultFollowupDays}
              onChange={(e) => setForm({ ...form, defaultFollowupDays: parseInt(e.target.value) || 3 })}
              className="w-full glass-input rounded-xl p-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Enable Auto Distribution Engine</p>
              <p className="text-xs text-gray-400">Automatically split imported leads equally across active sales representatives</p>
            </div>
            <input
              type="checkbox"
              checked={form.autoDistributionEnabled}
              onChange={(e) => setForm({ ...form, autoDistributionEnabled: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Duplicate Mobile Number Detection</p>
              <p className="text-xs text-gray-400">Flag duplicate mobile numbers automatically during Excel imports</p>
            </div>
            <input
              type="checkbox"
              checked={form.duplicateCheckPhone}
              onChange={(e) => setForm({ ...form, duplicateCheckPhone: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-950"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
