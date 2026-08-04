'use client';

import React, { useState } from 'react';
import { CalendarClock, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { LeadDetailModal } from '../leads/LeadDetailModal';
import { Lead } from '@/lib/types';

export function FollowupList() {
  const { currentUser, isAdmin } = useAuth();
  const { followups, leads, updateFollowupStatus } = useCRM();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const visibleFollowups = followups.filter((f) => {
    if (!isAdmin && f.assignedUserId !== currentUser?.id) {
      return false;
    }
    return true;
  });

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredFollowups = visibleFollowups.filter((item) => {
    const fDate = new Date(item.scheduledAt).toISOString().split('T')[0];
    const fTime = new Date(item.scheduledAt).getTime();

    if (activeTab === 'today') {
      return fDate === todayStr && item.status !== 'completed';
    }
    if (activeTab === 'upcoming') {
      return fTime > now.getTime() && fDate !== todayStr && item.status !== 'completed';
    }
    if (activeTab === 'overdue') {
      return fTime < now.getTime() && item.status === 'pending';
    }
    if (activeTab === 'completed') {
      return item.status === 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Follow-ups</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Track today's calls, upcoming meetings, and overdue reminders.</p>
        </div>

        <div className="flex space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {(['today', 'upcoming', 'overdue', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFollowups.length === 0 ? (
          <div className="col-span-full text-center py-16 light-card rounded-xl text-slate-400 text-xs">
            No follow-ups found in <span className="font-bold uppercase text-slate-700">{activeTab}</span>.
          </div>
        ) : (
          filteredFollowups.map((item) => {
            const targetLead = leads.find((l) => l.id === item.leadId);
            return (
              <div key={item.id} className="light-card p-5 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600 font-semibold">{item.assignedUserName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.leadName}</h3>
                  <p className="text-xs text-slate-500 font-medium">Company: {item.leadCompany}</p>
                  <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                    {item.notes}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(item.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center space-x-2">
                    <a href={`tel:${item.leadPhone}`} className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a href={`https://wa.me/${item.leadPhone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    {item.status !== 'completed' && (
                      <button onClick={() => updateFollowupStatus(item.id, 'completed')} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg">
                        Done
                      </button>
                    )}
                    {targetLead && (
                      <button onClick={() => setSelectedLead(targetLead)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedLead && <LeadDetailModal lead={selectedLead} isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
