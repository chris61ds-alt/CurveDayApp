/**
 * Supabase Konfiguration
 *
 * Setup-Anleitung:
 * 1. Gehe zu https://supabase.com → "New project"
 * 2. Project Settings → API → kopiere "Project URL" und "anon key"
 * 3. Ersetze die Werte unten
 * 4. Führe das SQL-Schema in Supabase → SQL Editor aus (siehe /supabase/schema.sql)
 * 5. Authentication → Providers → Google → aktivieren + Client ID/Secret eintragen
 */

export const SUPABASE_URL  = 'https://firrdhtfkhbiyqkvbegd.supabase.co';
export const SUPABASE_ANON = 'sb_publishable_B_0uwPppAjZvuar2oWeGEA_UXAWUgSu';

export const isSupabaseConfigured =
  !SUPABASE_URL.includes('DEIN-PROJEKT') &&
  !SUPABASE_ANON.includes('DEIN-ANON-KEY');
