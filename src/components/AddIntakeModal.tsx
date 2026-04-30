import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Modal, StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { SUBSTANCES, getActiveInteractions } from '../data/substanceDB';
import { useIntakeStore } from '../store/intakeStore';
import { scheduleDailyReminder } from '../services/notifications';
import { fmtHour } from '../utils/pkHelpers';
import { SubIcon } from './SubIcon';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Step = 'search' | 'configure';

export function AddIntakeModal({ visible, onClose }: Props) {
  const { intakes, addIntake } = useIntakeStore();

  const [step, setStep]         = useState<Step>('search');
  const [query, setQuery]       = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [hour, setHour]         = useState(() => new Date().getHours());
  const [minute, setMinute]     = useState(() => Math.round(new Date().getMinutes() / 30) * 30 % 60);
  const [dose, setDose]         = useState('');
  const [withReminder, setWithReminder] = useState(true);

  // Substanz-Suche (name + brandNames)
  const results = useMemo(() => {
    if (!query.trim()) return SUBSTANCES.slice(0, 20);
    const q = query.toLowerCase();
    return SUBSTANCES.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.brandNames?.some((b: string) => b.toLowerCase().includes(q)) ||
        s.effectLabel?.toLowerCase().includes(q),
    ).slice(0, 30);
  }, [query]);

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
    if (val === null || val <= 0) return { level: 'warn', text: 'Ungültige Dosisangabe.' };

    const common: number[] = selected.commonDoses ?? [];
    const maxCommon   = common.length ? Math.max(...common) : null;
    const minCommon   = common.length ? Math.min(...common) : null;
    const unit        = selected.doseUnit as string;

    // Gefährlich hohe Dosis: mehr als 2× die höchste Standarddosis
    if (maxCommon && val > maxCommon * 2) {
      return { level: 'danger', text: `Sehr hohe Einzeldosis! Übliche Max: ${maxCommon} ${unit}` };
    }
    // Erhöhte Dosis: mehr als die höchste Standarddosis
    if (maxCommon && val > maxCommon) {
      return { level: 'warn', text: `Überschreitet übliche Einzeldosis von ${maxCommon} ${unit}` };
    }
    // Sehr niedrige Dosis (< halbe Minimaldosis) – möglicher Tippfehler
    if (minCommon && val < minCommon / 2) {
      return { level: 'info', text: `Unterdosis? Kleinste gängige Dosis: ${minCommon} ${unit}` };
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

    // Kritische Wechselwirkung: erst bestätigen
    if (criticalWarnings.length > 0) {
      Alert.alert(
        '⚠️ Kritische Wechselwirkung!',
        criticalWarnings.map((ix: any) => ix.note).join('\n\n'),
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Trotzdem hinzufügen', style: 'destructive', onPress: doAdd },
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
            {step === 'configure' && (
              <TouchableOpacity onPress={() => setStep('search')} style={s.backBtn}>
                <Text style={s.backText}>‹ Zurück</Text>
              </TouchableOpacity>
            )}
            <Text style={s.headerTitle}>
              {step === 'search' ? '+ Einnahme hinzufügen' : selected?.name}
            </Text>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ─── STEP 1: Suche ─── */}
          {step === 'search' && (
            <>
              <View style={s.searchBox}>
                <Text style={s.searchIcon}>🔍</Text>
                <TextInput
                  style={s.searchInput}
                  placeholder="Substanz oder Markenname suchen…"
                  placeholderTextColor="#4a5a70"
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

              <FlatList
                data={results}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity style={s.resultRow} onPress={() => selectSubstance(item)} activeOpacity={0.7}>
                    <SubIcon icon={item.icon} color={item.color} size={36} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={s.resultName}>{item.name}</Text>
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
                  <SubIcon icon={selected.icon} color={selected.color} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.configName}>{selected.name}</Text>
                    <Text style={s.configMeta}>{selected.effectLabel}</Text>
                  </View>
                </View>
                {selected.pk?.foodNote && (
                  <View style={s.foodNote}>
                    <Text style={s.foodNoteText}>🍽 {selected.pk.foodNote}</Text>
                  </View>
                )}
              </View>

              {/* BtM / Rx Warnung */}
              {(selected.controlled || selected.prescription) && (
                <View style={selected.controlled ? s.btmWarning : s.rxWarning}>
                  <Text style={s.rxWarningTitle}>
                    {selected.controlled ? '🔒 Betäubungsmittel (BtM)' : '📋 Verschreibungspflichtig (Rx)'}
                  </Text>
                  <Text style={s.rxWarningText}>
                    {selected.controlled
                      ? 'Diese Substanz unterliegt dem Betäubungsmittelgesetz (BtMG). Besitz und Einnahme ohne gültige ärztliche Verschreibung sind strafbar. CurveDay gibt keine Empfehlung zur Einnahme.'
                      : 'Dieses Medikament ist verschreibungspflichtig (Rx). Bitte nur nach Rücksprache mit einem Arzt oder Apotheker einnehmen.'}
                  </Text>
                </View>
              )}

              {/* Kritische Warnung */}
              {criticalWarnings.length > 0 && (
                <View style={s.criticalBox}>
                  <Text style={s.criticalTitle}>⚠️ Kritische Wechselwirkung!</Text>
                  {criticalWarnings.map((ix: any, i: number) => (
                    <Text key={i} style={s.criticalText}>{ix.note}</Text>
                  ))}
                </View>
              )}

              {/* Dosis */}
              <View style={s.configSection}>
                <Text style={s.configLabel}>Dosis</Text>
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
                  placeholderTextColor="#4a5a70"
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

              {/* Uhrzeit */}
              <View style={s.configSection}>
                <Text style={s.configLabel}>Einnahme-Uhrzeit</Text>
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

              {/* PK-Hinweis */}
              <View style={s.pkHint}>
                <Text style={s.pkHintLabel}>Peak ca.</Text>
                <Text style={s.pkHintValue}>
                  {fmtHour(timeH + (selected.pk?.tmaxHours ?? 1))} Uhr
                </Text>
                <Text style={s.pkHintLabel}>· Wirkdauer</Text>
                <Text style={s.pkHintValue}>{selected.pk?.durationHours ?? '?'} Std</Text>
              </View>

              {/* Erinnerung */}
              <TouchableOpacity
                style={[s.reminderRow, withReminder && { borderColor: '#38bdf850' }]}
                onPress={() => setWithReminder(r => !r)}
                activeOpacity={0.8}
              >
                <View style={[s.checkbox, withReminder && { backgroundColor: '#38bdf8', borderColor: '#38bdf8' }]}>
                  {withReminder && <Text style={{ fontSize: 10, color: '#fff' }}>✓</Text>}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.reminderTitle}>Tägliche Erinnerung</Text>
                  <Text style={s.reminderSub}>
                    Jeden Tag um {fmtHour(timeH)} Uhr erinnern
                  </Text>
                </View>
                <Text style={{ fontSize: 16 }}>🔔</Text>
              </TouchableOpacity>

              {/* Warnungen */}
              {selected.warnings?.length > 0 && (
                <View style={s.warningsBox}>
                  <Text style={s.warningsTitle}>Hinweise</Text>
                  {selected.warnings.map((w: string, i: number) => (
                    <Text key={i} style={s.warningItem}>• {w}</Text>
                  ))}
                </View>
              )}

              {/* Tagesfrequenz-Warnung */}
              {dailyCountWarning && (
                <View style={s.dailyWarnBox}>
                  <Text style={s.dailyWarnText}>
                    ⚠️ Bereits {todayCount}/{maxPerDay} Einnahmen heute erfasst
                    {maxPerDay === 1 ? ' — nur 1× täglich empfohlen.' : ` — max. ${maxPerDay}× täglich empfohlen.`}
                  </Text>
                </View>
              )}

              {/* Confirm */}
              <TouchableOpacity style={[s.confirmBtn, { backgroundColor: selected.color }]} onPress={confirm} activeOpacity={0.85}>
                <Text style={s.confirmText}>Einnahme hinzufügen</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const C = {
  bg: '#060b13', surface: '#0d1725', surfaceDim: '#080f1c',
  border: '#1a2840', text: '#e2e8f0', textDim: '#4a5a70', accent: '#38bdf8',
};

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:     { marginRight: 8 },
  backText:    { fontSize: 14, color: C.accent },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#fff', textAlign: 'center' },
  closeBtn:    { padding: 4 },
  closeText:   { fontSize: 16, color: C.textDim },

  searchBox:   { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12 },
  searchIcon:  { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, height: 44, color: C.text, fontSize: 14 },
  clearText:   { fontSize: 14, color: C.textDim, padding: 4 },

  resultRow:    { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16 },
  resultName:   { fontSize: 14, fontWeight: '600', color: C.text },
  resultMeta:   { fontSize: 11, color: C.textDim, marginTop: 2 },
  resultBrands: { fontSize: 10, color: '#374560', marginTop: 1 },
  resultArrow:  { fontSize: 20, marginLeft: 8 },
  separator:    { height: 1, backgroundColor: C.border, marginLeft: 68 },

  btmBadge:  { backgroundColor: '#ef444415', borderRadius: 5, borderWidth: 1, borderColor: '#ef444430', paddingHorizontal: 5, paddingVertical: 1 },
  btmText:   { fontSize: 9, color: '#f87171', fontWeight: '700' },

  configCard:    { backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  configName:    { fontSize: 16, fontWeight: '700', color: '#fff' },
  configMeta:    { fontSize: 12, color: C.textDim, marginTop: 2 },
  foodNote:      { marginTop: 10, backgroundColor: '#fbbf2412', borderRadius: 9, padding: 9, borderWidth: 1, borderColor: '#fbbf2425' },
  foodNoteText:  { fontSize: 11, color: '#fde68a', lineHeight: 17 },

  criticalBox:   { backgroundColor: '#ef444412', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ef444435' },
  criticalTitle: { fontSize: 13, fontWeight: '700', color: '#f87171', marginBottom: 6 },
  criticalText:  { fontSize: 11, color: '#fca5a5', lineHeight: 17 },

  configSection: { backgroundColor: C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  configLabel:   { fontSize: 11, color: C.textDim, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },

  doseRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 },
  doseChip:     { backgroundColor: C.surfaceDim, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  doseChipText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  doseInput:    { backgroundColor: C.surfaceDim, borderRadius: 9, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 9, color: C.text, fontSize: 13 },

  timeRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  timeArrow:    { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceDim, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  timeArrowText:{ fontSize: 18, color: C.accent },
  timeDisplay:  { backgroundColor: C.surfaceDim, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  timeText:     { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  minChip:     { backgroundColor: C.surfaceDim, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  minChipText: { fontSize: 12, color: '#94a3b8' },

  pkHint:      { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', backgroundColor: C.surface, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: C.border },
  pkHintLabel: { fontSize: 11, color: C.textDim },
  pkHintValue: { fontSize: 12, fontWeight: '700', color: '#fff' },

  reminderRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  checkbox:      { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  reminderTitle: { fontSize: 13, fontWeight: '600', color: C.text },
  reminderSub:   { fontSize: 11, color: C.textDim, marginTop: 1 },

  btmWarning:    { backgroundColor: '#ef444412', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ef444435' },
  rxWarning:     { backgroundColor: '#f59e0b10', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#f59e0b30' },
  rxWarningTitle:{ fontSize: 12, fontWeight: '700', color: '#fcd34d', marginBottom: 5 },
  rxWarningText: { fontSize: 11, color: '#fde68a', lineHeight: 17 },

  doseWarnBox:   { marginTop: 8, borderRadius: 8, padding: 9, borderWidth: 1 },
  doseWarnText:  { fontSize: 11, lineHeight: 16 },

  dailyWarnBox:  { backgroundColor: '#f59e0b10', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#f59e0b35', marginBottom: 4 },
  dailyWarnText: { fontSize: 12, color: '#fcd34d', lineHeight: 17 },

  warningsBox:   { backgroundColor: '#f59e0b10', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#f59e0b25' },
  warningsTitle: { fontSize: 11, fontWeight: '700', color: '#fcd34d', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  warningItem:   { fontSize: 11, color: '#fde68a', lineHeight: 18 },

  confirmBtn:  { borderRadius: 12, padding: 14, alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
