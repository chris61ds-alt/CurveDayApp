import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_DONE    = '@curveday/onboarded';
const KEY_PREFS   = '@curveday/trackingPrefs';
const KEY_PROFILE = '@curveday/userProfile';

export interface UserProfile {
  weight?: number;   // kg
  height?: number;   // cm
  age?: number;
  sex?: 'male' | 'female' | 'other';
}

export interface OnboardingPrefs {
  trackingGoals: string[];
  disclaimerAcceptedAt: string | null;
  profile?: UserProfile;
}

interface OnboardingStore {
  done: boolean;
  hydrated: boolean;
  prefs: OnboardingPrefs;
  hydrate: () => Promise<void>;
  completeOnboarding: (prefs: OnboardingPrefs) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  done: false,
  hydrated: false,
  prefs: { trackingGoals: [], disclaimerAcceptedAt: null, profile: {} },

  hydrate: async () => {
    try {
      const [doneRaw, prefsRaw, profileRaw] = await Promise.all([
        AsyncStorage.getItem(KEY_DONE),
        AsyncStorage.getItem(KEY_PREFS),
        AsyncStorage.getItem(KEY_PROFILE),
      ]);
      const basePrefs: OnboardingPrefs = prefsRaw
        ? JSON.parse(prefsRaw)
        : { trackingGoals: [], disclaimerAcceptedAt: null };
      if (profileRaw) basePrefs.profile = JSON.parse(profileRaw);
      set({ done: doneRaw === 'true', prefs: basePrefs, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  completeOnboarding: async (prefs) => {
    await Promise.all([
      AsyncStorage.setItem(KEY_DONE,    'true'),
      AsyncStorage.setItem(KEY_PREFS,   JSON.stringify(prefs)),
      AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(prefs.profile ?? {})),
    ]);
    set({ done: true, prefs });
  },

  updateProfile: async (profile) => {
    const prefs = { ...get().prefs, profile };
    await Promise.all([
      AsyncStorage.setItem(KEY_PREFS,   JSON.stringify(prefs)),
      AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(profile)),
    ]);
    set({ prefs });
  },

  resetOnboarding: async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEY_DONE),
      AsyncStorage.removeItem(KEY_PREFS),
      AsyncStorage.removeItem(KEY_PROFILE),
    ]);
    set({ done: false, prefs: { trackingGoals: [], disclaimerAcceptedAt: null, profile: {} } });
  },
}));
