'use client';

import React, { useState } from 'react';
import { Settings, Database, CheckCircle2, Save, Server } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function SettingsView() {
  const { settings, updateSettings } = useCRM();

  const [form, setForm] = useState({
    companyName: settings.companyName,
    supportEmail: 'info@aeropeak.tech',
    currency: settings.currency,
    autoDistributionEnabled: settings.autoDistributionEnabled,
    duplicateCheckPhone: settings.duplicateCheckPhone,
    defaultFollowupDays: settings.defaultFollowupDays,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Configure company profile, lead import policies, and database connection.</p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      {/* MongoDB Status Box */}
      <div className="light-card p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">MongoDB Online (MongoDB Atlas) Status</h2>
              <p className="text-xs text-slate-500">Mongoose Connection Configured in .env.local</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
            <Server className="w-3.5 h-3.5" />
            <span>Mongoose Connected</span>
          </span>
        </div>

        <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 truncate">
          MONGODB_URI=mongodb+srv://jayaprakashr024:Jayaprakash%409084@cluster0.0csgafe.mongodb.net/leadsquare_crm
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="light-card p-6 rounded-xl space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Business Settings</h2>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-600 mb-1 block">Company Name</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full light-input rounded-xl p-2.5"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 mb-1 block">Support Email</label>
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full light-input rounded-xl p-2.5"
              required
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button type="submit" className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
