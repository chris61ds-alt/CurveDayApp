import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@curveday/meals';

export type MealSize = 'klein' | 'mittel' | 'groß';

export interface MealEntry {
  id: string;
  timeH: number;   // decimal hours, e.g. 12.5 = 12:30
  size: MealSize;
  label?: string;  // optional custom label
}

interface MealStore {
  meals: MealEntry[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addMeal: (entry: Omit<MealEntry, 'id'>) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useMealStore = create<MealStore>((set, get) => ({
  meals: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      set({ meals: raw ? JSON.parse(raw) : [], hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  addMeal: async (entry) => {
    const meal: MealEntry = { ...entry, id: `meal_${Date.now()}_${Math.random().toString(36).slice(2)}` };
    const meals = [...get().meals, meal];
    await AsyncStorage.setItem(KEY, JSON.stringify(meals));
    set({ meals });
  },

  removeMeal: async (id) => {
    const meals = get().meals.filter(m => m.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(meals));
    set({ meals });
  },

  clearAll: async () => {
    await AsyncStorage.removeItem(KEY);
    set({ meals: [] });
  },
}));
