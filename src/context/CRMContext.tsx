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
import {
  INITIAL_LEADS,
  INITIAL_NOTES,
  INITIAL_FOLLOWUPS,
  INITIAL_USERS,
  DEFAULT_SETTINGS,
} from '@/lib/storage/mockData';
import { useAuth } from './AuthContext';

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
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  assignLeads: (leadIds: string[], userId: string | null) => void;
  autoDistributeLeads: (leadIds: string[]) => void;
  
  addNote: (leadId: string, noteText: string, newStatus?: LeadStatus) => void;
  scheduleFollowup: (leadId: string, dateStr: string, noteText: string) => void;
  updateFollowupStatus: (followupId: string, status: 'completed' | 'pending' | 'overdue') => void;
  
  importExcelRecords: (records: ParsedLeadRecord[], filename: string) => void;
  
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  
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

const LOCAL_STORAGE_KEY = 'leadsquare_crm_state_v1';

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [notes, setNotes] = useState<LeadNote[]>(INITIAL_NOTES);
  const [followups, setFollowups] = useState<Followup[]>(INITIAL_FOLLOWUPS);
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

  // Load state from Local Storage if present
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.followups) setFollowups(parsed.followups);
        if (parsed.uploads) setUploads(parsed.uploads);
        if (parsed.settings) setSettings(parsed.settings);
      } catch (e) {
        console.error('Failed to parse CRM state from Local Storage', e);
      }
    }
  }, []);

  // Save state to Local Storage
  const saveState = (updatedData: {
    leads?: Lead[];
    users?: User[];
    notes?: LeadNote[];
    followups?: Followup[];
    uploads?: ExcelUpload[];
    settings?: SystemSettings;
  }) => {
    const stateToSave = {
      leads: updatedData.leads || leads,
      users: updatedData.users || users,
      notes: updatedData.notes || notes,
      followups: updatedData.followups || followups,
      uploads: updatedData.uploads || uploads,
      settings: updatedData.settings || settings,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const assignedUser = users.find((u) => u.id === leadData.assignedUserId);
    const newLead: Lead = {
      ...leadData,
      id: `l-${Date.now()}`,
      assignedUserName: assignedUser ? assignedUser.name : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextLeads = [newLead, ...leads];
    setLeads(nextLeads);
    saveState({ leads: nextLeads });
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const nextLeads = leads.map((l) => {
      if (l.id === id) {
        let assignedUserName = l.assignedUserName;
        if (updates.assignedUserId !== undefined) {
          const userObj = users.find((u) => u.id === updates.assignedUserId);
          assignedUserName = userObj ? userObj.name : undefined;
        }
        return {
          ...l,
          ...updates,
          assignedUserName,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });
    setLeads(nextLeads);
    saveState({ leads: nextLeads });
  };

  const deleteLead = (id: string) => {
    const nextLeads = leads.filter((l) => l.id !== id);
    const nextNotes = notes.filter((n) => n.leadId !== id);
    const nextFollowups = followups.filter((f) => f.leadId !== id);

    setLeads(nextLeads);
    setNotes(nextNotes);
    setFollowups(nextFollowups);
    saveState({ leads: nextLeads, notes: nextNotes, followups: nextFollowups });
  };

  const assignLeads = (leadIds: string[], userId: string | null) => {
    const userObj = users.find((u) => u.id === userId);
    const nextLeads = leads.map((l) => {
      if (leadIds.includes(l.id)) {
        return {
          ...l,
          assignedUserId: userId,
          assignedUserName: userObj ? userObj.name : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });
    setLeads(nextLeads);
    saveState({ leads: nextLeads });
  };

  const autoDistributeLeads = (leadIds: string[]) => {
    const activeReps = users.filter((u) => u.role === 'sales_rep' && u.status === 'active');
    if (activeReps.length === 0) return;

    let repIndex = 0;
    const nextLeads = leads.map((l) => {
      if (leadIds.includes(l.id)) {
        const assignedRep = activeReps[repIndex % activeReps.length];
        repIndex++;
        return {
          ...l,
          assignedUserId: assignedRep.id,
          assignedUserName: assignedRep.name,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });
    setLeads(nextLeads);
    saveState({ leads: nextLeads });
  };

  const addNote = (leadId: string, noteText: string, newStatus?: LeadStatus) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const currentStatus = newStatus || targetLead.status;

    const newNote: LeadNote = {
      id: `n-${Date.now()}`,
      leadId,
      userId: currentUser.id,
      userName: currentUser.name,
      note: noteText,
      statusAtTime: currentStatus,
      createdAt: new Date().toISOString(),
    };

    const nextNotes = [newNote, ...notes];
    setNotes(nextNotes);

    if (newStatus && newStatus !== targetLead.status) {
      updateLead(leadId, { status: newStatus });
    }

    saveState({ notes: nextNotes });
  };

  const scheduleFollowup = (leadId: string, dateStr: string, noteText: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const assignedUserId = lead.assignedUserId || currentUser.id;
    const assignedUser = users.find((u) => u.id === assignedUserId);

    const newFollowup: Followup = {
      id: `f-${Date.now()}`,
      leadId,
      leadName: lead.name,
      leadPhone: lead.phone,
      leadCompany: lead.company || 'N/A',
      assignedUserId,
      assignedUserName: assignedUser ? assignedUser.name : currentUser.name,
      scheduledAt: new Date(dateStr).toISOString(),
      notes: noteText,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const nextFollowups = [newFollowup, ...followups];
    setFollowups(nextFollowups);

    // Update lead follow-up date and status if required
    updateLead(leadId, {
      followupDate: new Date(dateStr).toISOString(),
      status: 'follow_up',
    });

    saveState({ followups: nextFollowups });
  };

  const updateFollowupStatus = (
    followupId: string,
    status: 'completed' | 'pending' | 'overdue'
  ) => {
    const nextFollowups = followups.map((f) => (f.id === followupId ? { ...f, status } : f));
    setFollowups(nextFollowups);
    saveState({ followups: nextFollowups });
  };

  const importExcelRecords = (records: ParsedLeadRecord[], filename: string) => {
    const validRecords = records.filter((r) => r.isValid && !r.isDuplicate);

    const newLeads: Lead[] = validRecords.map((r, index) => ({
      id: `l-imp-${Date.now()}-${index}`,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const nextLeads = [...newLeads, ...leads];

    const newUpload: ExcelUpload = {
      id: `u-${Date.now()}`,
      filename,
      totalRecords: records.length,
      importedCount: validRecords.length,
      duplicateCount: records.filter((r) => r.isDuplicate).length,
      invalidCount: records.filter((r) => !r.isValid).length,
      uploadedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const nextUploads = [newUpload, ...uploads];

    setLeads(nextLeads);
    setUploads(nextUploads);
    saveState({ leads: nextLeads, uploads: nextUploads });
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveState({ users: nextUsers });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const nextUsers = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setUsers(nextUsers);
    saveState({ users: nextUsers });
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const nextSettings = { ...settings, ...newSettings };
    setSettings(nextSettings);
    saveState({ settings: nextSettings });
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
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
