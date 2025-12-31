
export enum RequestStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MORE_INFO = 'MORE_INFO'
}

export enum SLAStatus {
  NORMAL = 'NORMAL',
  DUE_SOON = 'DUE_SOON',
  OVERDUE = 'OVERDUE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  avatar?: string;
}

export interface ApprovalStep {
  label: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  assignee: string;
  updatedAt?: string;
}

export interface Request {
  id: string;
  code: string;
  type: string;
  title: string;
  requester: User;
  status: RequestStatus;
  sla: SLAStatus;
  createdAt: string;
  updatedAt: string;
  currentStep: string;
  steps: ApprovalStep[];
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  source: 'Local' | 'Nextcloud';
  scanStatus: 'Clean' | 'Scanning' | 'Infected';
}

export interface SystemStatus {
  name: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  usage: number;
  capacity: string;
  lastBackup: string;
}
