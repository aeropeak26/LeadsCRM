'use client';

import React from 'react';
import { LeadTable } from '@/components/leads/LeadTable';

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads Directory</h1>
          <p className="text-xs text-gray-400">View, search, filter, assign, and update lead lifecycles</p>
        </div>
      </div>

      <LeadTable />
    </div>
  );
}
