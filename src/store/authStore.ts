import { create } from 'zustand';
import { AuthUser, getCurrentUser, signInWithGoogle, signOut, onAuthStateChange } from '../services/authService';

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  syncing: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: () => Promise<string | null>;   // returns error string or null
  logout: () => Promise<void>;
  setSyncing: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:     null,
  loading:  false,
  syncing:  false,
  hydrated: false,

  hydrate: async () => {
    const user = await getCurrentUser();
    set({ user, hydrated: true });

    // Auth-State-Changes live überwachen
    onAuthStateChange((u) => set({ user: u }));
  },

  login: async () => {
    set({ loading: true });
    const { user, error } = await signInWithGoogle();
    set({ user, loading: false });
    return error;
  },

  logout: async () => {
    await signOut();
    set({ user: null });
  },

  setSyncing: (v) => set({ syncing: v }),
}));
