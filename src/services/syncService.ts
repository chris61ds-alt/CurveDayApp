import { supabase } from './supabaseClient';
import { Intake } from '../utils/pkHelpers';
import { isSupabaseConfigured } from '../config/supabase';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** Alle Intakes des aktuellen Users für heute aus Supabase laden */
export async function pullIntakes(): Promise<Intake[] | null> {
  if (!isSupabaseConfigured) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('intakes')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today())
    .order('time_h', { ascending: true });

  if (error) { console.warn('pullIntakes error:', error.message); return null; }

  return (data ?? []).map((row: any) => ({
    id:          row.id,
    substanceId: row.substance_id,
    timeH:       row.time_h,
    doseLabel:   row.dose_label,
  }));
}

/** Einzelne Einnahme in Supabase speichern */
export async function pushIntake(intake: Intake): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('intakes').upsert({
    id:           intake.id,
    user_id:      user.id,
    substance_id: intake.substanceId,
    time_h:       intake.timeH,
    dose_label:   intake.doseLabel,
    date:         today(),
  });

  if (error) console.warn('pushIntake error:', error.message);
}

/** Einnahme aus Supabase löschen */
export async function deleteIntake(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('intakes').delete().eq('id', id);
  if (error) console.warn('deleteIntake error:', error.message);
}

/** Alle heutigen Intakes hochladen (nach Login) */
export async function syncAllIntakes(intakes: Intake[]): Promise<void> {
  if (!isSupabaseConfigured || intakes.length === 0) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const rows = intakes.map(i => ({
    id:           i.id,
    user_id:      user.id,
    substance_id: i.substanceId,
    time_h:       i.timeH,
    dose_label:   i.doseLabel,
    date:         today(),
  }));

  const { error } = await supabase.from('intakes').upsert(rows);
  if (error) console.warn('syncAllIntakes error:', error.message);
}
