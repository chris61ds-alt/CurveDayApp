import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK, LIGHT, ThemeColors } from '../theme';

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  hydrated: boolean;
  toggle: () => void;
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark:   false,
  colors:   LIGHT,
  hydrated: false,

  toggle: () => {
    const next = !get().isDark;
    set({ isDark: next, colors: next ? DARK : LIGHT });
    AsyncStorage.setItem('@curveday_theme', next ? 'dark' : 'light').catch(() => {});
  },

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const saved = await AsyncStorage.getItem('@curveday_theme');
      if (saved === 'light') {
        set({ isDark: false, colors: LIGHT, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
