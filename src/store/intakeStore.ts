import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Intake } from '../utils/pkHelpers';
import { pushIntake, deleteIntake, pullIntakes, syncAllIntakes } from '../services/syncService';

const STORAGE_KEY = '@curveday/intakes';

const DEMO_INTAKES: Intake[] = [
  { id: '1', substanceId: 'ibuprofen',  timeH: 6.5,  doseLabel: '400 mg' },
  { id: '2', substanceId: 'koffein',    timeH: 8.0,  doseLabel: '100 mg' },
  { id: '3', substanceId: 'l_theanin',  timeH: 8.5,  doseLabel: '200 mg' },
  { id: '4', substanceId: 'vitamin_d3', timeH: 12.5, doseLabel: '2000 I.E.' },
  { id: '5', substanceId: 'magnesium',  timeH: 20.5, doseLabel: '300 mg' },
];

interface IntakeStore {
  intakes: Intake[];
  selectedId: string;
  hydrated: boolean;
  setSelectedId: (id: string) => void;
  addIntake: (intake: Omit<Intake, 'id'>) => Promise<void>;
  removeIntake: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  uploadToCloud: () => Promise<void>;
}

async function persist(intakes: Intake[]) {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(intakes)); } catch {}
}

export const useIntakeStore = create<IntakeStore>((set, get) => ({
  intakes:    [],
  selectedId: 'koffein',
  hydrated:   false,

  setSelectedId: (id) => set({ selectedId: id }),

  addIntake: async (intake) => {
    const newIntake: Intake = {
      ...intake,
      id: Date.now().toString(),
      takenAt: intake.takenAt ?? new Date().toISOString(), // ISO-Timestamp für Carry-over
    };
    const updated = [...get().intakes, newIntake];
    set({ intakes: updated, selectedId: intake.substanceId });
    await persist(updated);
    // Cloud Sync (fire & forget)
    pushIntake(newIntake).catch(() => {});
  },

  removeIntake: async (id) => {
    const updated = get().intakes.filter((i) => i.id !== id);
    set({ intakes: updated });
    await persist(updated);
    deleteIntake(id).catch(() => {});
  },

  hydrate: async () => {
    try {
      const raw   = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as Intake[]) : null;
      set({
        intakes:  saved && saved.length > 0 ? saved : DEMO_INTAKES,
        hydrated: true,
      });
    } catch {
      set({ intakes: DEMO_INTAKES, hydrated: true });
    }
  },

  // Nach Login: Cloud-Daten laden, lokal zusammenführen (Cloud hat Vorrang)
  syncFromCloud: async () => {
    const cloud = await pullIntakes();
    if (!cloud) return;
    const local = get().intakes.filter(i => i.id.startsWith('demo') || DEMO_INTAKES.some(d => d.id === i.id));
    // Cloud + lokale nicht-Demo Intakes mergen
    const localNonDemo = get().intakes.filter(i => !DEMO_INTAKES.some(d => d.id === i.id));
    const merged = [...cloud];
    for (const li of localNonDemo) {
      if (!merged.find(c => c.id === li.id)) merged.push(li);
    }
    const final = merged.length > 0 ? merged : cloud;
    set({ intakes: final });
    await persist(final);
  },

  // Alle lokalen Intakes hochladen
  uploadToCloud: async () => {
    await syncAllIntakes(get().intakes);
  },
}));
