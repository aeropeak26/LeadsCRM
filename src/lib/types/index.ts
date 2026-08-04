export type UserRole = 'admin' | 'sales_rep';
export type UserStatus = 'active' | 'disabled';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'follow_up'
  | 'interested'
  | 'not_interested'
  | 'dnp'
  | 'busy'
  | 'invalid_number'
  | 'converted';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  state: string;
  address: string;
  remarks: string;
  assignedUserId: string | null;
  assignedUserName?: string;
  status: LeadStatus;
  followupDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  note: string;
  statusAtTime: LeadStatus;
  createdAt: string;
}

export interface LeadStatusHistory {
  id: string;
  leadId: string;
  changedBy: string;
  changedByName: string;
  oldStatus: LeadStatus | null;
  newStatus: LeadStatus;
  notes: string;
  createdAt: string;
}

export interface Followup {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadCompany: string;
  assignedUserId: string;
  assignedUserName: string;
  scheduledAt: string;
  notes: string;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
}

export interface ExcelUpload {
  id: string;
  filename: string;
  totalRecords: number;
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
  uploadedBy: string;
  createdAt: string;
}

export interface ParsedLeadRecord {
  name: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  state: string;
  address: string;
  remarks: string;
  isValid: boolean;
  isDuplicate: boolean;
  validationError?: string;
}

export interface FilterOptions {
  search: string;
  status: LeadStatus | 'all';
  assignedUserId: string | 'all';
  city: string | 'all';
  state: string | 'all';
  dateFrom: string;
  dateTo: string;
}

export interface SystemSettings {
  companyName: string;
  supportEmail: string;
  currency: string;
  autoDistributionEnabled: boolean;
  duplicateCheckPhone: boolean;
  defaultFollowupDays: number;
  leadStatuses: { key: LeadStatus; label: string; color: string }[];
}
