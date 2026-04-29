import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from '../config/supabase';

WebBrowser.maybeCompleteAuthSession();

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

function parseUser(session: any): AuthUser | null {
  const user = session?.user;
  if (!user) return null;
  return {
    id:        user.id,
    email:     user.email ?? '',
    name:      user.user_metadata?.full_name ?? user.email ?? 'Nutzer',
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };
}

export async function signInWithGoogle(): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { user: null, error: 'Supabase nicht konfiguriert. Bitte zuerst setup durchführen.' };
  }

  try {
    const redirectTo = makeRedirectUri({ scheme: 'curveday', path: 'auth/callback' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      return { user: null, error: error?.message ?? 'OAuth-URL konnte nicht erstellt werden' };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== 'success') {
      return { user: null, error: result.type === 'cancel' ? 'Abgebrochen' : 'Login fehlgeschlagen' };
    }

    // URL-Parameter auslesen und Session setzen
    const url   = new URL(result.url);
    const code  = url.searchParams.get('code');
    const error_param = url.searchParams.get('error');

    if (error_param) return { user: null, error: error_param };

    if (code) {
      const { data: session, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) return { user: null, error: sessionError.message };
      return { user: parseUser(session.session), error: null };
    }

    // Fallback: aktuelle Session abrufen
    const { data: { session } } = await supabase.auth.getSession();
    return { user: parseUser(session), error: session ? null : 'Keine Session' };

  } catch (e: any) {
    return { user: null, error: e?.message ?? 'Unbekannter Fehler' };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return parseUser(session);
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(parseUser(session));
  });
}
