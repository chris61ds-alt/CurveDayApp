import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@curveday/reminders';

export interface Reminder {
  substanceId: string;
  hour: number;
  minute: number;
}

interface ReminderStore {
  reminders: Reminder[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setReminder: (substanceId: string, hour: number, minute: number) => Promise<void>;
  removeReminder: (substanceId: string) => Promise<void>;
}

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: [],
  hydrated:  false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved: Reminder[] = raw ? JSON.parse(raw) : [];
      set({ reminders: saved, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setReminder: async (substanceId, hour, minute) => {
    const existing = get().reminders.filter(r => r.substanceId !== substanceId);
    const updated  = [...existing, { substanceId, hour, minute }];
    set({ reminders: updated });
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  },

  removeReminder: async (substanceId) => {
    const updated = get().reminders.filter(r => r.substanceId !== substanceId);
    set({ reminders: updated });
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  },
}));
