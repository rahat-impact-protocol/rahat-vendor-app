/**
 * API Services — placeholder layer for all endpoints.
 * Replace the mock returns with real HTTP calls when backend is ready.
 */

import type {
  Transaction,
  Beneficiary,
  Project,
  Organization,
  Vendor,
  RedemptionRequest,
  RedemptionStats,
} from '@/types';

import {
  MOCK_VENDOR,
  MOCK_TRANSACTIONS,
  MOCK_BENEFICIARIES,
  MOCK_PROJECTS,
  MOCK_ORGANIZATIONS,
  MOCK_REDEMPTIONS,
} from '@/mocks';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Auth ──────────────────────────────────────────────────────────
export const authService = {
  loginWithGoogle: async (): Promise<Vendor> => {
    await delay(800);
    return MOCK_VENDOR;
  },

  logout: async (): Promise<void> => {
    await delay(300);
  },

  getCurrentVendor: async (): Promise<Vendor> => {
    await delay(200);
    return MOCK_VENDOR;
  },
};

// ─── Transactions ─────────────────────────────────────────────────
export const transactionService = {
  getTransactions: async (projectId: string): Promise<Transaction[]> => {
    await delay();
    return MOCK_TRANSACTIONS.filter(t => t.projectId === projectId);
  },

  getRecentTransactions: async (projectId: string, limit = 4): Promise<Transaction[]> => {
    await delay();
    return MOCK_TRANSACTIONS.filter(t => t.projectId === projectId).slice(0, limit);
  },

  chargeByPhone: async (phone: string, projectId: string): Promise<Beneficiary> => {
    await delay(600);
    const b = MOCK_BENEFICIARIES.find(b => b.phone.endsWith(phone.slice(-4)));
    if (!b) throw new Error('Beneficiary not found');
    return b;
  },

  confirmCharge: async (beneficiaryId: string, projectId: string): Promise<{ otp: boolean }> => {
    await delay(500);
    return { otp: true };
  },

  verifyOtp: async (otp: string): Promise<Transaction> => {
    await delay(1000);
    return MOCK_TRANSACTIONS[0];
  },
};

// ─── Beneficiaries ────────────────────────────────────────────────
export const beneficiaryService = {
  getBeneficiaries: async (projectId: string): Promise<Beneficiary[]> => {
    await delay();
    return MOCK_BENEFICIARIES.filter(b => b.projectId === projectId);
  },

  getBeneficiaryByPhone: async (phone: string): Promise<Beneficiary | null> => {
    await delay(600);
    return MOCK_BENEFICIARIES.find(b => b.phone === phone) ?? null;
  },
};

// ─── Projects ─────────────────────────────────────────────────────
export const projectService = {
  getProjects: async (vendorId: string): Promise<Project[]> => {
    await delay();
    return MOCK_PROJECTS;
  },

  selectProject: async (projectId: string): Promise<Project> => {
    await delay(400);
    const p = MOCK_PROJECTS.find(p => p.id === projectId);
    if (!p) throw new Error('Project not found');
    return p;
  },

  getProjectBalance: async (projectId: string): Promise<number> => {
    await delay(300);
    return MOCK_PROJECTS.find(p => p.id === projectId)?.tokens ?? 0;
  },
};

// ─── Organizations ────────────────────────────────────────────────
export const organizationService = {
  getOrganizations: async (): Promise<Organization[]> => {
    await delay();
    return MOCK_ORGANIZATIONS;
  },

  switchOrganization: async (orgId: string): Promise<Organization> => {
    await delay(1200);
    const org = MOCK_ORGANIZATIONS.find(o => o.id === orgId);
    if (!org) throw new Error('Organization not found');
    return org;
  },
};

// ─── Vendor / Profile ────────────────────────────────────────────
export const vendorService = {
  getProfile: async (): Promise<Vendor> => {
    await delay();
    return MOCK_VENDOR;
  },

  updateProfile: async (updates: Partial<Vendor>): Promise<Vendor> => {
    await delay(500);
    return { ...MOCK_VENDOR, ...updates };
  },
};

// ─── Redemptions ──────────────────────────────────────────────────
export const redemptionService = {
  getRedemptions: async (vendorId: string): Promise<RedemptionRequest[]> => {
    await delay();
    return MOCK_REDEMPTIONS.filter(r => r.vendorId === vendorId);
  },

  getStats: async (vendorId: string): Promise<RedemptionStats> => {
    await delay(200);
    const reqs = MOCK_REDEMPTIONS.filter(r => r.vendorId === vendorId);
    return {
      approved: reqs.filter(r => r.status === 'approved').length,
      pending: reqs.filter(r => r.status === 'pending').length,
      available: 45,
    };
  },

  submitRedemptionRequest: async (tokenAmount: number, vendorId: string): Promise<RedemptionRequest> => {
    await delay(800);
    const newReq: RedemptionRequest = {
      id: `r-${Date.now()}`,
      amount: `${tokenAmount} RAHAT`,
      tokenAmount,
      date: new Date().toLocaleString(),
      status: 'pending',
      vendorId,
      projectId: 'p-001',
    };
    return newReq;
  },
};
