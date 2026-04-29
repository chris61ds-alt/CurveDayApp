import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Platform,
} from 'react-native';
import { useIntakeStore } from '../../src/store/intakeStore';
import { getSubstance, getActiveInteractions } from '../../src/data/substanceDB';
import {
  buildChartData, getRemainingTime, isActive, getCurrentEffect,
  getPeakLabel, fmtHour, EFFECT_LABELS, IX_TYPE, IX_SEVERITY_COLOR, IX_SEVERITY_LABEL,
} from '../../src/utils/pkHelpers';
import { useNow } from '../../src/utils/useNow';
import { CurveChart } from '../../src/components/CurveChart';
import { SubIcon } from '../../src/components/SubIcon';
import { AddIntakeModal } from '../../src/components/AddIntakeModal';

// ── Design Tokens ─────────────────────────────────────────────
const T = {
  bg:          '#060b13',
  surface:     '#0a1520',
  surfaceHigh: '#0d1a2a',
  border:      '#0f2035',
  borderMid:   '#162840',
  text:        '#e8f0f8',
  textSub:     '#7a9ab5',
  textDim:     '#3a5570',
  accent:      '#38bdf8',
  accentDim:   '#38bdf820',
};

// ── Typography ────────────────────────────────────────────────
const TY = StyleSheet.create({
  h1:      { fontSize: 22, fontWeight: '800', color: T.text, letterSpacing: -0.5 },
  h2:      { fontSize: 17, fontWeight: '700', color: T.text },
  h3:      { fontSize: 14, fontWeight: '700', color: T.text },
  body:    { fontSize: 14, color: T.textSub, lineHeight: 20 },
  caption: { fontSize: 12, color: T.textDim },
  label:   { fontSize: 11, fontWeight: '600', color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.8 },
});

export default function TageskurveScreen() {
  const { intakes, selectedId, setSelectedId, hydrate, hydrated } = useIntakeStore();
  const now = useNow();
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { hydrate(); }, []);

  // Fade-in beim Laden
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
    () => intakes.map(i => ({
      substanceId: i.substanceId,
      color: getSubstance(i.substanceId)?.color ?? '#fff',
    })),
    [intakes],
  );

  // Peak-Marker für Chart
  const peakMarks = useMemo(() =>
    intakes.map(i => {
      const sub = getSubstance(i.substanceId);
      if (!sub) return null;
      const peakH     = i.timeH + sub.pk.tmaxHours;
      const peakIndex = Math.min(Math.round(peakH * 2), 48);
      return {
        substanceId: i.substanceId,
        peakIndex,
        color: sub.color,
        label: fmtHour(peakH),
      };
    }).filter(Boolean) as any[],
    [intakes],
  );

  if (!hydrated) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loading}>
          <Text style={TY.caption}>Lade…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>

      {/* ── HEADER ─────────────────────────────── */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoIcon}><Text style={{ fontSize: 13 }}>〜</Text></View>
          <Text style={[TY.h3, { color: '#fff' }]}>CurveDay</Text>
        </View>
        <View style={s.dateRow}>
          <Text style={TY.caption}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <View style={s.nowPill}>
          <View style={s.nowDot} />
          <Text style={[TY.caption, { color: T.accent }]}>{fmtHour(now)}</Text>
        </View>
      </View>

      <Animated.ScrollView style={{ flex: 1, opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── CHART ───────────────────────────── */}
        <View style={s.card}>
          {/* Legende */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={s.legendRow}>
              {intakes.map(intake => {
                const sub = getSubstance(intake.substanceId);
                if (!sub) return null;
                const sel = selectedId === intake.substanceId;
                return (
                  <TouchableOpacity
                    key={intake.substanceId}
                    style={[s.legendChip, sel && { backgroundColor: `${sub.color}20`, borderColor: `${sub.color}50` }]}
                    onPress={() => setSelectedId(intake.substanceId)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.legendDot, { backgroundColor: sub.color }]} />
                    <Text style={[TY.caption, sel && { color: sub.color, fontWeight: '700' }]}>{sub.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <CurveChart
            data={chartData}
            entries={chartEntries}
            selectedId={selectedId}
            nowHour={now}
            peakMarks={peakMarks}
            height={210}
          />

          {/* Einnahme-Zeitpunkte unter Chart */}
          {intakes.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              <View style={s.pillRow}>
                {intakes.map(intake => {
                  const sub = getSubstance(intake.substanceId);
                  if (!sub) return null;
                  const sel = selectedId === intake.substanceId;
                  return (
                    <TouchableOpacity
                      key={intake.substanceId}
                      style={[s.intakePill, sel && { borderColor: `${sub.color}60`, backgroundColor: `${sub.color}12` }]}
                      onPress={() => setSelectedId(intake.substanceId)}
                      activeOpacity={0.75}
                    >
                      <SubIcon icon={sub.icon} color={sub.color} size={22} />
                      <View>
                        <Text style={[TY.caption, sel && { color: sub.color }]}>{fmtHour(intake.timeH)}</Text>
                        <Text style={[{ fontSize: 10, color: T.textDim }]}>{intake.doseLabel}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* ── AKTIVE SUBSTANZEN ───────────────── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={TY.label}>Aktiv jetzt</Text>
            <View style={s.activeBadge}>
              <Text style={[TY.caption, { color: activeIntakes.length > 0 ? T.accent : T.textDim }]}>
                {activeIntakes.length} Substanz{activeIntakes.length !== 1 ? 'en' : ''}
              </Text>
            </View>
          </View>

          {activeIntakes.length === 0 ? (
            <View style={s.emptyInline}>
              <Text style={TY.caption}>Keine aktiven Substanzen</Text>
            </View>
          ) : (
            <View style={s.activeGrid}>
              {activeIntakes.map(intake => {
                const sub = getSubstance(intake.substanceId);
                if (!sub) return null;
                const sel = selectedId === intake.substanceId;
                const effect = getCurrentEffect(intake.substanceId, chartData, now);
                return (
                  <TouchableOpacity
                    key={intake.substanceId}
                    onPress={() => setSelectedId(intake.substanceId)}
                    style={[s.activeCard, sel && { borderColor: `${sub.color}40`, backgroundColor: `${sub.color}08` }]}
                    activeOpacity={0.8}
                  >
                    <SubIcon icon={sub.icon} color={sub.color} size={36} />
                    <Text style={[TY.h3, { marginTop: 6, fontSize: 13 }]} numberOfLines={1}>{sub.name}</Text>
                    <Text style={[TY.caption, { marginTop: 2 }]}>{intake.doseLabel}</Text>
                    <Text style={[{ fontSize: 18, fontWeight: '800', color: sub.color, marginTop: 4 }]}>{effect}%</Text>
                    <Text style={[TY.caption, { color: T.textDim, fontSize: 10 }]}>{getRemainingTime(intake, now)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── SUBSTANZ-DETAILS ────────────────── */}
        {selectedSub && selectedIntake && (() => {
          const effects = Object.entries(selectedSub.effects as Record<string, number | undefined>)
            .filter(([, v]) => (v ?? 0) > 0)
            .map(([k]) => EFFECT_LABELS[k] ?? k)
            .slice(0, 3);

          return (
            <View style={s.card}>
              <Text style={TY.label}>Details</Text>

              <View style={s.detailHeader}>
                <SubIcon icon={selectedSub.icon} color={selectedSub.color} size={44} />
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={TY.h2}>{selectedSub.name}</Text>
                  <Text style={TY.caption}>{selectedIntake.doseLabel} · {fmtHour(selectedIntake.timeH)} Uhr</Text>
                  <View style={s.effectChips}>
                    {effects.map(e => (
                      <View key={e} style={[s.chip, { backgroundColor: `${selectedSub.color}18`, borderColor: `${selectedSub.color}30` }]}>
                        <Text style={[{ fontSize: 11, color: selectedSub.color }]}>{e}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={s.pkGrid}>
                {[
                  ['Peak',          getPeakLabel(selectedIntake.timeH, selectedId)],
                  ['Wirkdauer',     `${selectedSub.pk.durationHours} h`],
                  ['HWZ',           `${selectedSub.pk.halflifeHours} h`],
                  ['Bioverfügbar',  `${selectedSub.pk.bioavailability}%`],
                ].map(([k, v]) => (
                  <View key={k} style={s.pkCell}>
                    <Text style={[TY.caption, { fontSize: 10 }]}>{k}</Text>
                    <Text style={[TY.h3, { color: T.accent, marginTop: 3 }]}>{v}</Text>
                  </View>
                ))}
              </View>

              {selectedSub.warnings?.[0] && (
                <View style={s.warnBox}>
                  <Text style={{ fontSize: 12, color: '#fca5a5', lineHeight: 18 }}>⚠️ {selectedSub.warnings[0]}</Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* ── WECHSELWIRKUNGEN ────────────────── */}
        {interactions.length > 0 && (
          <View style={s.card}>
            <Text style={TY.label}>Wechselwirkungen · {interactions.length}</Text>
            {interactions.map((ix: any, i: number) => {
              const subA   = getSubstance(ix.a);
              const subB   = getSubstance(ix.b);
              const ixMeta = IX_TYPE[ix.type] ?? IX_TYPE.mixed;
              const sevColor = ix.type === 'synergy' ? '#4ade80' : IX_SEVERITY_COLOR[ix.severity] ?? '#94a3b8';
              return (
                <View key={i} style={[s.ixCard, { borderLeftColor: sevColor }]}>
                  <View style={s.ixHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      {[subA, subB].filter(Boolean).map((sub: any) => (
                        <SubIcon key={sub.id} icon={sub.icon} color={sub.color} size={22} />
                      ))}
                      <Text style={[TY.h3, { fontSize: 13, flex: 1 }]} numberOfLines={1}>
                        {subA?.name} + {subB?.name}
                      </Text>
                    </View>
                    <View style={[s.chip, { backgroundColor: `${sevColor}20`, borderColor: `${sevColor}40` }]}>
                      <Text style={[{ fontSize: 11, color: sevColor, fontWeight: '700' }]}>{ixMeta.tag}</Text>
                    </View>
                  </View>
                  <Text style={TY.body} numberOfLines={3}>{ix.note}</Text>
                  <Text style={[TY.caption, { marginTop: 4 }]}>
                    Stärke: <Text style={{ color: sevColor }}>{IX_SEVERITY_LABEL[ix.severity]}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── INSIGHTS ────────────────────────── */}
        <View style={[s.card, { borderColor: `${T.accent}20` }]}>
          <Text style={TY.label}>💡 Tages-Insights</Text>
          {[
            activeIntakes.length > 0
              ? `${activeIntakes.length} Substanz${activeIntakes.length !== 1 ? 'en' : ''} aktiv — beachte Einnahme-Intervalle.`
              : 'Keine aktiven Substanzen. Nächste Einnahme planen?',
            interactions.length > 0
              ? `${interactions.length} Wechselwirkung${interactions.length !== 1 ? 'en' : ''} erkannt — siehe Details oben.`
              : 'Keine bekannten Interaktionen zwischen deinen Substanzen.',
          ].map((t, i) => (
            <View key={i} style={s.insightRow}>
              <View style={[s.insightDot, { backgroundColor: i === 0 ? T.accent : '#4ade80' }]} />
              <Text style={[TY.body, { flex: 1 }]}>{t}</Text>
            </View>
          ))}
        </View>

      </Animated.ScrollView>

      {/* ── FAB ─────────────────────────────── */}
      <TouchableOpacity style={s.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddIntakeModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: T.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  logoIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#0d2040', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${T.accent}30`,
  },
  dateRow:  { flex: 2, alignItems: 'center' },
  nowPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${T.accent}12`, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: `${T.accent}25`,
  },
  nowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.accent },

  // Cards
  card: {
    backgroundColor: T.surface, marginHorizontal: 14,
    marginTop: 12, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: T.border,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: T.surfaceHigh, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: T.borderMid,
  },

  // Legend
  legendRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: T.border,
    backgroundColor: T.surfaceHigh,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },

  // Intake pills unter Chart
  pillRow: { flexDirection: 'row', gap: 8 },
  intakePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.surfaceHigh, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: T.border,
  },

  // Aktive Substanzen (Grid)
  activeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  activeCard: {
    flex: 1, minWidth: 100,
    backgroundColor: T.surfaceHigh, borderRadius: 14,
    padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: T.border,
  },

  emptyInline: { paddingVertical: 16, alignItems: 'center' },

  // Details
  detailHeader:  { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, marginBottom: 14 },
  effectChips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  chip: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1,
  },
  pkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pkCell: {
    flex: 1, minWidth: 80,
    backgroundColor: '#060b13', borderRadius: 10,
    padding: 10, alignItems: 'center',
  },
  warnBox: {
    backgroundColor: '#1a0a0a', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: '#f8717130',
  },

  // Wechselwirkungen
  ixCard: {
    backgroundColor: T.surfaceHigh, borderRadius: 12,
    padding: 12, marginTop: 10,
    borderWidth: 1, borderColor: T.borderMid,
    borderLeftWidth: 3,
  },
  ixHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },

  // Insights
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 10 },
  insightDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 24 : 16,
    width: 58, height: 58,
    borderRadius: 29,
    backgroundColor: T.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { fontSize: 28, color: '#000', fontWeight: '300', marginTop: -2 },
});
