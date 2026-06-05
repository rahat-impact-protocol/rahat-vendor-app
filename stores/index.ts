//rahat-vendor-app/stores/index.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Vendor, ApiProject, Organization, GoogleUser } from '@/types';
import type { GeneratedWallet } from '@/utils/wallet';
import { MOCK_ORGANIZATIONS } from '@/mocks';

interface AuthState {
  // Persisted
  accessToken: string | null;
  vendor: Vendor | null;
  mnemonic: string | null;
  // Transient (not saved to AsyncStorage)
  googleUser: GoogleUser | null;
  wallet: GeneratedWallet | null;
  _hasHydrated: boolean;
  login: (vendor: Vendor, token: string) => void;
  logout: () => void;
  setGoogleUser: (user: GoogleUser) => void;
  setWallet: (wallet: GeneratedWallet) => void;
  setHasHydrated: (v: boolean) => void;
  setVendor: (vendor: Vendor) => void;
}

interface ProjectState {
  activeProject: ApiProject | null;
  projects: ApiProject[];
  setActiveProject: (project: ApiProject) => void;
  setProjects: (projects: ApiProject[]) => void;
  resetProjects: () => void;
}

interface OrgState {
  activeOrg: Organization | null;
  organizations: Organization[];
  setActiveOrg: (org: Organization) => void;
  setOrganizations: (orgs: Organization[]) => void;
  resetOrgs: () => void;
}

// ─── Auth Store (persisted) ────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      vendor: null,
      mnemonic: null,
      googleUser: null,
      wallet: null,
      _hasHydrated: false,
      login: (vendor, token) => set({ accessToken: token, vendor }),
      logout: () =>
        set({
          accessToken: null,
          vendor: null,
          mnemonic: null,
          googleUser: null,
          wallet: null,
        }),
      setGoogleUser: (user) => set({ googleUser: user }),
      setWallet: (wallet) => set({ wallet, mnemonic: wallet.mnemonic }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setVendor: (vendor) => set({ vendor }),
    }),
    {
      name: 'rahat-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        vendor: state.vendor,
        mnemonic: state.mnemonic,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// ─── Project Store (persisted) ────────────────────────────────────
export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProject: null,
      projects: [],
      setActiveProject: (project) => set({ activeProject: project }),
      setProjects: (projects) => set({ projects }),
      resetProjects: () => set({ activeProject: null, projects: [] }),
    }),
    {
      name: 'rahat-project',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ activeProject: state.activeProject }),
    },
  ),
);

// ─── Org Store ─────────────────────────────────────────────────────
export const useOrgStore = create<OrgState>((set) => ({
  activeOrg: MOCK_ORGANIZATIONS[0],
  organizations: MOCK_ORGANIZATIONS,
  setActiveOrg: (org) => set({ activeOrg: org }),
  setOrganizations: (organizations) => set({ organizations }),
  resetOrgs: () =>
    set({
      activeOrg: MOCK_ORGANIZATIONS[0],
      organizations: MOCK_ORGANIZATIONS,
    }),
}));
