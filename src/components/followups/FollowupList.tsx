'use client';

import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { LeadDetailModal } from '../leads/LeadDetailModal';
import { Lead } from '@/lib/types';

export function FollowupList() {
  const { currentUser, isAdmin } = useAuth();
  const { followups, leads, updateFollowupStatus } = useCRM();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Scoped to current rep if not admin
  const visibleFollowups = followups.filter((f) => {
    if (!isAdmin && f.assignedUserId !== currentUser.id) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Follow-up Management Scheduler</h1>
            <p className="text-xs text-gray-400">Track today's calls, upcoming meetings, and overdue reminders</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-2 bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800">
          {(['today', 'upcoming', 'overdue', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFollowups.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-panel rounded-3xl border border-gray-800 text-gray-500">
            No follow-ups found in <span className="font-semibold uppercase text-gray-300">{activeTab}</span> status.
          </div>
        ) : (
          filteredFollowups.map((item) => {
            const targetLead = leads.find((l) => l.id === item.leadId);
            return (
              <div
                key={item.id}
                className="glass-card p-6 rounded-3xl border border-gray-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-400 font-semibold">{item.assignedUserName}</span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                        item.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : activeTab === 'overdue'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{item.leadName}</h3>
                  <p className="text-xs text-gray-400 font-medium">Company: {item.leadCompany}</p>
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    {item.notes}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(item.scheduledAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${item.leadPhone}`}
                      className="p-2 bg-emerald-600/20 text-emerald-300 rounded-xl hover:bg-emerald-600/30"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/${item.leadPhone.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-green-600/20 text-green-300 rounded-xl hover:bg-green-600/30"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    {item.status !== 'completed' && (
                      <button
                        onClick={() => updateFollowupStatus(item.id, 'completed')}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-300 text-xs font-semibold rounded-xl hover:bg-blue-600/30"
                      >
                        Done
                      </button>
                    )}
                    {targetLead && (
                      <button
                        onClick={() => setSelectedLead(targetLead)}
                        className="p-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700"
                      >
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

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
