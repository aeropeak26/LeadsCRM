'use client';

import React, { useState } from 'react';
import { UserCheck, X, Shuffle, CheckCircle2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

interface LeadAssignmentModalProps {
  selectedLeadIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LeadAssignmentModal({
  selectedLeadIds,
  isOpen,
  onClose,
  onSuccess,
}: LeadAssignmentModalProps) {
  const { users, assignLeads, autoDistributeLeads } = useCRM();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  if (!isOpen) return null;

  const activeSalesReps = users.filter((u) => u.role === 'sales_rep' && u.status === 'active');

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    assignLeads(selectedLeadIds, selectedUserId || null);
    onSuccess();
    onClose();
  };

  const handleAutoDistribute = () => {
    autoDistributeLeads(selectedLeadIds);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Assign Selected Leads</h2>
              <p className="text-xs text-gray-400">
                Bulk action for <span className="text-blue-400 font-semibold">{selectedLeadIds.length}</span> leads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Method 1: Manual Assignment */}
          <form onSubmit={handleManualAssign} className="space-y-4">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Method 1: Manual User Assignment
            </label>

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full glass-input rounded-xl p-3 text-sm bg-gray-900"
              required
            >
              <option value="">Select Sales Representative...</option>
              {activeSalesReps.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
              <option value="">Unassign Leads</option>
            </select>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-950 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Assign to Selected Representative</span>
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-500 uppercase">OR</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          {/* Method 2: Auto Distribution */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Method 2: Equal Auto Distribution
            </label>
            <p className="text-xs text-gray-400">
              Automatically split the {selectedLeadIds.length} selected leads equally among all {activeSalesReps.length} active sales representatives.
            </p>

            <button
              type="button"
              onClick={handleAutoDistribute}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-950 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span>Auto-Distribute Equally</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
