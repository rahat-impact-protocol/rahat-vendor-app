import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Vendor, Project, Organization, GoogleUser } from "@/types";
import type { GeneratedWallet } from "@/utils/wallet";
import { MOCK_PROJECTS, MOCK_ORGANIZATIONS } from "@/mocks";

interface AuthState {
  isAuthenticated: boolean;
  vendor: Vendor | null;
  authToken: string | null;
  googleUser: GoogleUser | null;
  wallet: GeneratedWallet | null;
  _hasHydrated: boolean;
  login: (vendor: Vendor, token: string) => void;
  logout: () => void;
  setGoogleUser: (user: GoogleUser) => void;
  setWallet: (wallet: GeneratedWallet) => void;
  setHasHydrated: (v: boolean) => void;
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

// ─── Auth Store (persisted) ────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      vendor: null,
      authToken: null,
      googleUser: null,
      wallet: null,
      _hasHydrated: false,
      login: (vendor, token) =>
        set({ isAuthenticated: true, vendor, authToken: token }),
      logout: () =>
        set({
          isAuthenticated: false,
          vendor: null,
          authToken: null,
          googleUser: null,
          wallet: null,
        }),
      setGoogleUser: (user) => set({ googleUser: user }),
      setWallet: (wallet) => set({ wallet }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "rahat-auth",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist auth state, not transient UI state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        vendor: state.vendor,
        authToken: state.authToken,
        googleUser: state.googleUser,
        wallet: state.wallet,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// ─── Project Store ─────────────────────────────────────────────────
export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: null,
  projects: MOCK_PROJECTS,
  setActiveProject: (project) => set({ activeProject: project }),
  setProjects: (projects) => set({ projects }),
}));

// ─── Org Store ─────────────────────────────────────────────────────
export const useOrgStore = create<OrgState>((set) => ({
  activeOrg: MOCK_ORGANIZATIONS[0],
  organizations: MOCK_ORGANIZATIONS,
  setActiveOrg: (org) => set({ activeOrg: org }),
  setOrganizations: (organizations) => set({ organizations }),
}));
