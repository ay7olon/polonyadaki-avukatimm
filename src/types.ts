export type Language = 'TR' | 'PL' | 'EN';

export type UserRole = 'client' | 'lawyer' | 'admin';

export type ScreenId = 
  | 'landing'
  | 'auth'
  | 'client_dashboard'
  | 'new_application'
  | 'case_timeline'
  | 'messaging'
  | 'admin_case_list'
  | 'admin_case_detail';

export type UrgencyLevel = 'normal' | 'urgent' | 'critical';

export type CaseStatus = 
  | 'received' 
  | 'assigned' 
  | 'in_review' 
  | 'pending_docs' 
  | 'submitted' 
  | 'completed' 
  | 'rejected';

export interface CaseDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  fileUrl?: string;
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  date?: string;
  status: 'completed' | 'current' | 'upcoming';
  actor?: string;
}

export interface LawyerNote {
  id: string;
  author: string;
  date: string;
  content: string;
  isPrivate: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'lawyer' | 'system';
  avatar?: string;
  text: string;
  timestamp: string;
  attachments?: { name: string; size: string; type: string; path?: string }[];
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  caseType: string;
  caseCategory: 'oturtma' | 'calisma' | 'sirket' | 'aile' | 'vatandasilik' | 'danismanlik';
  city: string; // e.g. Varşova (Warszawa), Kraków, Wrocław, Poznań
  status: CaseStatus;
  urgency: UrgencyLevel;
  createdAt: string;
  updatedAt: string;
  assignedLawyerId?: string;
  assignedLawyer: string;
  lawyerAvatar: string;
  progressPercent: number;
  documents: CaseDocument[];
  timeline: TimelineStep[];
  internalNotes: LawyerNote[];
  messages: ChatMessage[];
  formSummary: Record<string, string>;
}

export interface ScreenDesignNote {
  screenId: ScreenId;
  screenNumber: number;
  screenName: string;
  targetUser: 'Client' | 'Lawyer/Admin' | 'Public' | 'Client & Lawyer';
  purpose: string;
  layoutStructure: string;
  colorPaletteNotes: string;
  componentArchitecture: string[];
  devNotesForCursor: string;
}
