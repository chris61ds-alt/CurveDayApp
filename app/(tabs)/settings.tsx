import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert, Linking, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useIntakeStore } from '../../src/store/intakeStore';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { cancelAllReminders, requestNotificationPermissions } from '../../src/services/notifications';
import { isSupabaseConfigured } from '../../src/config/supabase';
import { router } from 'expo-router';

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors: C } = useThemeStore();
  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { color: C.textMuted }]}>{title}</Text>
      <View style={[s.sectionCard, { backgroundColor: C.bg2, borderColor: C.border2 }]}>{children}</View>
    </View>
  );
}

function RowToggle({ icon, label, sub, value, onToggle }: {
  icon: string; label: string; sub?: string; value: boolean; onToggle: (v: boolean) => void;
}) {
  const { colors: C } = useThemeStore();
  return (
    <View style={s.row}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={s.rowBody}>
        <Text style={[s.rowLabel, { color: C.text }]}>{label}</Text>
        {sub && <Text style={[s.rowSub, { color: C.textMuted }]}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.border2, true: C.accentBg }}
        thumbColor={value ? C.accent : C.textMuted}
      />
    </View>
  );
}

function RowAction({ icon, label, sub, onPress, danger }: {
  icon: string; label: string; sub?: string; onPress: () => void; danger?: boolean;
}) {
  const { colors: C } = useThemeStore();
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={s.rowBody}>
        <Text style={[s.rowLabel, { color: danger ? C.danger : C.text }]}>{label}</Text>
        {sub && <Text style={[s.rowSub, { color: C.textMuted }]}>{sub}</Text>}
      </View>
      <Text style={[s.rowArrow, { color: C.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

function RowInfo({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors: C } = useThemeStore();
  return (
    <View style={s.row}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={s.rowBody}>
        <Text style={[s.rowLabel, { color: C.text }]}>{label}</Text>
      </View>
      <Text style={[s.rowValue, { color: C.accent }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  const { colors: C } = useThemeStore();
  return <View style={[s.divider, { backgroundColor: C.border2 }]} />;
}

// ── Main Screen ───────────────────────────────────────────────
export default function SettingsScreen() {
  const { intakes, removeIntake, syncFromCloud, uploadToCloud } = useIntakeStore();
  const { prefs, resetOnboarding } = useOnboardingStore();
  const { user, loading, syncing, hydrate: hydrateAuth, login, logout, setSyncing } = useAuthStore();
  const { colors: C, isDark, toggle: toggleTheme } = useThemeStore();
  const [notifEnabled,   setNotifEnabled]   = useState(false);
  const [peakAlerts,     setPeakAlerts]     = useState(true);
  const [dailyDigest,    setDailyDigest]    = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotifEnabled(status === 'granted');
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(scheduled.length);
      await hydrateAuth();
    })();
  }, []);

  async function handleLogin() {
    const error = await login();
    if (error && error !== 'Abgebrochen') {
      Alert.alert('Login fehlgeschlagen', error);
    } else if (!error) {
      setSyncing(true);
      await syncFromCloud();
      await uploadToCloud();
      setSyncing(false);
      Alert.alert('✅ Eingeloggt', 'Deine Daten wurden synchronisiert.');
    }
  }

  async function handleLogout() {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden? Deine lokalen Daten bleiben erhalten.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: () => logout() },
    ]);
  }

  async function handleManualSync() {
    if (!user) return;
    setSyncing(true);
    await syncFromCloud();
    await uploadToCloud();
    setSyncing(false);
    Alert.alert('✅ Sync abgeschlossen', 'Daten wurden mit der Cloud synchronisiert.');
  }

  async function handleNotifToggle(val: boolean) {
    if (val) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Berechtigung erforderlich',
          'Öffne die Einstellungen und aktiviere Benachrichtigungen für CurveDay.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Einstellungen öffnen', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      setNotifEnabled(true);
    } else {
      Alert.alert(
        'Benachrichtigungen deaktivieren',
        'Alle geplanten Erinnerungen werden abgebrochen.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Deaktivieren', style: 'destructive',
            onPress: async () => {
              await cancelAllReminders();
              setNotifEnabled(false);
              setScheduledCount(0);
            },
          },
        ]
      );
    }
  }

  async function handleCancelAll() {
    Alert.alert(
      'Alle Erinnerungen löschen',
      `${scheduledCount} geplante Benachrichtigung(en) werden abgebrochen.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Alle löschen', style: 'destructive',
          onPress: async () => {
            await cancelAllReminders();
            setScheduledCount(0);
            Alert.alert('Erledigt', 'Alle Erinnerungen wurden gelöscht.');
          },
        },
      ]
    );
  }

  function handleResetData() {
    Alert.alert(
      'Alle Einnahmen zurücksetzen?',
      `${intakes.length} Einnahme(n) werden gelöscht.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen', style: 'destructive',
          onPress: async () => {
            for (const i of intakes) await removeIntake(i.id);
            Alert.alert('Zurückgesetzt', 'Alle Einnahmen wurden gelöscht.');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      <View style={[s.header, { borderBottomColor: C.border2 }]}>
        <Text style={[s.headerTitle, { color: C.text }]}>Einstellungen</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* ── Erscheinungsbild ─────────────────── */}
        <Section title="🎨 Erscheinungsbild">
          <RowToggle
            icon={isDark ? '🌙' : '☀️'}
            label={isDark ? 'Dunkler Modus' : 'Heller Modus'}
            sub="Zwischen Hell und Dunkel wechseln"
            value={isDark}
            onToggle={toggleTheme}
          />
        </Section>

        {/* ── Account & Sync ───────────────────── */}
        <Section title="👤 Account & Cloud Sync">
          {!isSupabaseConfigured ? (
            <View style={s.row}>
              <Text style={s.rowIcon}>⚙️</Text>
              <View style={s.rowBody}>
                <Text style={[s.rowLabel, { color: C.warning }]}>Supabase nicht konfiguriert</Text>
                <Text style={[s.rowSub, { color: C.textMuted }]}>Öffne src/config/supabase.ts und trage URL + Key ein</Text>
              </View>
            </View>
          ) : user ? (
            <>
              <View style={[s.row, s.profileRow]}>
                {user.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
                ) : (
                  <View style={[s.avatarFallback, { backgroundColor: C.accentBg }]}>
                    <Text style={[s.avatarText, { color: C.accent }]}>{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={s.rowBody}>
                  <Text style={[s.rowLabel, { color: C.text }]}>{user.name}</Text>
                  <Text style={[s.rowSub, { color: C.textMuted }]}>{user.email}</Text>
                </View>
                <View style={[s.syncBadge, { backgroundColor: syncing ? C.warningBg : C.successBg }]}>
                  <Text style={[s.syncBadgeText, { color: syncing ? C.warning : C.success }]}>
                    {syncing ? 'Synct…' : 'Sync ✓'}
                  </Text>
                </View>
              </View>
              <Divider />
              <RowAction icon="🔄" label="Jetzt synchronisieren"
                sub="Daten zwischen Gerät und Cloud abgleichen" onPress={handleManualSync} />
              <Divider />
              <RowAction icon="🚪" label="Abmelden"
                sub="Lokale Daten bleiben erhalten" onPress={handleLogout} danger />
            </>
          ) : (
            <TouchableOpacity style={s.googleBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <Text style={s.googleIcon}>G</Text>
              <Text style={s.googleText}>{loading ? 'Verbinde…' : 'Mit Google anmelden'}</Text>
            </TouchableOpacity>
          )}
          {!user && isSupabaseConfigured && (
            <Text style={[s.syncHint, { color: C.textDim }]}>
              Melde dich an um deine Einnahmen geräteübergreifend zu synchronisieren.
            </Text>
          )}
        </Section>

        {/* ── Benachrichtigungen ───────────────── */}
        <Section title="🔔 Benachrichtigungen">
          <RowToggle icon="💊" label="Einnahme-Erinnerungen"
            sub="Tägliche Reminder für deine Substanzen"
            value={notifEnabled} onToggle={handleNotifToggle} />
          <Divider />
          <RowToggle icon="📈" label="Peak-Alerts"
            sub="15 Min vor maximaler Wirkung"
            value={peakAlerts && notifEnabled}
            onToggle={v => notifEnabled && setPeakAlerts(v)} />
          <Divider />
          <RowToggle icon="🌅" label="Tages-Digest"
            sub="Morgens Übersicht der heutigen Einnahmen"
            value={dailyDigest && notifEnabled}
            onToggle={v => notifEnabled && setDailyDigest(v)} />
          {scheduledCount > 0 && (
            <>
              <Divider />
              <RowAction icon="🗑" label="Alle Erinnerungen löschen"
                sub={`${scheduledCount} aktive Erinnerung(en)`}
                onPress={handleCancelAll} danger />
            </>
          )}
        </Section>

        {/* ── Daten ────────────────────────────── */}
        <Section title="💾 Daten">
          <RowInfo icon="📋" label="Einnahmen gespeichert" value={`${intakes.length}`} />
          <Divider />
          <RowAction icon="🔄" label="Demo-Daten wiederherstellen"
            sub="Aktuelle Einnahmen werden gelöscht"
            onPress={handleResetData} danger />
        </Section>

        {/* ── App-Info ─────────────────────────── */}
        <Section title="ℹ️ App">
          <RowInfo icon="📦" label="Version"        value="1.0.0" />
          <Divider />
          <RowInfo icon="⚗️" label="Substanzen"     value="50" />
          <Divider />
          <RowInfo icon="🔬" label="Interaktionen"  value="36" />
          <Divider />
          <RowAction icon="✉️" label="Feedback senden"
            sub="chris61ds@gmail.com"
            onPress={() => Linking.openURL('mailto:chris61ds@gmail.com?subject=CurveDay%20Feedback')} />
        </Section>

        {/* ── Profil ───────────────────────────── */}
        <Section title="🎯 Profil">
          <RowInfo icon="📋" label="Tracking-Bereiche" value={`${prefs.trackingGoals.length} gewählt`} />
          <Divider />
          <RowAction icon="🔁" label="Onboarding wiederholen"
            sub="Bereiche & Disclaimer neu durchlaufen"
            onPress={() => {
              Alert.alert('Onboarding zurücksetzen?', 'Du wirst durch den Einrichtungsassistenten geführt.', [
                { text: 'Abbrechen', style: 'cancel' },
                { text: 'Zurücksetzen', onPress: async () => {
                    await resetOnboarding();
                    router.replace('/onboarding');
                  }},
              ]);
            }}
          />
        </Section>

        {/* Disclaimer */}
        <View style={[s.disclaimer, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
          <Text style={[s.disclaimerText, { color: C.textMuted }]}>
            ⚠️ CurveDay dient ausschließlich zu Informationszwecken. Die angezeigten
            Daten ersetzen keinen medizinischen Rat. Konsultiere bei Fragen zu
            Medikamenten immer einen Arzt oder Apotheker.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:      { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  scroll:      { padding: 16, paddingBottom: 48 },

  section:      { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 8, marginLeft: 4,
  },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },

  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  rowIcon:  { fontSize: 18, width: 28 },
  rowBody:  { flex: 1, marginLeft: 4 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub:   { fontSize: 12, marginTop: 1 },
  rowArrow: { fontSize: 20 },
  rowValue: { fontSize: 14, fontWeight: '600' },

  divider: { height: 1, marginLeft: 48 },

  profileRow:    { alignItems: 'flex-start', paddingVertical: 14 },
  avatar:        { width: 44, height: 44, borderRadius: 22 },
  avatarFallback:{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 20, fontWeight: '700' },
  syncBadge:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  syncBadgeText: { fontSize: 11, fontWeight: '700' },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 20, gap: 10, margin: 4,
  },
  googleIcon: { fontSize: 16, fontWeight: '900', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600', color: '#333' },
  syncHint:   { fontSize: 12, textAlign: 'center', paddingHorizontal: 12, paddingBottom: 12, paddingTop: 4 },

  disclaimer:     { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 8 },
  disclaimerText: { fontSize: 12, lineHeight: 18 },
});
