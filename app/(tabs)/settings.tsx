import React, { useState, useEffect } from 'react';
import { ExportStoryModal } from '../../src/components/ExportStoryModal';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert, Linking, Image,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIntakeStore } from '../../src/store/intakeStore';
import { useOnboardingStore, UserProfile } from '../../src/store/onboardingStore';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { cancelAllReminders, requestNotificationPermissions } from '../../src/services/notifications';
import { isSupabaseConfigured } from '../../src/config/supabase';
import { router } from 'expo-router';
import { useT } from '../../src/i18n';
import {
  Region, REGION_OPTIONS, getRegionLabel,
  formatWeight, formatHeight,
  weightUnitLabel, heightUnitLabel,
  parseWeightToKg, parseHeightToCm,
  weightToDisplayValue, heightToDisplayValue,
} from '../../src/utils/regionUtils';

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

// ── Sleep Window Modal ────────────────────────────────────────
function SleepModal({ visible, sleepStart, sleepEnd, onSave, onClose }: {
  visible: boolean;
  sleepStart: number;
  sleepEnd: number;
  onSave: (start: number, end: number) => void;
  onClose: () => void;
}) {
  const { colors: C } = useThemeStore();
  const t = useT();
  const [start, setStart] = useState(sleepStart);
  const [end,   setEnd]   = useState(sleepEnd);

  function adjust(which: 'start' | 'end', delta: number) {
    const setter = which === 'start' ? setStart : setEnd;
    setter(prev => {
      let next = prev + delta * 0.5;
      if (next < 0)  next += 24;
      if (next >= 24) next -= 24;
      return Math.round(next * 2) / 2; // snap to 30 min
    });
  }

  function fmt(h: number) {
    return `${String(Math.floor(h)).padStart(2,'0')}:${h % 1 ? '30' : '00'}`;
  }

  const duration = (() => {
    const d = end < start ? end + 24 - start : end - start;
    const h = Math.floor(d);
    const m = Math.round((d - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  })();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[pe.safe, { backgroundColor: C.bg }]}>
        <View style={[pe.header, { borderBottomColor: C.border2 }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[pe.cancel, { color: C.textMuted }]}>{t.cancel}</Text>
          </TouchableOpacity>
          <Text style={[pe.title, { color: C.text }]}>{t.settingsSleepModalTitle}</Text>
          <TouchableOpacity onPress={() => onSave(start, end)}>
            <Text style={[pe.save, { color: C.accent }]}>{t.save}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
          <Text style={[sm.hint, { color: C.textMuted, backgroundColor: C.bg2, borderColor: C.border2 }]}>
            {t.settingsSleepHint}
          </Text>

          {/* Schlafbeginn */}
          <View style={[sm.pickerCard, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
            <Text style={[sm.pickerLabel, { color: C.textMuted }]}>{`🌙  ${t.settingsBedtime}`}</Text>
            <View style={sm.pickerRow}>
              <TouchableOpacity style={[sm.adjBtn, { backgroundColor: C.bg, borderColor: C.border2 }]}
                onPress={() => adjust('start', -1)}>
                <Text style={[sm.adjText, { color: C.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[sm.timeText, { color: C.accent }]}>{fmt(start)}</Text>
              <TouchableOpacity style={[sm.adjBtn, { backgroundColor: C.bg, borderColor: C.border2 }]}
                onPress={() => adjust('start', 1)}>
                <Text style={[sm.adjText, { color: C.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Aufwachzeit */}
          <View style={[sm.pickerCard, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
            <Text style={[sm.pickerLabel, { color: C.textMuted }]}>{`☀️  ${t.settingsWakeUp}`}</Text>
            <View style={sm.pickerRow}>
              <TouchableOpacity style={[sm.adjBtn, { backgroundColor: C.bg, borderColor: C.border2 }]}
                onPress={() => adjust('end', -1)}>
                <Text style={[sm.adjText, { color: C.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[sm.timeText, { color: C.accent }]}>{fmt(end)}</Text>
              <TouchableOpacity style={[sm.adjBtn, { backgroundColor: C.bg, borderColor: C.border2 }]}
                onPress={() => adjust('end', 1)}>
                <Text style={[sm.adjText, { color: C.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[sm.durationRow, { backgroundColor: `${'#818cf8'}12`, borderColor: `${'#818cf8'}30` }]}>
            <Text style={{ fontSize: 13, color: '#818cf8' }}>
              {t.settingsSleepDuration(duration, fmt(start), fmt(end))}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const sm = StyleSheet.create({
  hint:        { fontSize: 13, lineHeight: 19, padding: 14, borderRadius: 12, borderWidth: 1 },
  pickerCard:  { borderRadius: 14, padding: 18, borderWidth: 1, alignItems: 'center', gap: 14 },
  pickerLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  pickerRow:   { flexDirection: 'row', alignItems: 'center', gap: 24 },
  adjBtn:      { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  adjText:     { fontSize: 22, fontWeight: '300' },
  timeText:    { fontSize: 36, fontWeight: '700', minWidth: 90, textAlign: 'center' },
  durationRow: { borderRadius: 10, padding: 12, borderWidth: 1, alignItems: 'center' },
});

// ── Profile Edit Modal ────────────────────────────────────────
function ProfileEditModal({ visible, profile, region, onSave, onClose }: {
  visible: boolean;
  profile: UserProfile;
  region: Region;
  onSave: (p: UserProfile) => void;
  onClose: () => void;
}) {
  const { colors: C } = useThemeStore();
  const t = useT();
  const [weight, setWeight] = useState(() => weightToDisplayValue(profile.weight, region));
  const [height, setHeight] = useState(() => heightToDisplayValue(profile.height, region));
  const [age,    setAge]    = useState(profile.age?.toString() ?? '');
  const [sex,    setSex]    = useState<UserProfile['sex']>(profile.sex);

  useEffect(() => {
    setWeight(weightToDisplayValue(profile.weight, region));
    setHeight(heightToDisplayValue(profile.height, region));
    setAge(profile.age?.toString() ?? '');
    setSex(profile.sex);
  }, [profile, visible, region]);

  function save() {
    const wKg = weight ? parseWeightToKg(weight, region) : undefined;
    const hCm = height ? parseHeightToCm(height, region) : undefined;
    onSave({
      weight: wKg && wKg > 0 ? Math.round(wKg * 10) / 10 : undefined,
      height: hCm && hCm > 0 ? Math.round(hCm)           : undefined,
      age:    age ? parseInt(age, 10) : undefined,
      sex,
      region,   // preserve region
    });
    onClose();
  }

  const wUnit = weightUnitLabel(region);
  const hUnit = heightUnitLabel(region);

  const SEX_OPTIONS: { key: UserProfile['sex']; label: string }[] = [
    { key: 'male',   label: t.settingsSexMale },
    { key: 'female', label: t.settingsSexFemale },
    { key: 'other',  label: t.settingsSexOther  },
  ];

  const inputStyle = [pe.input, { backgroundColor: C.bg2, borderColor: C.border2, color: C.text }];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[pe.safe, { backgroundColor: C.bg }]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[pe.header, { borderBottomColor: C.border2 }]}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[pe.cancel, { color: C.textMuted }]}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={[pe.title, { color: C.text }]}>{t.settingsProfileModalTitle}</Text>
            <TouchableOpacity onPress={save}>
              <Text style={[pe.save, { color: C.accent }]}>{t.save}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
            <Text style={[pe.hint, { color: C.textMuted, backgroundColor: C.bg2, borderColor: C.border2 }]}>
              {t.settingsProfileHint}
            </Text>

            <View style={pe.fieldGroup}>
              <Text style={[pe.label, { color: C.textMuted }]}>Gewicht ({wUnit})</Text>
              <TextInput
                style={inputStyle} value={weight} onChangeText={setWeight}
                placeholder={region === 'US' ? 'e.g. 154' : 'z. B. 70'}
                placeholderTextColor={C.textDim}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={pe.fieldGroup}>
              <Text style={[pe.label, { color: C.textMuted }]}>
                {region === 'US' ? 'Height (in)' : 'Körpergröße (cm)'}
              </Text>
              <TextInput
                style={inputStyle} value={height} onChangeText={setHeight}
                placeholder={region === 'US' ? 'e.g. 69' : 'z. B. 175'}
                placeholderTextColor={C.textDim}
                keyboardType="number-pad"
              />
            </View>
            <View style={pe.fieldGroup}>
              <Text style={[pe.label, { color: C.textMuted }]}>
                {region === 'US' ? 'Age' : 'Alter (Jahre)'}
              </Text>
              <TextInput
                style={inputStyle} value={age} onChangeText={setAge}
                placeholder="30" placeholderTextColor={C.textDim}
                keyboardType="number-pad"
              />
            </View>

            <View style={pe.fieldGroup}>
              <Text style={[pe.label, { color: C.textMuted }]}>Biologisches Geschlecht</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {SEX_OPTIONS.map(o => (
                  <TouchableOpacity
                    key={o.key}
                    style={[pe.sexChip,
                      { backgroundColor: C.bg2, borderColor: C.border2 },
                      sex === o.key && { backgroundColor: `${C.accent}20`, borderColor: C.accent },
                    ]}
                    onPress={() => setSex(o.key)}
                  >
                    <Text style={[pe.sexChipText,
                      { color: C.textMuted },
                      sex === o.key && { color: C.accent, fontWeight: '700' },
                    ]}>
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const pe = StyleSheet.create({
  safe:        { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  cancel:      { fontSize: 15 },
  title:       { fontSize: 16, fontWeight: '700' },
  save:        { fontSize: 15, fontWeight: '700' },
  hint:        { fontSize: 12, lineHeight: 18, padding: 12, borderRadius: 10, borderWidth: 1 },
  fieldGroup:  { gap: 6 },
  label:       { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input:       { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
  sexChip:     { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 10, alignItems: 'center' },
  sexChipText: { fontSize: 13 },
});

// ── Main Screen ───────────────────────────────────────────────
export default function SettingsScreen() {
  const { intakes, removeIntake, syncFromCloud, uploadToCloud } = useIntakeStore();
  const { prefs, resetOnboarding, updateProfile, updateRegion, updateSleep } = useOnboardingStore();
  const { user, loading, syncing, hydrate: hydrateAuth, login, logout, setSyncing } = useAuthStore();
  const { colors: C, isDark, toggle: toggleTheme } = useThemeStore();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [regionModalVisible,  setRegionModalVisible]  = useState(false);
  const [sleepModalVisible,   setSleepModalVisible]   = useState(false);
  const [exportModalVisible,  setExportModalVisible]  = useState(false);

  const region: Region = (prefs.profile?.region ?? 'DE') as Region;
  const t = useT();
  const [notifEnabled,   setNotifEnabled]   = useState(false);
  const [peakAlerts,     setPeakAlerts]     = useState(true);
  const [dailyDigest,    setDailyDigest]    = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const N = await import('expo-notifications');
        const { status } = await N.getPermissionsAsync();
        setNotifEnabled(status === 'granted');
        const scheduled = await N.getAllScheduledNotificationsAsync();
        setScheduledCount(scheduled.length);
      } catch {}
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
      Alert.alert(t.settingsLoginDone, t.settingsLoginDoneMsg);
    }
  }

  async function handleLogout() {
    Alert.alert(t.settingsLogoutTitle, t.settingsLogoutMsg, [
      { text: t.cancel, style: 'cancel' },
      { text: t.settingsLogout, style: 'destructive', onPress: () => logout() },
    ]);
  }

  async function handleManualSync() {
    if (!user) return;
    setSyncing(true);
    await syncFromCloud();
    await uploadToCloud();
    setSyncing(false);
    Alert.alert(t.settingsSyncDoneTitle, t.settingsSyncDoneMsg);
  }

  async function handleNotifToggle(val: boolean) {
    if (val) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          t.settingsNotifPermTitle,
          t.settingsNotifPermMsg,
          [
            { text: t.cancel, style: 'cancel' },
            { text: t.settingsNotifPermOpen, onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      setNotifEnabled(true);
    } else {
      Alert.alert(
        t.settingsNotifDisableTitle,
        t.settingsNotifDisableMsg,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.settingsNotifDisableBtn, style: 'destructive',
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
      t.settingsResetTitle,
      t.settingsResetMsg(intakes.length),
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.settingsResetBtn, style: 'destructive',
          onPress: async () => {
            for (const i of intakes) await removeIntake(i.id);
            Alert.alert(t.settingsResetDone, t.settingsResetDoneMsg);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      <View style={[s.header, { borderBottomColor: C.border2 }]}>
        <Text style={[s.headerTitle, { color: C.text }]}>{t.settingsTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* ── Erscheinungsbild ─────────────────── */}
        <Section title={t.settingsSectionAppearance}>
          <RowToggle
            icon={isDark ? '🌙' : '☀️'}
            label={isDark ? t.settingsDarkMode : t.settingsLightMode}
            sub={t.settingsToggleTheme}
            value={isDark}
            onToggle={toggleTheme}
          />
        </Section>

        {/* ── Account & Sync ───────────────────── */}
        <Section title={t.settingsSectionAccount}>
          {!isSupabaseConfigured ? (
            <View style={s.row}>
              <Text style={s.rowIcon}>⚙️</Text>
              <View style={s.rowBody}>
                <Text style={[s.rowLabel, { color: C.warning }]}>{t.settingsSupabaseNotConfigured}</Text>
                <Text style={[s.rowSub, { color: C.textMuted }]}>{t.settingsSupabaseNotConfiguredSub}</Text>
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
                    {syncing ? t.settingsSyncing : t.settingsSynced}
                  </Text>
                </View>
              </View>
              <Divider />
              <RowAction icon="🔄" label={t.settingsSyncNow}
                sub={t.settingsSyncSub} onPress={handleManualSync} />
              <Divider />
              <RowAction icon="🚪" label={t.settingsLogout}
                sub={t.settingsLogoutSub} onPress={handleLogout} danger />
            </>
          ) : (
            <TouchableOpacity style={s.googleBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <Text style={s.googleIcon}>G</Text>
              <Text style={s.googleText}>{loading ? t.settingsConnecting : t.settingsLoginGoogle}</Text>
            </TouchableOpacity>
          )}
          {!user && isSupabaseConfigured && (
            <Text style={[s.syncHint, { color: C.textDim }]}>
              {t.settingsSyncHint}
            </Text>
          )}
        </Section>

        {/* ── Benachrichtigungen ───────────────── */}
        <Section title={t.settingsSectionNotif}>
          <RowToggle icon="💊" label={t.settingsNotifReminders}
            sub={t.settingsNotifRemindersSub}
            value={notifEnabled} onToggle={handleNotifToggle} />
          <Divider />
          <RowToggle icon="📈" label={t.settingsNotifPeak}
            sub={t.settingsNotifPeakSub}
            value={peakAlerts && notifEnabled}
            onToggle={v => notifEnabled && setPeakAlerts(v)} />
          <Divider />
          <RowToggle icon="🌅" label={t.settingsNotifDigest}
            sub={t.settingsNotifDigestSub}
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
        <Section title={t.settingsSectionData}>
          <RowInfo icon="📋" label={t.settingsIntakesCount} value={`${intakes.length}`} />
          <Divider />
          <RowAction icon="📸" label="Story exportieren"
            sub="Instagram Story mit deinen Einnahmen"
            onPress={() => setExportModalVisible(true)} />
          <Divider />
          <RowAction icon="🔄" label={t.settingsResetDemo}
            sub={t.settingsResetDemoSub}
            onPress={handleResetData} danger />
        </Section>

        {/* ── App-Info ─────────────────────────── */}
        <Section title={t.settingsSectionApp}>
          <RowInfo icon="📦" label={t.settingsVersion}        value="1.0.0" />
          <Divider />
          <RowInfo icon="⚗️" label={t.settingsSubstancesCount}     value="50" />
          <Divider />
          <RowInfo icon="🔬" label={t.settingsInteractionsCount}  value="36" />
          <Divider />
          <RowAction icon="✉️" label={t.settingsFeedback}
            sub="chris61ds@gmail.com"
            onPress={() => Linking.openURL('mailto:chris61ds@gmail.com?subject=CurveDay%20Feedback')} />
        </Section>

        {/* ── Region ───────────────────────────── */}
        <Section title={t.settingsSectionRegion}>
          <RowInfo
            icon={REGION_OPTIONS.find(r => r.id === region)?.flag ?? '🌐'}
            label={t.settingsRegionLabel}
            value={getRegionLabel(region)}
          />
          <Divider />
          <RowAction icon="✏️" label={t.settingsChangeRegion}
            sub={t.settingsChangeRegionSub}
            onPress={() => setRegionModalVisible(true)}
          />
        </Section>

        {/* ── Schlaf ───────────────────────────── */}
        {(() => {
          const ss = prefs.profile?.sleepStart ?? 23;
          const se = prefs.profile?.sleepEnd   ?? 7;
          const fmt = (h: number) => `${String(Math.floor(h)).padStart(2,'0')}:${h % 1 ? '30' : '00'}`;
          return (
            <Section title={t.settingsSectionSleep}>
              <RowInfo icon="🌙" label={t.settingsBedtime} value={`${fmt(ss)} Uhr`} />
              <Divider />
              <RowInfo icon="☀️" label={t.settingsWakeUp}    value={`${fmt(se)} Uhr`} />
              <Divider />
              <RowAction icon="✏️" label={t.settingsEditSleep}
                sub={t.settingsEditSleepSub}
                onPress={() => setSleepModalVisible(true)}
              />
            </Section>
          );
        })()}

        {/* ── Körperprofil ─────────────────────── */}
        <Section title={t.settingsSectionProfile}>
          <RowInfo icon="⚖️" label={t.settingsWeight}
            value={prefs.profile?.weight ? formatWeight(prefs.profile.weight, region) : 'nicht angegeben'} />
          <Divider />
          <RowInfo icon="📏" label={t.settingsHeight}
            value={prefs.profile?.height ? formatHeight(prefs.profile.height, region) : 'nicht angegeben'} />
          <Divider />
          <RowInfo icon="🎂" label={t.settingsAge}
            value={prefs.profile?.age ? `${prefs.profile.age} Jahre` : 'nicht angegeben'} />
          <Divider />
          <RowInfo icon="⚥"  label={t.settingsSex}   value={
            prefs.profile?.sex === 'male'   ? t.settingsSexMale :
            prefs.profile?.sex === 'female' ? t.settingsSexFemale :
            prefs.profile?.sex === 'other'  ? t.settingsSexOther   : 'nicht angegeben'
          } />
          <Divider />
          <RowAction icon="✏️" label={t.settingsEditProfile}
            sub={t.settingsEditProfileSub}
            onPress={() => setProfileModalVisible(true)}
          />
        </Section>

        {/* ── Tracking ─────────────────────────── */}
        <Section title={t.settingsSectionTracking}>
          <RowInfo icon="📋" label={t.settingsTrackingGoals} value={`${prefs.trackingGoals.length} gewählt`} />
          <Divider />
          <RowAction icon="🔁" label={t.settingsRepeatOnboarding}
            sub={t.settingsRepeatOnboardingSub}
            onPress={() => {
              Alert.alert(t.settingsOnboardingResetTitle, t.settingsOnboardingResetMsg, [
                { text: t.cancel, style: 'cancel' },
                { text: t.settingsResetBtn, onPress: async () => {
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
            {t.settingsDisclaimer}
          </Text>
        </View>

      </ScrollView>

      <ProfileEditModal
        visible={profileModalVisible}
        profile={prefs.profile ?? {}}
        region={region}
        onSave={updateProfile}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Sleep window modal */}
      {sleepModalVisible && (
        <SleepModal
          visible={sleepModalVisible}
          sleepStart={prefs.profile?.sleepStart ?? 23}
          sleepEnd={prefs.profile?.sleepEnd ?? 7}
          onSave={async (s, e) => { await updateSleep(s, e); setSleepModalVisible(false); }}
          onClose={() => setSleepModalVisible(false)}
        />
      )}

      {/* Region picker modal */}
      <Modal visible={regionModalVisible} animationType="slide" presentationStyle="pageSheet"
        onRequestClose={() => setRegionModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={[pe.header, { borderBottomColor: C.border2 }]}>
            <TouchableOpacity onPress={() => setRegionModalVisible(false)}>
              <Text style={[pe.cancel, { color: C.textMuted }]}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={[pe.title, { color: C.text }]}>{t.settingsRegionModalTitle}</Text>
            <View style={{ width: 70 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
            {REGION_OPTIONS.map(r => {
              const active = region === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    rm.row,
                    { backgroundColor: C.bg2, borderColor: active ? C.accent : C.border2 },
                    active && { backgroundColor: `${C.accent}10` },
                  ]}
                  onPress={async () => {
                    await updateRegion(r.id);
                    setRegionModalVisible(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={rm.flag}>{r.flag}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[rm.label, { color: active ? C.accent : C.text }]}>{r.label}</Text>
                    <Text style={[rm.sub,   { color: C.textMuted }]}>{r.sub}</Text>
                  </View>
                  {active && <Text style={[rm.check, { color: C.accent }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            <Text style={[rm.hint, { color: C.textDim }]}>
              {t.settingsRegionHint}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── Export Story Modal ─────────────────────────── */}
      <ExportStoryModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />

    </SafeAreaView>
  );
}

const rm = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, borderWidth: 1.5 },
  flag:  { fontSize: 30, width: 42, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  sub:   { fontSize: 12 },
  check: { fontSize: 18, fontWeight: '800', marginLeft: 8 },
  hint:  { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
});

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
