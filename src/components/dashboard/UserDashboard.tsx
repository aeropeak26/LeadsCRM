'use client';

import React, { useState } from 'react';
import {
  Database,
  CalendarClock,
  CheckCircle2,
  Phone,
  MessageSquare,
  ThumbsUp,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { LeadDetailModal } from '../leads/LeadDetailModal';
import { Lead } from '@/lib/types';

export function UserDashboard() {
  const { currentUser } = useAuth();
  const { leads, followups, updateFollowupStatus } = useCRM();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const myLeads = leads.filter((l) => l.assignedUserId === currentUser?.id);
  const interestedLeads = myLeads.filter((l) => l.status === 'interested');
  const convertedLeads = myLeads.filter((l) => l.status === 'converted');

  const todayStr = new Date().toISOString().split('T')[0];
  const myFollowups = followups.filter(
    (f) => f.assignedUserId === currentUser?.id || myLeads.some((l) => l.id === f.leadId)
  );

  const todayFollowups = myFollowups.filter((f) => {
    const fDate = new Date(f.scheduledAt).toISOString().split('T')[0];
    return fDate === todayStr && f.status !== 'completed';
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome back, {currentUser?.name || 'Sales Representative'}
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Overview of your assigned pipeline and follow-ups.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="light-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Assigned Leads</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{myLeads.length}</p>
        </div>

        <div className="light-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Today's Follow-ups</span>
            <CalendarClock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-2">{todayFollowups.length}</p>
        </div>

        <div className="light-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Interested Leads</span>
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{interestedLeads.length}</p>
        </div>

        <div className="light-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Converted Deals</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600 mt-2">{convertedLeads.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 light-card p-6 rounded-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900">Today's Priority Follow-ups</h2>

          {todayFollowups.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All follow-ups completed for today!
            </div>
          ) : (
            <div className="space-y-3">
              {todayFollowups.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.leadName}</h3>
                    <p className="text-xs text-amber-600 font-medium mt-0.5">{item.notes}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a href={`tel:${item.leadPhone}`} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a href={`https://wa.me/${item.leadPhone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => updateFollowupStatus(item.id, 'completed')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="light-card p-6 rounded-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900">Your Assigned Roster</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {myLeads.slice(0, 7).map((l) => (
              <div key={l.id} onClick={() => setSelectedLead(l)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{l.name}</p>
                  <p className="text-[11px] text-slate-500">{l.company || l.phone}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedLead && (
        <LeadDetailModal lead={selectedLead} isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}
