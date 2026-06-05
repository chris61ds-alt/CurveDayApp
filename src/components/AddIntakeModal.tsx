import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Modal, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SUBSTANCES, CATEGORIES, getActiveInteractions } from '../data/substanceDB';
import { useIntakeStore } from '../store/intakeStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { scheduleDailyReminder } from '../services/notifications';
import { fmtHour } from '../utils/pkHelpers';
import { SubIcon } from './SubIcon';
import { getSubstanceName } from '../utils/regionUtils';
import type { Region } from '../utils/regionUtils';
import { useT } from '../i18n';
import { useThemeStore } from '../store/themeStore';
import type { ThemeColors } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialSubstance?: any; // wenn gesetzt: Suche überspringen, direkt zu Konfigurieren
}

type Step = 'search' | 'configure';

export function AddIntakeModal({ visible, onClose, initialSubstance }: Props) {
  const { intakes, addIntake } = useIntakeStore();
  const { prefs } = useOnboardingStore();
  const { colors: C } = useThemeStore();
  const region: Region = (prefs.profile?.region ?? 'DE') as Region;
  const t = useT();
  const s = useMemo(() => makeStyles(C), [C]);

  const [step, setStep]         = useState<Step>('search');
  const [query, setQuery]       = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [hour, setHour]         = useState(() => new Date().getHours());
  const [minute, setMinute]     = useState(() => Math.round(new Date().getMinutes() / 15) * 15 % 60);
  const [dose, setDose]         = useState('');
  const [withReminder, setWithReminder] = useState(true);

  // Wenn modal geöffnet wird mit vorausgewählter Substanz → Suche überspringen
  React.useEffect(() => {
    if (visible) {
      if (initialSubstance) {
        setSelected(initialSubstance);
        setDose(initialSubstance.defaultDose ? `${initialSubstance.defaultDose} ${initialSubstance.doseUnit}` : '');
        setStep('configure');
      } else {
        setStep('search');
        setSelected(null);
        setDose('');
      }
      setHour(new Date().getHours());
      setMinute(Math.round(new Date().getMinutes() / 15) * 15 % 60);
    }
  }, [visible, initialSubstance]);

  // Filter substances by region + search
  const regionalSubstances = useMemo(() => {
    return SUBSTANCES.filter((s: any) => {
      // If no markets field, substance is universal
      if (!s.markets) return true;
      return s.markets.includes(region);
    });
  }, [region]);

  // Favorites: most-used substances derived from intake history
  const favorites = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of intakes) counts[i.substanceId] = (counts[i.substanceId] ?? 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => regionalSubstances.find((s: any) => s.id === id))
      .filter(Boolean);
  }, [intakes, regionalSubstances]);

  // Substanz-Suche (name + nameUS + brandNames) mit Kategorie-Filter
  const results = useMemo(() => {
    const pool = catFilter
      ? regionalSubstances.filter((s: any) => s.category === catFilter)
      : regionalSubstances;
    if (!query.trim()) return pool.slice(0, 25);
    const q = query.toLowerCase();
    return pool.filter(
      (s: any) =>
        s.name.toLowerCase().includes(q) ||
        s.nameUS?.toLowerCase().includes(q) ||
        s.brandNames?.some((b: string) => b.toLowerCase().includes(q)) ||
        s.effectLabel?.toLowerCase().includes(q),
    ).slice(0, 30);
  }, [query, catFilter, regionalSubstances]);

  // Warnung wenn kritische Wechselwirkung mit aktiven Substanzen
  const criticalWarnings = useMemo(() => {
    if (!selected) return [];
    const activeIds = intakes.map(i => i.substanceId);
    const ixs = getActiveInteractions([...activeIds, selected.id]);
    return ixs.filter((ix: any) => ix.severity === 'critical' && (ix.a === selected.id || ix.b === selected.id));
  }, [selected, intakes]);

  // ── Dosisplausibilität ─────────────────────────────────────
  // Extrahiere Zahlenwert aus Eingabe wie "400 mg", "400mg", "1,5 g"
  function parseDoseValue(str: string): number | null {
    const match = str.replace(',', '.').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  }

  const doseWarning = useMemo<{ level: 'info' | 'warn' | 'danger'; text: string } | null>(() => {
    if (!selected || !dose.trim()) return null;
    const val = parseDoseValue(dose);
    if (val === null || val <= 0) return { level: 'warn', text: t.addDoseInvalid };

    const common: number[] = selected.commonDoses ?? [];
    const maxCommon   = common.length ? Math.max(...common) : null;
    const minCommon   = common.length ? Math.min(...common) : null;
    const unit        = selected.doseUnit as string;

    // Dangerous high dose: more than 2× the highest standard dose
    if (maxCommon && val > maxCommon * 2) {
      return { level: 'danger', text: t.addDoseTooHigh(maxCommon, unit) };
    }
    // Elevated dose: exceeds highest standard dose
    if (maxCommon && val > maxCommon) {
      return { level: 'warn', text: t.addDoseHigher(maxCommon, unit) };
    }
    // Very low dose (< half the minimum dose) — possible typo
    if (minCommon && val < minCommon / 2) {
      return { level: 'info', text: t.addDoseLow(minCommon, unit) };
    }
    return null;
  }, [dose, selected]);

  // Häufigkeit heute: Wie viele Einnahmen dieser Substanz gibt es heute schon?
  const todayCount = useMemo(() => {
    if (!selected) return 0;
    const nowH = new Date().getHours() + new Date().getMinutes() / 60;
    const dayStart = nowH; // heutige Einnahmen liegen zwischen 0..nowH + bereits geplante (gröber: alle)
    return intakes.filter(i => i.substanceId === selected.id).length;
  }, [selected, intakes]);

  const maxPerDay: number | null = selected?.timing?.maxPerDay ?? null;
  const dailyCountWarning = maxPerDay !== null && todayCount >= maxPerDay;

  const timeH = hour + minute / 60;

  function selectSubstance(sub: any) {
    setSelected(sub);
    setDose(sub.defaultDose ? `${sub.defaultDose} ${sub.doseUnit}` : '');
    setStep('configure');
  }

  async function confirm() {
    if (!selected) return;

    // Critical interaction: confirm first
    if (criticalWarnings.length > 0) {
      Alert.alert(
        t.addCriticalTitle,
        criticalWarnings.map((ix: any) => ix.note).join('\n\n'),
        [
          { text: t.cancel, style: 'cancel' },
          { text: t.addCriticalConfirm, style: 'destructive', onPress: doAdd },
        ],
      );
    } else {
      doAdd();
    }
  }

  async function doAdd() {
    if (!selected) return;
    const doseLabel = dose.trim() || `${selected.defaultDose} ${selected.doseUnit}`;

    // ISO-Timestamp für die gewählte Uhrzeit (heute)
    const takenAtDate = new Date();
    takenAtDate.setHours(hour, minute, 0, 0);
    const takenAt = takenAtDate.toISOString();

    await addIntake({ substanceId: selected.id, timeH, doseLabel, takenAt });

    if (withReminder) {
      await scheduleDailyReminder(selected.id, selected.name, hour, minute).catch(() => {});
    }

    handleClose();
  }

  function handleClose() {
    setStep('search');
    setQuery('');
    setCatFilter(null);
    setSelected(null);
    setDose('');
    onClose();
  }

  function adjustMinute(dir: 1 | -1) {
    setMinute(m => {
      const next = m + dir * 30;
      if (next < 0) { setHour(h => (h - 1 + 24) % 24); return 30; }
      if (next >= 60) { setHour(h => (h + 1) % 24); return 0; }
      return next;
    });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {/* Header */}
          <View style={s.header}>
            {step === 'configure' ? (
              <TouchableOpacity onPress={() => setStep('search')} style={s.backBtn}>
                <Text style={s.backText}>‹ {t.back}</Text>
              </TouchableOpacity>
            ) : (
              /* Invisible spacer — same width as closeBtn — keeps title centred */
              <View style={s.closeBtn} pointerEvents="none" />
            )}
            <Text style={s.headerTitle}>
              {step === 'search' ? t.addTitle : getSubstanceName(selected, region)}
            </Text>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ─── STEP 1: Suche ─── */}
          {step === 'search' && (
            <>
              {/* Search bar */}
              <View style={s.searchBox}>
                <Text style={s.searchIcon}>🔍</Text>
                <TextInput
                  style={s.searchInput}
                  placeholder={t.addSearchPlaceholder}
                  placeholderTextColor={C.textDim}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  autoCorrect={false}
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')}>
                    <Text style={s.clearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Category chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.catScroll}
                contentContainerStyle={s.catContent}
              >
                <TouchableOpacity
                  style={[s.catChip, !catFilter && s.catChipActive]}
                  onPress={() => setCatFilter(null)}
                >
                  <Text style={[s.catChipText, !catFilter && s.catChipTextActive]}>Alle</Text>
                </TouchableOpacity>
                {(CATEGORIES as any[]).map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[s.catChip, catFilter === cat.id && { backgroundColor: `${cat.color}20`, borderColor: cat.color }]}
                    onPress={() => setCatFilter(catFilter === cat.id ? null : cat.id)}
                  >
                    <Text style={[s.catChipText, catFilter === cat.id && { color: cat.color, fontWeight: '700' }]}>
                      {cat.icon} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Favorites strip (only when no search query and no cat filter) */}
              {!query.trim() && !catFilter && favorites.length > 0 && (
                <View style={s.favSection}>
                  <Text style={s.favTitle}>⭐ Zuletzt verwendet</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.favRow}>
                    {favorites.map((item: any) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[s.favChip, { borderColor: `${item.color}40` }]}
                        onPress={() => selectSubstance(item)}
                        activeOpacity={0.7}
                      >
                        <SubIcon substance={item} size={26} />
                        <Text style={s.favChipName} numberOfLines={1}>{getSubstanceName(item, region)}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Results list */}
              <FlatList
                data={results}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity style={s.resultRow} onPress={() => selectSubstance(item)} activeOpacity={0.7}>
                    <SubIcon substance={item} size={36} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={s.resultName}>{getSubstanceName(item, region)}</Text>
                        {item.controlled && (
                          <View style={s.btmBadge}><Text style={s.btmText}>BtM</Text></View>
                        )}
                        {item.prescription && !item.controlled && (
                          <View style={[s.btmBadge, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b30' }]}>
                            <Text style={[s.btmText, { color: '#f59e0b' }]}>Rx</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.resultMeta}>
                        {item.effectLabel} · {item.defaultDose} {item.doseUnit}
                      </Text>
                      {item.brandNames?.length > 0 && (
                        <Text style={s.resultBrands} numberOfLines={1}>
                          {item.brandNames.slice(0, 3).join(', ')}
                        </Text>
                      )}
                    </View>
                    <Text style={[s.resultArrow, { color: item.color }]}>›</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={s.separator} />}
              />
            </>
          )}

          {/* ─── STEP 2: Konfigurieren ─── */}
          {step === 'configure' && selected && (
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 14 }}>

              {/* Substanz-Info */}
              <View style={s.configCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <SubIcon substance={selected} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.configName}>{getSubstanceName(selected, region)}</Text>
                    <Text style={s.configMeta}>{selected.effectLabel}</Text>
                  </View>
                </View>
                {selected.pk?.foodNote && (
                  <View style={s.foodNote}>
                    <Text style={s.foodNoteText}>🍽 {selected.pk.foodNote}</Text>
                  </View>
                )}
              </View>

              {/* BtM / Rx Warning */}
              {(selected.controlled || selected.prescription) && (
                <View style={selected.controlled ? s.btmWarning : s.rxWarning}>
                  <Text style={s.rxWarningTitle}>
                    {selected.controlled ? t.addBtmWarningTitle : t.addRxWarningTitle}
                  </Text>
                  <Text style={s.rxWarningText}>
                    {selected.controlled ? t.addBtmWarningText : t.addRxWarningText}
                  </Text>
                </View>
              )}

              {/* Critical Warning */}
              {criticalWarnings.length > 0 && (
                <View style={s.criticalBox}>
                  <Text style={s.criticalTitle}>{t.addCriticalTitle}</Text>
                  {criticalWarnings.map((ix: any, i: number) => (
                    <Text key={i} style={s.criticalText}>{ix.note}</Text>
                  ))}
                </View>
              )}

              {/* Dose */}
              <View style={s.configSection}>
                <Text style={s.configLabel}>{t.addDose}</Text>
                <View style={s.doseRow}>
                  {selected.commonDoses?.map((d: number) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        s.doseChip,
                        dose === `${d} ${selected.doseUnit}` && { backgroundColor: `${selected.color}25`, borderColor: selected.color },
                      ]}
                      onPress={() => setDose(`${d} ${selected.doseUnit}`)}
                    >
                      <Text style={[
                        s.doseChipText,
                        dose === `${d} ${selected.doseUnit}` && { color: selected.color },
                      ]}>
                        {d} {selected.doseUnit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[s.doseInput,
                    doseWarning?.level === 'danger' && { borderColor: '#ef444450' },
                    doseWarning?.level === 'warn'   && { borderColor: '#f59e0b50' },
                  ]}
                  value={dose}
                  onChangeText={setDose}
                  placeholder={`z.B. ${selected.defaultDose} ${selected.doseUnit}`}
                  placeholderTextColor={C.textDim}
                  keyboardType="default"
                />

                {/* Dosiswarnung */}
                {doseWarning && (
                  <View style={[
                    s.doseWarnBox,
                    doseWarning.level === 'danger' && { backgroundColor: '#ef444412', borderColor: '#ef444440' },
                    doseWarning.level === 'warn'   && { backgroundColor: '#f59e0b10', borderColor: '#f59e0b35' },
                    doseWarning.level === 'info'   && { backgroundColor: '#38bdf80a', borderColor: '#38bdf825' },
                  ]}>
                    <Text style={[
                      s.doseWarnText,
                      doseWarning.level === 'danger' && { color: '#f87171' },
                      doseWarning.level === 'warn'   && { color: '#fcd34d' },
                      doseWarning.level === 'info'   && { color: '#7dd3fc' },
                    ]}>
                      {doseWarning.level === 'danger' ? '⛔ ' : doseWarning.level === 'warn' ? '⚠️ ' : 'ℹ️ '}
                      {doseWarning.text}
                    </Text>
                  </View>
                )}
              </View>

              {/* Time */}
              <View style={s.configSection}>
                <Text style={s.configLabel}>{t.addTime}</Text>
                <View style={s.timeRow}>
                  <TouchableOpacity style={s.timeArrow} onPress={() => setHour(h => (h - 1 + 24) % 24)}>
                    <Text style={s.timeArrowText}>‹</Text>
                  </TouchableOpacity>
                  <View style={s.timeDisplay}>
                    <Text style={s.timeText}>{fmtHour(timeH)}</Text>
                  </View>
                  <TouchableOpacity style={s.timeArrow} onPress={() => setHour(h => (h + 1) % 24)}>
                    <Text style={s.timeArrowText}>›</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 8 }}>
                  {[0, 15, 30, 45].map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[s.minChip, minute === m && { backgroundColor: '#38bdf825', borderColor: '#38bdf8' }]}
                      onPress={() => setMinute(m)}
                    >
                      <Text style={[s.minChipText, minute === m && { color: '#38bdf8' }]}>:{String(m).padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* PK Hint */}
              <View style={s.pkHint}>
                <Text style={s.pkHintLabel}>{t.addPeakLabel}</Text>
                <Text style={s.pkHintValue}>
                  {fmtHour(timeH + (selected.pk?.tmaxHours ?? 1))}{t.timeUnit}
                </Text>
                <Text style={s.pkHintLabel}>{t.addDurationLabel}</Text>
                <Text style={s.pkHintValue}>{selected.pk?.durationHours ?? '?'} {t.addHoursUnit}</Text>
              </View>

              {/* Reminder */}
              <TouchableOpacity
                style={[s.reminderRow, withReminder && { borderColor: '#38bdf850' }]}
                onPress={() => setWithReminder(r => !r)}
                activeOpacity={0.8}
              >
                <View style={[s.checkbox, withReminder && { backgroundColor: '#38bdf8', borderColor: '#38bdf8' }]}>
                  {withReminder && <Text style={{ fontSize: 10, color: '#fff' }}>✓</Text>}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.reminderTitle}>{t.addReminder}</Text>
                  <Text style={s.reminderSub}>{t.addReminderSub}</Text>
                </View>
                <Text style={{ fontSize: 16 }}>🔔</Text>
              </TouchableOpacity>

              {/* Warnings */}
              {selected.warnings?.length > 0 && (
                <View style={s.warningsBox}>
                  <Text style={s.warningsTitle}>{t.addWarningsTitle}</Text>
                  {selected.warnings.map((w: string, i: number) => (
                    <Text key={i} style={s.warningItem}>• {w}</Text>
                  ))}
                </View>
              )}

              {/* Daily frequency warning */}
              {dailyCountWarning && (
                <View style={s.dailyWarnBox}>
                  <Text style={s.dailyWarnText}>
                    {t.addDailyLimitText(maxPerDay!)}
                  </Text>
                </View>
              )}

              {/* Confirm */}
              <TouchableOpacity style={[s.confirmBtn, { backgroundColor: selected.color }]} onPress={confirm} activeOpacity={0.85}>
                <Text style={s.confirmText}>{t.addConfirm}</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function makeStyles(C: ThemeColors) { return StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  backBtn:     { marginRight: 8 },
  backText:    { fontSize: 15, color: C.accent, fontWeight: '600' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text, textAlign: 'center' },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  closeText:   { fontSize: 14, color: C.textDim },

  // ── Search ───────────────────────────────────────────────
  searchBox:   { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchIcon:  { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, height: 50, color: C.text, fontSize: 15 },
  clearText:   { fontSize: 15, color: C.textDim, padding: 6 },

  // ── Category chips ───────────────────────────────────────
  catScroll:       { flexGrow: 0 },
  catContent:      { paddingHorizontal: 12, paddingVertical: 8, gap: 7, flexDirection: 'row' },
  catChip:         { backgroundColor: C.surface, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  catChipActive:   { backgroundColor: C.accentBg, borderColor: C.accent },
  catChipText:     { fontSize: 13, color: C.textSub },
  catChipTextActive: { color: C.accent, fontWeight: '700' },

  // ── Favorites ────────────────────────────────────────────
  favSection:  { paddingHorizontal: 12, paddingBottom: 6 },
  favTitle:    { fontSize: 11, color: C.textDim, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  favRow:      { gap: 8, flexDirection: 'row' },
  favChip:     { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, padding: 10, alignItems: 'center', gap: 6, minWidth: 76, maxWidth: 90 },
  favChipName: { fontSize: 11, color: C.textSub, textAlign: 'center', fontWeight: '500' },

  // ── Results ──────────────────────────────────────────────
  resultRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  resultName:   { fontSize: 15, fontWeight: '600', color: C.text, letterSpacing: -0.1 },
  resultMeta:   { fontSize: 12, color: C.textDim, marginTop: 3 },
  resultBrands: { fontSize: 12, color: C.textDim, marginTop: 2 },
  resultArrow:  { fontSize: 20, marginLeft: 8 },
  separator:    { height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginLeft: 70 },

  btmBadge:  { backgroundColor: '#ef444415', borderRadius: 6, borderWidth: 1, borderColor: '#ef444430', paddingHorizontal: 7, paddingVertical: 2 },
  btmText:   { fontSize: 11, color: '#f87171', fontWeight: '700' },

  // ── Configure step ───────────────────────────────────────
  configCard:    { backgroundColor: C.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  configName:    { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  configMeta:    { fontSize: 13, color: C.textDim, marginTop: 4 },
  foodNote:      { marginTop: 12, backgroundColor: `${C.warning}12`, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: `${C.warning}25` },
  foodNoteText:  { fontSize: 13, color: C.warning, lineHeight: 19 },

  criticalBox:   { backgroundColor: C.isDark ? '#ef444412' : '#fff1f2', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.isDark ? '#ef444435' : '#ef444460' },
  criticalTitle: { fontSize: 14, fontWeight: '700', color: C.isDark ? '#f87171' : '#b91c1c', marginBottom: 6 },
  criticalText:  { fontSize: 13, color: C.isDark ? '#fca5a5' : '#991b1b', lineHeight: 20 },

  configSection: { backgroundColor: C.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border },
  configLabel:   { fontSize: 11, color: C.textDim, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },

  doseRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  doseChip:     { backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.border },
  doseChipText: { fontSize: 13, color: C.textSub, fontWeight: '600' },
  doseInput:    { backgroundColor: C.bg, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 15 },

  timeRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  timeArrow:    { width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  timeArrowText:{ fontSize: 22, color: C.accent },
  timeDisplay:  { backgroundColor: C.bg, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12, borderWidth: 1, borderColor: C.border },
  timeText:     { fontSize: 34, fontWeight: '800', color: C.text, letterSpacing: 2 },

  minChip:     { backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  minChipText: { fontSize: 13, color: C.textSub, fontWeight: '500' },

  pkHint:      { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  pkHintLabel: { fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5 },
  pkHintValue: { fontSize: 14, fontWeight: '800', color: C.accent, letterSpacing: -0.3 },

  reminderRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  checkbox:      { width: 26, height: 26, borderRadius: 9, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  reminderTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  reminderSub:   { fontSize: 12, color: C.textDim, marginTop: 2 },

  btmWarning:    { backgroundColor: '#ef444412', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#ef444435' },
  rxWarning:     { backgroundColor: C.isDark ? '#f59e0b10' : '#fffbeb', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.isDark ? '#f59e0b30' : '#f59e0b50' },
  rxWarningTitle:{ fontSize: 13, fontWeight: '700', color: C.isDark ? '#fcd34d' : '#92400e', marginBottom: 6 },
  rxWarningText: { fontSize: 12, color: C.isDark ? '#fde68a' : '#78350f', lineHeight: 19 },

  doseWarnBox:   { marginTop: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  doseWarnText:  { fontSize: 13, lineHeight: 18 },

  dailyWarnBox:  { backgroundColor: C.isDark ? '#f59e0b10' : '#fffbeb', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.isDark ? '#f59e0b35' : '#f59e0b60', marginBottom: 4 },
  dailyWarnText: { fontSize: 13, color: C.isDark ? '#fcd34d' : '#92400e', lineHeight: 19 },

  warningsBox:   { backgroundColor: C.isDark ? '#f59e0b10' : '#fffbeb', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.isDark ? '#f59e0b25' : '#f59e0b50' },
  warningsTitle: { fontSize: 11, fontWeight: '700', color: C.isDark ? '#fcd34d' : '#92400e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  warningItem:   { fontSize: 13, color: C.isDark ? '#fde68a' : '#78350f', lineHeight: 20 },

  confirmBtn:  { borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  confirmText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
}); }
