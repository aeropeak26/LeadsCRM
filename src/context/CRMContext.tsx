'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lead,
  LeadNote,
  Followup,
  User,
  ExcelUpload,
  SystemSettings,
  LeadStatus,
  ParsedLeadRecord,
  FilterOptions,
} from '@/lib/types';
import { useAuth } from './AuthContext';
import { DEFAULT_SETTINGS } from '@/lib/storage/mockData';

interface CRMContextType {
  leads: Lead[];
  users: User[];
  notes: LeadNote[];
  followups: Followup[];
  uploads: ExcelUpload[];
  settings: SystemSettings;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  
  // Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  assignLeads: (leadIds: string[], userId: string | null) => Promise<void>;
  autoDistributeLeads: (leadIds: string[]) => Promise<void>;
  
  addNote: (leadId: string, noteText: string, newStatus?: LeadStatus) => Promise<void>;
  scheduleFollowup: (leadId: string, dateStr: string, noteText: string) => Promise<void>;
  updateFollowupStatus: (followupId: string, status: 'completed' | 'pending' | 'overdue') => Promise<void>;
  
  importExcelRecords: (records: ParsedLeadRecord[], filename: string) => Promise<void>;
  
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  
  // Statistics Helper
  getDashboardStats: () => {
    totalLeads: number;
    assignedLeads: number;
    unassignedLeads: number;
    todayFollowups: number;
    overdueFollowups: number;
    interestedLeads: number;
    convertedLeads: number;
    rejectedLeads: number;
    totalUsers: number;
    activeUsers: number;
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [uploads, setUploads] = useState<ExcelUpload[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    assignedUserId: 'all',
    city: 'all',
    state: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Load state from Database
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const data = await res.json();
          if (data.leads) setLeads(data.leads);
          if (data.users) setUsers(data.users);
          if (data.notes) setNotes(data.notes);
          if (data.followups) setFollowups(data.followups);
          if (data.settings) setSettings(data.settings);
        }
      } catch (e) {
        console.error('Failed to sync CRM state from DB', e);
      }
    };
    loadData();
    
    // Optional: Auto-refresh data every 30 seconds to keep clients in sync
    const intervalId = setInterval(loadData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const assignedUser = users.find((u) => u.id === leadData.assignedUserId);
    const newLead = {
      ...leadData,
      assignedUserName: assignedUser ? assignedUser.name : undefined,
    };
    
    // Optimistic Update
    const tempId = `temp-l-${Date.now()}`;
    const optimisticLead: Lead = {
      ...newLead,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Lead;
    setLeads([optimisticLead, ...leads]);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      const savedLead = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === tempId ? savedLead : l)));
    } catch (e) {
      console.error(e);
      setLeads((prev) => prev.filter((l) => l.id !== tempId));
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    let assignedUserName = updates.assignedUserName;
    if (updates.assignedUserId !== undefined) {
      const userObj = users.find((u) => u.id === updates.assignedUserId);
      assignedUserName = userObj ? userObj.name : undefined;
    }
    
    const finalUpdates = {
      ...updates,
      ...(assignedUserName !== undefined && { assignedUserName }),
      updatedAt: new Date().toISOString(),
    };

    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...finalUpdates } : l)));

    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUpdates),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setNotes((prev) => prev.filter((n) => n.leadId !== id));
    setFollowups((prev) => prev.filter((f) => f.leadId !== id));

    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const assignLeads = async (leadIds: string[], userId: string | null) => {
    const userObj = users.find((u) => u.id === userId);
    const assignedUserName = userObj ? userObj.name : undefined;
    
    setLeads((prev) =>
      prev.map((l) => {
        if (leadIds.includes(l.id)) {
          return { ...l, assignedUserId: userId, assignedUserName, updatedAt: new Date().toISOString() };
        }
        return l;
      })
    );

    // In a real app we might have a bulk update endpoint, but for now we loop
    for (const id of leadIds) {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedUserId: userId, assignedUserName, updatedAt: new Date().toISOString() }),
      });
    }
  };

  const autoDistributeLeads = async (leadIds: string[]) => {
    const activeReps = users.filter((u) => u.role === 'sales_rep' && u.status === 'active');
    if (activeReps.length === 0) return;

    let repIndex = 0;
    const updatesMap = new Map<string, any>();

    setLeads((prev) =>
      prev.map((l) => {
        if (leadIds.includes(l.id)) {
          const assignedRep = activeReps[repIndex % activeReps.length];
          repIndex++;
          const update = { assignedUserId: assignedRep.id, assignedUserName: assignedRep.name, updatedAt: new Date().toISOString() };
          updatesMap.set(l.id, update);
          return { ...l, ...update };
        }
        return l;
      })
    );

    for (const [id, update] of updatesMap.entries()) {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
    }
  };

  const addNote = async (leadId: string, noteText: string, newStatus?: LeadStatus) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;
    const currentStatus = newStatus || targetLead.status;
    const tempId = `temp-n-${Date.now()}`;
    const newNote = {
      leadId,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'Unknown',
      note: noteText,
      statusAtTime: currentStatus,
    };
    
    setNotes([{ ...newNote, id: tempId, createdAt: new Date().toISOString() } as LeadNote, ...notes]);
    
    if (newStatus && newStatus !== targetLead.status) {
      updateLead(leadId, { status: newStatus });
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      const savedNote = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === tempId ? savedNote : n)));
    } catch (e) {
      console.error(e);
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
    }
  };

  const scheduleFollowup = async (leadId: string, dateStr: string, noteText: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const assignedUserId = lead.assignedUserId || currentUser?.id || 'unknown';
    const assignedUser = users.find((u) => u.id === assignedUserId);

    const tempId = `temp-f-${Date.now()}`;
    const newFollowup = {
      leadId,
      leadName: lead.name,
      leadPhone: lead.phone,
      leadCompany: lead.company || 'N/A',
      assignedUserId,
      assignedUserName: assignedUser ? assignedUser.name : (currentUser?.name || 'Unknown'),
      scheduledAt: new Date(dateStr).toISOString(),
      notes: noteText,
      status: 'pending',
    };

    setFollowups([{ ...newFollowup, id: tempId, createdAt: new Date().toISOString() } as Followup, ...followups]);

    updateLead(leadId, {
      followupDate: new Date(dateStr).toISOString(),
      status: 'follow_up',
    });

    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFollowup),
      });
      const savedFollowup = await res.json();
      setFollowups((prev) => prev.map((f) => (f.id === tempId ? savedFollowup : f)));
    } catch (e) {
      console.error(e);
      setFollowups((prev) => prev.filter((f) => f.id !== tempId));
    }
  };

  const updateFollowupStatus = async (
    followupId: string,
    status: 'completed' | 'pending' | 'overdue'
  ) => {
    setFollowups((prev) => prev.map((f) => (f.id === followupId ? { ...f, status } : f)));
    try {
      await fetch(`/api/followups/${followupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const importExcelRecords = async (records: ParsedLeadRecord[], filename: string) => {
    const validRecords = records.filter((r) => r.isValid && !r.isDuplicate);

    const newLeads = validRecords.map((r) => ({
      name: r.name,
      phone: r.phone,
      email: r.email,
      company: r.company,
      city: r.city,
      state: r.state,
      address: r.address,
      remarks: r.remarks,
      assignedUserId: null,
      status: 'new',
      followupDate: null,
    }));

    // Insert leads one by one or we could build a bulk insert. We will do bulk in reality, but fetch loops for now.
    // Optimistic UI updates
    const tempLeads = newLeads.map((l, i) => ({ ...l, id: `temp-imp-${Date.now()}-${i}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as Lead));
    setLeads([...tempLeads, ...leads]);

    const newUpload: ExcelUpload = {
      id: `u-${Date.now()}`,
      filename,
      totalRecords: records.length,
      importedCount: validRecords.length,
      duplicateCount: records.filter((r) => r.isDuplicate).length,
      invalidCount: records.filter((r) => !r.isValid).length,
      uploadedBy: currentUser?.name || 'Unknown',
      createdAt: new Date().toISOString(),
    };
    setUploads([newUpload, ...uploads]);

    for (const lead of newLeads) {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    }
    
    // Refresh to get real IDs
    const res = await fetch('/api/sync');
    if (res.ok) {
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const tempId = `temp-u-${Date.now()}`;
    const newUser = { ...userData };
    setUsers([...users, { ...newUser, id: tempId, createdAt: new Date().toISOString() } as User]);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const savedUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === tempId ? savedUser : u)));
    } catch (e) {
      console.error(e);
      setUsers((prev) => prev.filter((u) => u.id !== tempId));
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...newSettings } : (newSettings as SystemSettings)));
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getDashboardStats = () => {
    const totalLeads = leads.length;
    const assignedLeads = leads.filter((l) => l.assignedUserId).length;
    const unassignedLeads = totalLeads - assignedLeads;

    const todayStr = new Date().toISOString().split('T')[0];

    const todayFollowups = followups.filter((f) => {
      const fDate = new Date(f.scheduledAt).toISOString().split('T')[0];
      return fDate === todayStr && f.status !== 'completed';
    }).length;

    const overdueFollowups = followups.filter((f) => {
      const fTime = new Date(f.scheduledAt).getTime();
      return fTime < Date.now() && f.status === 'pending';
    }).length;

    const interestedLeads = leads.filter((l) => l.status === 'interested').length;
    const convertedLeads = leads.filter((l) => l.status === 'converted').length;
    const rejectedLeads = leads.filter((l) => l.status === 'not_interested' || l.status === 'invalid_number').length;

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'active').length;

    return {
      totalLeads,
      assignedLeads,
      unassignedLeads,
      todayFollowups,
      overdueFollowups,
      interestedLeads,
      convertedLeads,
      rejectedLeads,
      totalUsers,
      activeUsers,
    };
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        users,
        notes,
        followups,
        uploads,
        settings,
        filters,
        setFilters,
        addLead,
        updateLead,
        deleteLead,
        assignLeads,
        autoDistributeLeads,
        addNote,
        scheduleFollowup,
        updateFollowupStatus,
        importExcelRecords,
        addUser,
        updateUser,
        deleteUser,
        updateSettings,
        getDashboardStats,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
