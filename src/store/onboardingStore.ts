import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Region } from '../utils/regionUtils';

const KEY_DONE    = '@curveday/onboarded';
const KEY_PREFS   = '@curveday/trackingPrefs';
const KEY_PROFILE = '@curveday/userProfile';
const KEY_REGION  = '@curveday/region';

export interface UserProfile {
  weight?: number;   // always stored in kg
  height?: number;   // always stored in cm
  age?: number;
  sex?: 'male' | 'female' | 'other';
  region?: Region;   // user's country/locale
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
  updateRegion: (region: Region) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  done: false,
  hydrated: false,
  prefs: { trackingGoals: [], disclaimerAcceptedAt: null, profile: {} },

  hydrate: async () => {
    try {
      const [doneRaw, prefsRaw, profileRaw, regionRaw] = await Promise.all([
        AsyncStorage.getItem(KEY_DONE),
        AsyncStorage.getItem(KEY_PREFS),
        AsyncStorage.getItem(KEY_PROFILE),
        AsyncStorage.getItem(KEY_REGION),
      ]);
      const basePrefs: OnboardingPrefs = prefsRaw
        ? JSON.parse(prefsRaw)
        : { trackingGoals: [], disclaimerAcceptedAt: null };
      if (profileRaw) {
        basePrefs.profile = JSON.parse(profileRaw);
      } else {
        basePrefs.profile = basePrefs.profile ?? {};
      }
      // Merge persisted region into profile
      if (regionRaw && basePrefs.profile) {
        basePrefs.profile.region = regionRaw as Region;
      }
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
    const saves: Promise<void>[] = [
      AsyncStorage.setItem(KEY_PREFS,   JSON.stringify(prefs)),
      AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(profile)),
    ];
    if (profile.region) saves.push(AsyncStorage.setItem(KEY_REGION, profile.region));
    await Promise.all(saves);
    set({ prefs });
  },

  updateRegion: async (region) => {
    const profile = { ...(get().prefs.profile ?? {}), region };
    const prefs   = { ...get().prefs, profile };
    await Promise.all([
      AsyncStorage.setItem(KEY_REGION,  region),
      AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(profile)),
      AsyncStorage.setItem(KEY_PREFS,   JSON.stringify(prefs)),
    ]);
    set({ prefs });
  },

  resetOnboarding: async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEY_DONE),
      AsyncStorage.removeItem(KEY_PREFS),
      AsyncStorage.removeItem(KEY_PROFILE),
      AsyncStorage.removeItem(KEY_REGION),
    ]);
    set({ done: false, prefs: { trackingGoals: [], disclaimerAcceptedAt: null, profile: {} } });
  },
}));
