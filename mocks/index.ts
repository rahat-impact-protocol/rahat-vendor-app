import type {
  Transaction,
  Beneficiary,
  Project,
  Organization,
  Vendor,
  RedemptionRequest,
} from '@/types';

// ─── Mock Vendor (logged-in user) ─────────────────────────────────
export const MOCK_VENDOR: Vendor = {
  id: 'v-001',
  name: 'Aadarsha Lamichhane',
  initials: 'AL',
  email: 'aadarsha@reliefnepal.org',
  phone: '+977 98XXXXXXXX',
  walletAddress: '0x5e68qwhs73...37455',
  role: 'Vendor',
  activeProjectId: 'p-001',
  activeOrgId: 'org-001',
  isOnline: true,
};

// ─── Mock Organizations ────────────────────────────────────────────
export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org-001', name: 'UNICEF Nepal',      initials: 'UN', color: '#1D70B8', role: 'Vendor',   projectCount: 3 },
  { id: 'org-002', name: 'Red Cross Nepal',   initials: 'RC', color: '#C0392B', role: 'Vendor',   projectCount: 2 },
  { id: 'org-003', name: 'Save the Children', initials: 'SC', color: '#2E7D32', role: 'Observer',  projectCount: 1 },
];

// ─── Mock Projects ─────────────────────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  { id: 'p-001', name: 'Relief Nepal 2025',    baseUrl: '', orgId: 'org-001', orgName: 'UNICEF Nepal',    tokens: 12325, isActive: true  },
  { id: 'p-002', name: 'Flood Response Koshi', baseUrl: '', orgId: 'org-002', orgName: 'Red Cross Nepal', tokens: 8200,  isActive: false },
  { id: 'p-003', name: 'Earthquake Aid 2024',  baseUrl: '', orgId: 'org-001', orgName: 'WFP',             tokens: 3100,  isActive: false },
];

// ─── Mock Beneficiaries ────────────────────────────────────────────
export const MOCK_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'b-001', initials: 'AL',
    name: 'Aadarsha Lamichhane', maskedName: 'A******a L********e',
    phone: '9800000001', walletAddress: '0x5e68...37455',
    isOnline: true, tokensAvailable: 45, tokensApproved: 60, projectId: 'p-001',
  },
  {
    id: 'b-002', initials: 'RK',
    name: 'Rama Kumari', maskedName: 'R***a K*****i',
    phone: '9800000002', walletAddress: '0x9a21...88fc1',
    isOnline: true, tokensAvailable: 30, tokensApproved: 40, projectId: 'p-001',
  },
  {
    id: 'b-003', initials: 'SM',
    name: 'Sita Maya', maskedName: 'S***a M*****i',
    phone: '9800000003', walletAddress: '0x3b77...21d44',
    isOnline: true, tokensAvailable: 20, tokensApproved: 25, projectId: 'p-001',
  },
  {
    id: 'b-004', initials: 'BT',
    name: 'Bikram Tharu', maskedName: 'B***n T*****u',
    phone: '9800000004', walletAddress: '0xc44a...9f2bb',
    isOnline: true, tokensAvailable: 15, tokensApproved: 20, projectId: 'p-001',
  },
  {
    id: 'b-005', initials: 'GS',
    name: 'Gita Sharma', maskedName: 'G***a S*****a',
    phone: '9800000005', walletAddress: '0x1f93...562e7',
    isOnline: true, tokensAvailable: 50, tokensApproved: 60, projectId: 'p-001',
  },
  {
    id: 'b-006', initials: 'NK',
    name: 'Nirmala KC', maskedName: 'N***a K*****i',
    phone: '9800000006', walletAddress: '0x7d82...a1e33',
    isOnline: true, tokensAvailable: 35, tokensApproved: 45, projectId: 'p-001',
  },
  {
    id: 'b-007', initials: 'PB',
    name: 'Prakash Bhatt', maskedName: 'P*****h B****t',
    phone: '9800000007', walletAddress: '0x2c11...f73dd',
    isOnline: false, tokensAvailable: 10, tokensApproved: 15, projectId: 'p-001',
  },
  {
    id: 'b-008', initials: 'MR',
    name: 'Manisha Rana', maskedName: 'M*****a R**a',
    phone: '9800000008', walletAddress: '0x4f56...88a12',
    isOnline: false, tokensAvailable: 25, tokensApproved: 30, projectId: 'p-001',
  },
  {
    id: 'b-009', initials: 'SG',
    name: 'Sunil Gurung', maskedName: 'S***l G*****g',
    phone: '9800000009', walletAddress: '0x9d33...c5b7e',
    isOnline: false, tokensAvailable: 18, tokensApproved: 20, projectId: 'p-001',
  },
];

// ─── Mock Transactions ─────────────────────────────────────────────
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001', amount: '12 Tokens', tokenAmount: 12,
    hash: '0x8f3a...92e1', date: 'Today, 2:14 PM',
    mode: 'online', status: 'completed',
    beneficiaryPhone: '9800000001', beneficiaryName: 'Aadarsha L.', projectId: 'p-001',
  },
  {
    id: 'tx-002', amount: '5 Tokens', tokenAmount: 5,
    hash: '0x4b7c...18d2', date: 'Today, 11:02 AM',
    mode: 'online', status: 'completed',
    beneficiaryPhone: '9800000002', beneficiaryName: 'Rama K.', projectId: 'p-001',
  },
  {
    id: 'tx-003', amount: '20 Tokens', tokenAmount: 20,
    hash: '0xa12e...77b9', date: 'Yesterday, 5:48 PM',
    mode: 'offline', status: 'pending',
    beneficiaryPhone: '9800000003', beneficiaryName: 'Sita M.', projectId: 'p-001',
  },
  {
    id: 'tx-004', amount: '30 Tokens', tokenAmount: 30,
    hash: '0xc44a...9f2bb', date: 'Yesterday, 11:00 AM',
    mode: 'online', status: 'completed',
    beneficiaryPhone: '9800000004', beneficiaryName: 'Bikram T.', projectId: 'p-001',
  },
  {
    id: 'tx-005', amount: '15 Tokens', tokenAmount: 15,
    hash: '0x1f93...562e7', date: 'May 10, 8:20 AM',
    mode: 'offline', status: 'completed',
    beneficiaryPhone: '9800000005', beneficiaryName: 'Gita S.', projectId: 'p-001',
  },
  {
    id: 'tx-006', amount: '8 Tokens', tokenAmount: 8,
    hash: '0x7d82...a1e33', date: 'May 10, 2:05 PM',
    mode: 'online', status: 'pending',
    beneficiaryPhone: '9800000006', beneficiaryName: 'Nirmala K.', projectId: 'p-001',
  },
  {
    id: 'tx-007', amount: '20 Rahat', tokenAmount: 20,
    hash: '0x2c11...f73dd', date: 'Jan 7 · 07:45 AM',
    mode: 'offline', status: 'completed',
    beneficiaryPhone: '9800000007', beneficiaryName: 'Prakash B.', projectId: 'p-001',
  },
];

// ─── Mock Redemption Requests ──────────────────────────────────────
export const MOCK_REDEMPTIONS: RedemptionRequest[] = [
  { id: 'r-001', amount: '1 RAHAT', tokenAmount: 1, date: 'Apr 29, 2026, 9:01:10 PM', status: 'approved', vendorId: 'v-001', projectId: 'p-001' },
  { id: 'r-002', amount: '1 RAHAT', tokenAmount: 1, date: 'Apr 29, 2026, 9:01:06 PM', status: 'approved', vendorId: 'v-001', projectId: 'p-001' },
  { id: 'r-003', amount: '1 RAHAT', tokenAmount: 1, date: 'Apr 29, 2026, 9:00:57 PM', status: 'approved', vendorId: 'v-001', projectId: 'p-001' },
  { id: 'r-004', amount: '1 RAHAT', tokenAmount: 1, date: 'Apr 29, 2026, 9:00:53 PM', status: 'approved', vendorId: 'v-001', projectId: 'p-001' },
  { id: 'r-005', amount: '1 RAHAT', tokenAmount: 1, date: 'Apr 29, 2026, 9:00:50 PM', status: 'approved', vendorId: 'v-001', projectId: 'p-001' },
  { id: 'r-006', amount: '1 RAHAT', tokenAmount: 1, date: 'Apr 29, 2026, 9:00:47 PM', status: 'approved', vendorId: 'v-001', projectId: 'p-001' },
  { id: 'r-007', amount: '2 RAHAT', tokenAmount: 2, date: 'Apr 28, 2026, 3:15:22 PM', status: 'pending',  vendorId: 'v-001', projectId: 'p-001' },
];
