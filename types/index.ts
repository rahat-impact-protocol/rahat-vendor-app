// ─── Core Data Models ─────────────────────────────────────────────

export type TransactionStatus = 'completed' | 'pending';
export type TransactionMode = 'online' | 'offline';
export type RedemptionStatus = 'approved' | 'pending' | 'rejected';

export interface Transaction {
  id: string;
  amount: string;
  tokenAmount: number;
  hash: string;
  date: string;
  mode: TransactionMode;
  status: TransactionStatus;
  beneficiaryPhone?: string;
  beneficiaryName?: string;
  projectId: string;
}

export interface Beneficiary {
  id: string;
  initials: string;
  name: string;
  maskedName: string;
  phone: string;
  walletAddress: string;
  isOnline: boolean;
  tokensAvailable: number;
  tokensApproved: number;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
  tokens: number;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  projectCount: number;
}

export interface Vendor {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  walletAddress: string;
  role: string;
  activeProjectId: string;
  activeOrgId: string;
  isOnline: boolean;
}

export interface RedemptionRequest {
  id: string;
  amount: string;
  tokenAmount: number;
  date: string;
  status: RedemptionStatus;
  vendorId: string;
  projectId: string;
}

export interface RedemptionStats {
  approved: number;
  pending: number;
  available: number;
}

export interface ChargeConfirmData {
  phone: string;
  beneficiary: Beneficiary;
  tokensAvailable: number;
  tokensApproved: number;
  project: string;
}
