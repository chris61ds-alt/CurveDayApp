import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_DONE       = '@curveday/onboarded';
const KEY_PREFS      = '@curveday/trackingPrefs';
const KEY_DISCLAIMER = '@curveday/disclaimerAccepted';

export interface OnboardingPrefs {
  trackingGoals: string[];   // z.B. ['medication', 'stimulant', 'supplement']
  disclaimerAcceptedAt: string | null;  // ISO timestamp
}

interface OnboardingStore {
  done: boolean;
  hydrated: boolean;
  prefs: OnboardingPrefs;
  hydrate: () => Promise<void>;
  completeOnboarding: (prefs: OnboardingPrefs) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  done: false,
  hydrated: false,
  prefs: { trackingGoals: [], disclaimerAcceptedAt: null },

  hydrate: async () => {
    try {
      const [doneRaw, prefsRaw] = await Promise.all([
        AsyncStorage.getItem(KEY_DONE),
        AsyncStorage.getItem(KEY_PREFS),
      ]);
      set({
        done: doneRaw === 'true',
        prefs: prefsRaw ? JSON.parse(prefsRaw) : { trackingGoals: [], disclaimerAcceptedAt: null },
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  completeOnboarding: async (prefs) => {
    await Promise.all([
      AsyncStorage.setItem(KEY_DONE, 'true'),
      AsyncStorage.setItem(KEY_PREFS, JSON.stringify(prefs)),
      AsyncStorage.setItem(KEY_DISCLAIMER, prefs.disclaimerAcceptedAt ?? ''),
    ]);
    set({ done: true, prefs });
  },

  resetOnboarding: async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEY_DONE),
      AsyncStorage.removeItem(KEY_PREFS),
      AsyncStorage.removeItem(KEY_DISCLAIMER),
    ]);
    set({ done: false, prefs: { trackingGoals: [], disclaimerAcceptedAt: null } });
  },
}));
