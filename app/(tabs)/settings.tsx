import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, Alert, StatusBar, Linking,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useIntakeStore } from '../../src/store/intakeStore';
import { cancelAllReminders, requestNotificationPermissions } from '../../src/services/notifications';

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

// ── Row types ─────────────────────────────────────────────────
function RowToggle({ icon, label, sub, value, onToggle }: {
  icon: string; label: string; sub?: string; value: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={s.rowBody}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#132033', true: '#38bdf840' }}
        thumbColor={value ? '#38bdf8' : '#4a5a70'}
      />
    </View>
  );
}

function RowAction({ icon, label, sub, onPress, danger }: {
  icon: string; label: string; sub?: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={s.rowBody}>
        <Text style={[s.rowLabel, danger && s.rowDanger]}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      <Text style={s.rowArrow}>›</Text>
    </TouchableOpacity>
  );
}

function RowInfo({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={s.rowBody}>
        <Text style={s.rowLabel}>{label}</Text>
      </View>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

// ── Main Screen ───────────────────────────────────────────────
export default function SettingsScreen() {
  const { intakes, removeIntake } = useIntakeStore();
  const [notifEnabled,  setNotifEnabled]  = useState(false);
  const [peakAlerts,    setPeakAlerts]    = useState(true);
  const [dailyDigest,   setDailyDigest]   = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotifEnabled(status === 'granted');
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(scheduled.length);
    })();
  }, []);

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
      `${intakes.length} Einnahme(n) werden gelöscht. Demo-Daten werden wiederhergestellt.`,
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

  function handleFeedback() {
    Linking.openURL('mailto:chris61ds@gmail.com?subject=CurveDay%20Feedback');
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060b13" />

      <View style={s.header}>
        <Text style={s.headerTitle}>Einstellungen</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Benachrichtigungen */}
        <Section title="🔔 Benachrichtigungen">
          <RowToggle
            icon="💊" label="Einnahme-Erinnerungen"
            sub="Tägliche Reminder für deine Substanzen"
            value={notifEnabled} onToggle={handleNotifToggle}
          />
          <Divider />
          <RowToggle
            icon="📈" label="Peak-Alerts"
            sub="15 Min vor maximaler Wirkung"
            value={peakAlerts && notifEnabled}
            onToggle={v => notifEnabled && setPeakAlerts(v)}
          />
          <Divider />
          <RowToggle
            icon="🌅" label="Tages-Digest"
            sub="Morgens Übersicht der heutigen Einnahmen"
            value={dailyDigest && notifEnabled}
            onToggle={v => notifEnabled && setDailyDigest(v)}
          />
          {scheduledCount > 0 && (
            <>
              <Divider />
              <RowAction
                icon="🗑" label="Alle Erinnerungen löschen"
                sub={`${scheduledCount} aktive Erinnerung(en)`}
                onPress={handleCancelAll} danger
              />
            </>
          )}
        </Section>

        {/* Daten */}
        <Section title="💾 Daten">
          <RowInfo
            icon="📋" label="Einnahmen gespeichert"
            value={`${intakes.length}`}
          />
          <Divider />
          <RowAction
            icon="🔄" label="Demo-Daten wiederherstellen"
            sub="Aktuelle Einnahmen werden gelöscht"
            onPress={handleResetData} danger
          />
        </Section>

        {/* App-Info */}
        <Section title="ℹ️ App">
          <RowInfo icon="📦" label="Version"     value="1.0.0" />
          <Divider />
          <RowInfo icon="⚗️" label="Substanzen"  value="50" />
          <Divider />
          <RowInfo icon="🔬" label="Interaktionen" value="36" />
          <Divider />
          <RowAction
            icon="✉️" label="Feedback senden"
            sub="chris61ds@gmail.com"
            onPress={handleFeedback}
          />
        </Section>

        {/* Hinweis */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            ⚠️ CurveDay dient ausschließlich zu Informationszwecken. Die angezeigten
            Daten ersetzen keinen medizinischen Rat. Konsultiere bei Fragen zu
            Medikamenten immer einen Arzt oder Apotheker.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#060b13' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#0d1a2a' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  scroll: { padding: 16, paddingBottom: 48 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#4a5a70',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 8, marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#0d1a2a', borderRadius: 14,
    borderWidth: 1, borderColor: '#132033', overflow: 'hidden',
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  rowIcon:  { fontSize: 18, width: 28 },
  rowBody:  { flex: 1, marginLeft: 4 },
  rowLabel: { fontSize: 15, color: '#e2f0ff', fontWeight: '500' },
  rowDanger:{ color: '#f87143' },
  rowSub:   { fontSize: 12, color: '#4a5a70', marginTop: 1 },
  rowArrow: { fontSize: 20, color: '#4a5a70' },
  rowValue: { fontSize: 14, color: '#38bdf8', fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#132033', marginLeft: 48 },

  disclaimer: {
    backgroundColor: '#0d1a2a', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#132033',
  },
  disclaimerText: { fontSize: 12, color: '#4a5a70', lineHeight: 18 },
});
