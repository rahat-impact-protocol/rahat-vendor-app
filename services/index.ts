/**
 * API Services — real HTTP calls to backend.
 * Base URL is read from EXPO_PUBLIC_API_URL environment variable.
 */

import type {
  Transaction,
  Beneficiary,
  Project,
  Organization,
  Vendor,
  RedemptionRequest,
  RedemptionStats,
  VendorRegisterPayload,
  VendorLoginPayload,
  VendorApiResponse,
  AuthApiResponse,
  ApiProject,
} from '@/types';

import {
  MOCK_VENDOR,
  MOCK_TRANSACTIONS,
  MOCK_BENEFICIARIES,
  MOCK_PROJECTS,
  MOCK_ORGANIZATIONS,
  MOCK_REDEMPTIONS,
} from '@/mocks';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://impact-core-dev.rahat.io';
const CORE_API_BASE = process.env.EXPO_PUBLIC_CORE_API_URL ?? 'https://impact-core-dev.rahat.io';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// ─── HTTP helper ──────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE,
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // ignore parse errors
    }
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

// ─── Map backend vendor → local Vendor shape ─────────────────────
function mapVendor(v: VendorApiResponse): Vendor {
  const fullName = v.name ?? '';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || '?';

  return {
    id: v.id,
    name: fullName,
    initials,
    email: v.email,
    phone: v.phone ?? v.phoneNumber ?? '',
    walletAddress: v.walletAddress,
    role: v.role ?? 'Vendor',
    activeProjectId: v.projectId ?? '',
    activeOrgId: v.orgId ?? '',
    isOnline: v.isOnline ?? true,
  };
}

// ─── Extract vendor + token from auth response ────────────────────
function parseAuthResponse(data: AuthApiResponse): { vendor: Vendor; token: string } {
  const token = data.access_token ?? data.token ?? '';
  // vendor might be nested under data.vendor or spread at top level
  const vendorData: VendorApiResponse = data.vendor ?? {
    id: data.id ?? '',
    name: data.name,
    email: data.email ?? '',
    phone: data.phone,
    phoneNumber: data.phoneNumber,
    walletAddress: data.walletAddress ?? '',
    role: data.role,
    projectId: data.projectId,
    orgId: data.orgId,
  };
  return { vendor: mapVendor(vendorData), token };
}

// ─── Auth ──────────────────────────────────────────────────────────
export const authService = {
  /**
   * GET /vendor/:email
   * Returns the vendor if registered in the given project, null if not found (404).
   */
  findVendorByEmail: async (projectBaseUrl: string, email: string): Promise<VendorApiResponse | null> => {
    try {
      return await apiFetch<VendorApiResponse>(`/vendor/email/${encodeURIComponent(email)}`, {}, projectBaseUrl);
    } catch (err: any) {
      if (err?.status === 404) return null;
      throw err;
    }
  },

  /**
   * POST /vendor/login
   * Logs in an existing vendor on the given project's backend.
   */
  loginVendor: async (projectBaseUrl: string, payload: VendorLoginPayload): Promise<{ vendor: Vendor; token: string }> => {
    const data = await apiFetch<AuthApiResponse>('/vendor/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, projectBaseUrl);
    return parseAuthResponse(data);
  },

  /**
   * POST /vendor
   * Registers a new vendor on the given project's backend.
   */
  registerVendor: async (projectBaseUrl: string, payload: VendorRegisterPayload): Promise<{ vendor: Vendor; token: string }> => {
    const data = await apiFetch<AuthApiResponse>('/vendor', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, projectBaseUrl);
    return parseAuthResponse(data);
  },

  logout: async (): Promise<void> => {
    await delay(300);
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
  /**
   * GET /project
   * Fetches the list of available projects from the core API.
   */
  getProjects: async (): Promise<ApiProject[]> => {
    return apiFetch<ApiProject[]>('/project', {}, CORE_API_BASE);
  },

  getProjectsByVendor: async (vendorId: string): Promise<Project[]> => {
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
