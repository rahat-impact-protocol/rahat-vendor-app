import { create } from 'zustand';
import type { Vendor, Project, Organization, GoogleUser } from '@/types';
import type { GeneratedWallet } from '@/utils/wallet';
import { MOCK_VENDOR, MOCK_PROJECTS, MOCK_ORGANIZATIONS } from '@/mocks';

interface AuthState {
  isAuthenticated: boolean;
  vendor: Vendor | null;
  googleUser: GoogleUser | null;
  wallet: GeneratedWallet | null;
  login: (vendor: Vendor) => void;
  logout: () => void;
  setGoogleUser: (user: GoogleUser) => void;
  setWallet: (wallet: GeneratedWallet) => void;
}

interface ProjectState {
  activeProject: Project | null;
  projects: Project[];
  setActiveProject: (project: Project) => void;
  setProjects: (projects: Project[]) => void;
}

interface OrgState {
  activeOrg: Organization | null;
  organizations: Organization[];
  setActiveOrg: (org: Organization) => void;
  setOrganizations: (orgs: Organization[]) => void;
}

// ─── Auth Store ────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  vendor: null,
  googleUser: null,
  wallet: null,
  login: (vendor) => set({ isAuthenticated: true, vendor }),
  logout: () => set({ isAuthenticated: false, vendor: null, googleUser: null, wallet: null }),
  setGoogleUser: (user) => set({ googleUser: user }),
  setWallet: (wallet) => set({ wallet }),
}));

// ─── Project Store ─────────────────────────────────────────────────
export const useProjectStore = create<ProjectState>(set => ({
  activeProject: MOCK_PROJECTS[0],
  projects: MOCK_PROJECTS,
  setActiveProject: (project) => set({ activeProject: project }),
  setProjects: (projects) => set({ projects }),
}));

// ─── Org Store ─────────────────────────────────────────────────────
export const useOrgStore = create<OrgState>(set => ({
  activeOrg: MOCK_ORGANIZATIONS[0],
  organizations: MOCK_ORGANIZATIONS,
  setActiveOrg: (org) => set({ activeOrg: org }),
  setOrganizations: (organizations) => set({ organizations }),
}));
