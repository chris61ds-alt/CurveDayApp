import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIntakeStore } from '../../src/store/intakeStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useT } from '../../src/i18n';
import { getSubstance, getActiveInteractions } from '../../src/data/substanceDB';
import {
  buildChartData, getRemainingTime, isActive, getCurrentEffect,
  getPeakLabel, fmtHour, EFFECT_LABELS, IX_TYPE, IX_SEVERITY_COLOR, IX_SEVERITY_LABEL,
} from '../../src/utils/pkHelpers';
import { useNow } from '../../src/utils/useNow';
import { CurveChart } from '../../src/components/CurveChart';
import { SubIcon } from '../../src/components/SubIcon';
import { AddIntakeModal } from '../../src/components/AddIntakeModal';

// ── Zustandsbeschreibung ──────────────────────────────────────
const STATE_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  pain:            { label: 'Schmerzlinderung',   emoji: '🛡️', color: '#c084fc' },
  sleep:           { label: 'Schläfrig',           emoji: '😴', color: '#818cf8' },
  relaxation:      { label: 'Entspannt',           emoji: '😌', color: '#818cf8' },
  anxietyReduction:{ label: 'Beruhigt',            emoji: '🧘', color: '#34d399' },
  concentration:   { label: 'Konzentriert',        emoji: '🎯', color: '#38bdf8' },
  impulseControl:  { label: 'Fokussiert',          emoji: '🎯', color: '#38bdf8' },
  energy:          { label: 'Energiegeladen',      emoji: '⚡', color: '#f59e0b' },
  mood:            { label: 'Gute Stimmung',       emoji: '😊', color: '#fb923c' },
  alertness:       { label: 'Wach & Aufmerksam',   emoji: '✨', color: '#38bdf8' },
  disinhibition:   { label: 'Gelöst & Offen',      emoji: '☺️', color: '#94a3b8' },
  muscleRelax:     { label: 'Muskelentspannt',     emoji: '💆', color: '#4ade80' },
  cardiovascular:  { label: 'Herzunterstützung',   emoji: '❤️', color: '#f87171' },
  stressReduction: { label: 'Stressreduziert',     emoji: '🌿', color: '#4ade80' },
  antihistamine:   { label: 'Antiallergisch',      emoji: '🌸', color: '#34d399' },
  acidSuppression: { label: 'Magenberuhigt',       emoji: '✨', color: '#a3e635' },
  bloodPressure:   { label: 'Blutdruck stabil',    emoji: '💗', color: '#f87171' },
  fatigueReduction:{ label: 'Erschöpfung reduziert', emoji: '💪', color: '#f59e0b' },
  cognition:       { label: 'Kognition verbessert', emoji: '🧠', color: '#38bdf8' },
};

function computeCurrentState(
  activeIntakes: any[],
  chartData: any[],
  now: number,
): { label: string; emoji: string; color: string; strength: string } | null {
  const totals: Record<string, number> = {};
  for (const intake of activeIntakes) {
    const sub = getSubstance(intake.substanceId);
    if (!sub) continue;
    const eff = getCurrentEffect(intake.substanceId, chartData, now) / 100;
    for (const [key, val] of Object.entries(sub.effects as Record<string, number>)) {
      if (typeof val === 'number' && val > 0) {
        totals[key] = (totals[key] ?? 0) + val * eff;
      }
    }
  }
  const top = Object.entries(totals).sort(([, a], [, b]) => b - a)[0];
  if (!top) return null;
  const mapped = STATE_MAP[top[0]];
  if (!mapped) return null;
  const strength = top[1] > 60 ? 'stark' : top[1] > 25 ? 'moderat' : 'leicht';
  return { ...mapped, strength };
}

export default function TageskurveScreen() {
  const { intakes, selectedId, setSelectedId, hydrate, hydrated } = useIntakeStore();
  const { colors: C } = useThemeStore();
  const { prefs } = useOnboardingStore();
  const t = useT();
  const now = useNow();

  // Sleep window from profile (default: 23:00 → 07:00)
  const sleepWindow = useMemo(() => {
    const s = prefs.profile?.sleepStart;
    const e = prefs.profile?.sleepEnd;
    if (s !== undefined && e !== undefined) return { start: s, end: e };
    return { start: 23, end: 7 }; // sensible default
  }, [prefs.profile?.sleepStart, prefs.profile?.sleepEnd]);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { hydrate(); }, []);


  useEffect(() => {
    if (hydrated) {
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }).start();
    }
  }, [hydrated]);

  const chartData     = useMemo(() => buildChartData(intakes), [intakes]);
  const interactions  = useMemo(() => getActiveInteractions(intakes.map(i => i.substanceId)), [intakes]);
  const activeIntakes = useMemo(() => intakes.filter(i => isActive(i, now)), [intakes, now]);

  const selectedIntake = intakes.find(i => i.substanceId === selectedId) ?? intakes[0];
  const selectedSub    = getSubstance(selectedId);

  const chartEntries = useMemo(
    () => intakes.map(i => {
      const sub = getSubstance(i.substanceId);
      return {
        substanceId: i.substanceId,
        color: sub?.color ?? '#fff',
        isChronic: sub?.pk?.curveType === 'chronic',
      };
    }),
    [intakes],
  );

  const peakMarks = useMemo(() =>
    intakes.map(i => {
      const sub = getSubstance(i.substanceId);
      if (!sub) return null;
      const peakH     = i.timeH + sub.pk.tmaxHours;
      const peakIndex = Math.min(Math.round(peakH * 2), 48);
      return { substanceId: i.substanceId, peakIndex, color: sub.color, label: fmtHour(peakH) };
    }).filter(Boolean) as any[],
    [intakes],
  );


  // ── Schlaf-Warnung: Stimulanzien noch aktiv bei Schlafbeginn? ──
  // Substanzen mit Wach/Energie/Konzentrations-Effekten
  const STIMULANT_EFFECTS = ['alertness', 'energy', 'concentration', 'impulseControl'];
  const bedtimeWarnings = useMemo(() => {
    if (!chartData.length) return [];
    const bedtimeIdx = Math.min(Math.round(sleepWindow.start * 2), chartData.length - 1);
    return intakes.filter(intake => {
      const sub = getSubstance(intake.substanceId);
      if (!sub) return false;
      const hasStimEffect = STIMULANT_EFFECTS.some(k => (sub.effects as any)[k] > 0);
      if (!hasStimEffect) return false;
      const val = chartData[bedtimeIdx]?.[intake.substanceId];
      return typeof val === 'number' && val > 18; // >18% = noch spürbar
    }).map(i => {
      const sub = getSubstance(i.substanceId);
      const val = chartData[Math.min(Math.round(sleepWindow.start * 2), chartData.length - 1)]?.[i.substanceId] as number;
      return { name: sub?.name ?? i.substanceId, color: sub?.color ?? '#fff', val: Math.round(val) };
    });
  }, [chartData, intakes, sleepWindow.start]);

  if (!hydrated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, color: C.textDim }}>Lade…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── HEADER ─────────────────────────────── */}
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <View style={s.logoRow}>
          <View style={[s.logoIcon, { backgroundColor: C.surfaceHigh, borderColor: `${C.accent}30` }]}>
            <Text style={{ fontSize: 13 }}>〜</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>CurveDay</Text>
        </View>
        <View style={s.dateRow}>
          <Text style={{ fontSize: 12, color: C.textDim }}>
            {t.homeDate(new Date())}
          </Text>
        </View>
        <View style={[s.nowPill, { backgroundColor: `${C.accent}12`, borderColor: `${C.accent}25` }]}>
          <View style={[s.nowDot, { backgroundColor: C.accent }]} />
          <Text style={{ fontSize: 12, color: C.accent }}>{fmtHour(now)}</Text>
        </View>
      </View>

      {/* ── EMPTY STATE ──────────────────────── */}
      {intakes.length === 0 && (
        <Animated.View style={[s.emptyState, { opacity: fadeAnim }]}>
          <CurveChart
            data={buildChartData([])} entries={[]} selectedId=""
            nowHour={now} height={160}
          />
          <View style={s.emptyContent}>
            <Text style={s.emptyEmoji}>💊</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
              {t.homeEmptyTitle}
            </Text>
            <Text style={{ fontSize: 14, color: C.textSub, textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>
              {t.homeEmptyDesc}
            </Text>
            <View style={s.emptyHints}>
              {[t.homeEmptyHint1, t.homeEmptyHint2, t.homeEmptyHint3].map((h, i) => (
                <View key={i} style={s.emptyHintRow}>
                  <View style={[s.emptyHintDot, { backgroundColor: C.accent }]} />
                  <Text style={{ fontSize: 14, color: C.textSub, lineHeight: 20 }}>{h}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[s.emptyBtn, { backgroundColor: C.accent }]} onPress={() => setModalVisible(true)}>
              <Text style={s.emptyBtnText}>{t.homeEmptyBtn}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Animated.ScrollView
        style={[{ flex: 1, opacity: fadeAnim }, intakes.length === 0 && { display: 'none' }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEventThrottle={16}
      >

        {/* ── CHART ──────────────────────────── */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <CurveChart
            data={chartData} entries={chartEntries} selectedId={selectedId}
            nowHour={now} peakMarks={peakMarks}
            sleepWindow={sleepWindow}
            height={280}
            labelNow={t.chartNow}
            labelTomorrow={t.chartTomorrow}
            labelSteadyState={t.chartSteadyState}
            labelSleep={t.chartSleep}
            labelNoIntakes={t.chartNoIntakes}
            gridColor={C.gridLine} labelColor={C.textMuted}
            accentColor={C.accent} isDark={C.isDark}
          />

          {/* Schlaf-Warnung */}
          {bedtimeWarnings.length > 0 && (
            <View style={[s.sleepWarnBox, { backgroundColor: '#818cf808', borderColor: '#818cf830' }]}>
              <Text style={[s.sleepWarnTitle, { color: '#818cf8' }]}>
                🌙 {t.homeBedtimeWarn(fmtHour(sleepWindow.start))}
              </Text>
              {bedtimeWarnings.map((w, i) => (
                <Text key={i} style={[s.sleepWarnItem, { color: w.color }]}>
                  {'  ·  '}{w.name} ({w.val}%)
                </Text>
              ))}
            </View>
          )}

          {/* Intake pills — tap to select, swipe to scroll */}
          {intakes.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={s.pillRow}>
                {intakes.map(intake => {
                  const sub = getSubstance(intake.substanceId);
                  if (!sub) return null;
                  const sel = selectedId === intake.substanceId;
                  return (
                    <TouchableOpacity
                      key={intake.id}
                      style={[s.intakePill, { backgroundColor: C.surfaceHigh, borderColor: C.border },
                        sel && { borderColor: `${sub.color}60`, backgroundColor: `${sub.color}12` }]}
                      onPress={() => setSelectedId(intake.substanceId)}
                      activeOpacity={0.75}
                    >
                      <View style={[s.legendDot, { backgroundColor: sub.color }]} />
                      <View>
                        <Text style={[{ fontSize: 12, fontWeight: '600', color: C.textSub }, sel && { color: sub.color }]}>
                          {sub.name}
                        </Text>
                        <Text style={{ fontSize: 10, color: C.textDim }}>{fmtHour(intake.timeH)} · {intake.doseLabel}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* ── AKTIVE SUBSTANZEN ──────────────── */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.cardHeader}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Aktiv jetzt
            </Text>
            <View style={[s.activeBadge, { backgroundColor: C.surfaceHigh, borderColor: C.borderMid }]}>
              <Text style={{ fontSize: 12, color: activeIntakes.length > 0 ? C.accent : C.textDim }}>
                {activeIntakes.length} Substanz{activeIntakes.length !== 1 ? 'en' : ''}
              </Text>
            </View>
          </View>

          {/* Current state description */}
          {activeIntakes.length > 0 && (() => {
            const state = computeCurrentState(activeIntakes, chartData, now);
            if (!state) return null;
            return (
              <View style={[s.stateRow, { backgroundColor: `${state.color}12`, borderColor: `${state.color}30` }]}>
                <Text style={{ fontSize: 20 }}>{state.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: state.color }}>{state.label}</Text>
                  <Text style={{ fontSize: 11, color: C.textDim }}>Aktueller Wirkzustand · {state.strength}</Text>
                </View>
              </View>
            );
          })()}

          {activeIntakes.length === 0 ? (
            <View style={s.emptyInline}>
              <Text style={{ fontSize: 12, color: C.textDim }}>Keine aktiven Substanzen</Text>
            </View>
          ) : (
            <View style={s.activeGrid}>
              {activeIntakes.map(intake => {
                const sub = getSubstance(intake.substanceId);
                if (!sub) return null;
                const sel    = selectedId === intake.substanceId;
                const effect = getCurrentEffect(intake.substanceId, chartData, now);
                return (
                  <TouchableOpacity
                    key={intake.id}
                    onPress={() => setSelectedId(intake.substanceId)}
                    style={[s.activeCard, { backgroundColor: C.surfaceHigh, borderColor: C.border },
                      sel && { borderColor: `${sub.color}40`, backgroundColor: `${sub.color}08` }]}
                    activeOpacity={0.8}
                  >
                    <SubIcon substance={sub} size={36} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.text, marginTop: 6 }} numberOfLines={1}>
                      {sub.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{intake.doseLabel}</Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: sub.color, marginTop: 4 }}>{effect}%</Text>
                    <Text style={{ fontSize: 10, color: C.textDim }}>{getRemainingTime(intake, now)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── SUBSTANZ-DETAILS ───────────────── */}
        {selectedSub && selectedIntake && (() => {
          const effects = Object.entries(selectedSub.effects as Record<string, number | undefined>)
            .filter(([, v]) => (v ?? 0) > 0)
            .map(([k]) => EFFECT_LABELS[k] ?? k)
            .slice(0, 3);

          return (
            <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Details
              </Text>
              <View style={[s.detailHeader]}>
                <SubIcon substance={selectedSub} size={44} />
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: C.text }}>{selectedSub.name}</Text>
                  <Text style={{ fontSize: 12, color: C.textDim }}>{selectedIntake.doseLabel} · {fmtHour(selectedIntake.timeH)} Uhr</Text>
                  <View style={s.effectChips}>
                    {effects.map(e => (
                      <View key={e} style={[s.chip, { backgroundColor: `${selectedSub.color}18`, borderColor: `${selectedSub.color}30` }]}>
                        <Text style={{ fontSize: 11, color: selectedSub.color }}>{e}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={s.pkGrid}>
                {[
                  ['Peak',         getPeakLabel(selectedIntake.timeH, selectedId)],
                  ['Wirkdauer',    `${selectedSub.pk.durationHours} h`],
                  ['HWZ',          `${selectedSub.pk.halflifeHours} h`],
                  ['Bioverfügbar', `${selectedSub.pk.bioavailability}%`],
                ].map(([k, v]) => (
                  <View key={k} style={[s.pkCell, { backgroundColor: C.bg }]}>
                    <Text style={{ fontSize: 10, color: C.textDim }}>{k}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.accent, marginTop: 3 }}>{v}</Text>
                  </View>
                ))}
              </View>

              {selectedSub.warnings?.[0] && (
                <View style={[s.warnBox, { backgroundColor: C.isDark ? '#1a0a0a' : '#fff4f0', borderColor: '#f8717130' }]}>
                  <Text style={{ fontSize: 12, color: C.isDark ? '#fca5a5' : '#c0392b', lineHeight: 18 }}>
                    ⚠️ {selectedSub.warnings[0]}
                  </Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* ── WECHSELWIRKUNGEN ───────────────── */}
        {interactions.length > 0 && (
          <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
              Wechselwirkungen · {interactions.length}
            </Text>
            {interactions.map((ix: any, i: number) => {
              const subA   = getSubstance(ix.a);
              const subB   = getSubstance(ix.b);
              const ixMeta = IX_TYPE[ix.type] ?? IX_TYPE.mixed;
              const sevColor = ix.type === 'synergy' ? '#4ade80' : IX_SEVERITY_COLOR[ix.severity] ?? '#94a3b8';
              return (
                <View key={i} style={[s.ixCard, { backgroundColor: C.surfaceHigh, borderColor: C.borderMid, borderLeftColor: sevColor }]}>
                  <View style={s.ixHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      {[subA, subB].filter(Boolean).map((sub: any) => (
                        <SubIcon key={sub.id} substance={sub} size={22} />
                      ))}
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.text, flex: 1 }} numberOfLines={1}>
                        {subA?.name} + {subB?.name}
                      </Text>
                    </View>
                    <View style={[s.chip, { backgroundColor: `${sevColor}20`, borderColor: `${sevColor}40` }]}>
                      <Text style={{ fontSize: 11, color: sevColor, fontWeight: '700' }}>{ixMeta.tag}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, color: C.textSub, lineHeight: 20 }} numberOfLines={3}>{ix.note}</Text>
                  <Text style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
                    Stärke: <Text style={{ color: sevColor }}>{IX_SEVERITY_LABEL[ix.severity]}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── INSIGHTS ───────────────────────── */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: `${C.accent}20` }]}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
            💡 Tages-Insights
          </Text>
          {[
            activeIntakes.length > 0
              ? `${activeIntakes.length} Substanz${activeIntakes.length !== 1 ? 'en' : ''} aktiv — beachte Einnahme-Intervalle.`
              : 'Keine aktiven Substanzen. Nächste Einnahme planen?',
            interactions.length > 0
              ? `${interactions.length} Wechselwirkung${interactions.length !== 1 ? 'en' : ''} erkannt — siehe Details oben.`
              : 'Keine bekannten Interaktionen zwischen deinen Substanzen.',
          ].map((t, i) => (
            <View key={i} style={s.insightRow}>
              <View style={[s.insightDot, { backgroundColor: i === 0 ? C.accent : C.success }]} />
              <Text style={{ fontSize: 14, color: C.textSub, lineHeight: 20, flex: 1 }}>{t}</Text>
            </View>
          ))}
        </View>

      </Animated.ScrollView>

      {/* ── FAB ─────────────────────────────── */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: C.accent, shadowColor: C.accent }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddIntakeModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  logoIcon:   { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  dateRow:    { flex: 2, alignItems: 'center' },
  nowPill:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  nowDot:     { width: 6, height: 6, borderRadius: 3 },

  card:       { marginHorizontal: 14, marginTop: 12, borderRadius: 16, padding: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activeBadge:{ borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },

  legendRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  legendDot:  { width: 9, height: 9, borderRadius: 4.5, marginTop: 1 },

  pillRow:    { flexDirection: 'row', gap: 8 },
  intakePill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },

  activeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  activeCard: { flex: 1, minWidth: 100, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
  stateRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1 },
  emptyInline:{ paddingVertical: 16, alignItems: 'center' },

  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, marginBottom: 14 },
  effectChips:  { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  chip:         { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  pkGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pkCell:       { flex: 1, minWidth: 80, borderRadius: 10, padding: 10, alignItems: 'center' },
  warnBox:      { borderRadius: 10, padding: 12, borderWidth: 1 },

  sleepWarnBox:   { marginTop: 10, borderRadius: 10, padding: 10, borderWidth: 1 },
  sleepWarnTitle: { fontSize: 12, fontWeight: '600', marginBottom: 3 },
  sleepWarnItem:  { fontSize: 11, lineHeight: 18 },

  ixCard:    { borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderLeftWidth: 3 },
  ixHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },

  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 10 },
  insightDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },

  emptyState:   { flex: 1 },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 8 },
  emptyEmoji:   { fontSize: 52, marginBottom: 16 },
  emptyHints:   { alignSelf: 'stretch', marginBottom: 32, gap: 10 },
  emptyHintRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyHintDot: { width: 6, height: 6, borderRadius: 3 },
  emptyBtn:     { borderRadius: 16, paddingVertical: 15, paddingHorizontal: 28, alignSelf: 'stretch', alignItems: 'center' },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },

  fab: {
    position: 'absolute', right: 20,
    bottom: Platform.OS === 'ios' ? 24 : 16,
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  fabIcon: { fontSize: 28, color: '#000', fontWeight: '300', marginTop: -2 },

});
