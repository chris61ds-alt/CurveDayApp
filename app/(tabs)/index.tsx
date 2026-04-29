import React, { useMemo, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
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

const C = {
  bg: '#060b13', surface: '#0d1725', surfaceDim: '#080f1c',
  border: '#1a2840', borderDim: '#142030',
  text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#4a5a70',
  accent: '#38bdf8',
};

const GOALS = [
  { label: 'Schmerz reduzieren',     pct: 75, col: '#c084fc', icon: '🎯' },
  { label: 'Konzentration steigern', pct: 60, col: '#38bdf8', icon: '🧠' },
  { label: 'Entspannung fördern',    pct: 40, col: '#4ade80', icon: '🌿' },
  { label: 'Energie erhöhen',        pct: 70, col: '#fbbf24', icon: '⚡' },
];

export default function TageskurveScreen() {
  const { intakes, selectedId, setSelectedId, hydrate, hydrated } = useIntakeStore();
  const now = useNow();
  const [modalVisible, setModalVisible] = useState(false);

  // AsyncStorage beim Start laden
  useEffect(() => { hydrate(); }, []);

  const chartData    = useMemo(() => buildChartData(intakes), [intakes]);
  const interactions = useMemo(() => getActiveInteractions(intakes.map(i => i.substanceId)), [intakes]);
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

  if (!hydrated) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.textDim, fontSize: 13 }}>Lade Einnahmen…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>

      {/* ── HEADER ─────────────────────────────── */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoIcon}><Text style={{ color: '#fff', fontSize: 12 }}>〜</Text></View>
          <Text style={s.logoText}>CurveDay</Text>
        </View>
        <View style={s.dateRow}>
          <TouchableOpacity><Text style={s.dateArrow}>‹</Text></TouchableOpacity>
          <Text style={s.dateText}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
          </Text>
          <TouchableOpacity><Text style={s.dateArrow}>›</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <Text style={s.addBtnText}>+ Einnahme</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── CHART ───────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Deine Tageskurve</Text>
            <Text style={s.nowBadge}>🕐 {fmtHour(now)} Uhr</Text>
          </View>

          {/* Legende */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={s.legendRow}>
              <View style={s.legendItem}>
                <View style={[s.legendLine, { backgroundColor: '#ffffff60' }]} />
                <Text style={[s.legendLabel, { color: C.textDim }]}>Gesamt</Text>
              </View>
              {intakes.map(intake => {
                const sub = getSubstance(intake.substanceId);
                if (!sub) return null;
                const active = selectedId === intake.substanceId;
                return (
                  <TouchableOpacity
                    key={intake.substanceId}
                    style={s.legendItem}
                    onPress={() => setSelectedId(intake.substanceId)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.legendDot, { backgroundColor: sub.color, shadowColor: active ? sub.color : 'transparent', shadowOpacity: 1, shadowRadius: 4, elevation: active ? 4 : 0 }]} />
                    <Text style={[s.legendLabel, { color: active ? sub.color : C.textDim }]}>{sub.effectLabel}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <CurveChart data={chartData} entries={chartEntries} selectedId={selectedId} nowHour={now} height={200} />

          {/* Timeline */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={s.timelineRow}>
              {intakes.map(intake => {
                const sub = getSubstance(intake.substanceId);
                if (!sub) return null;
                return (
                  <TouchableOpacity
                    key={intake.substanceId}
                    style={[s.timelineItem, { opacity: selectedId === intake.substanceId ? 1 : 0.45 }]}
                    onPress={() => setSelectedId(intake.substanceId)}
                    activeOpacity={0.7}
                  >
                    <SubIcon icon={sub.icon} color={sub.color} size={30} />
                    <Text style={s.timelineTime}>{fmtHour(intake.timeH)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── AKTIVE SUBSTANZEN ───────────────── */}
        <View style={s.section}>
          <Text style={s.cardTitle}>Aktive Substanzen ({activeIntakes.length})</Text>

          {activeIntakes.length === 0 && (
            <Text style={s.emptyText}>Keine aktiven Substanzen gerade</Text>
          )}

          {activeIntakes.map(intake => {
            const sub = getSubstance(intake.substanceId);
            if (!sub) return null;
            const sel = selectedId === intake.substanceId;
            return (
              <TouchableOpacity
                key={intake.substanceId}
                onPress={() => setSelectedId(intake.substanceId)}
                activeOpacity={0.8}
                style={[s.intakeRow, { backgroundColor: sel ? '#162540' : C.surfaceDim, borderColor: sel ? `${sub.color}50` : C.border }]}
              >
                <View style={s.intakeLeft}>
                  <SubIcon icon={sub.icon} color={sub.color} size={32} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={s.intakeName}>{sub.name}</Text>
                    <Text style={s.intakeDose}>{intake.doseLabel}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.intakeWindowLabel}>Wirkfenster</Text>
                  <Text style={[s.intakeRemaining, { color: sub.color }]}>{getRemainingTime(intake, now)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── SUBSTANZ-DETAILS ────────────────── */}
        {selectedSub && selectedIntake && (() => {
          const effects = Object.entries(selectedSub.effects as Record<string, number | undefined>)
            .filter(([, v]) => (v ?? 0) > 0)
            .map(([k]) => EFFECT_LABELS[k] ?? k)
            .slice(0, 3);
          const currentEffect = getCurrentEffect(selectedId, chartData, now);

          return (
            <View style={s.section}>
              <Text style={s.cardTitle}>Substanz-Details</Text>
              <View style={s.detailHeader}>
                <SubIcon icon={selectedSub.icon} color={selectedSub.color} size={38} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={s.detailName}>{selectedSub.name}</Text>
                  <Text style={s.detailDose}>{selectedIntake.doseLabel} · {fmtHour(selectedIntake.timeH)} Uhr</Text>
                </View>
              </View>

              <View style={s.badgeRow}>
                <Text style={s.badgeIntro}>Wirkung: </Text>
                {effects.map(e => (
                  <View key={e} style={[s.badge, { backgroundColor: `${selectedSub.color}20`, borderColor: `${selectedSub.color}35` }]}>
                    <Text style={[s.badgeText, { color: selectedSub.color }]}>{e}</Text>
                  </View>
                ))}
              </View>

              <View style={s.pkGrid}>
                {[
                  ['Peak',             getPeakLabel(selectedIntake.timeH, selectedId)],
                  ['Wirkdauer',        `${selectedSub.pk.durationHours} Std`],
                  ['Halbwertszeit',    `~${selectedSub.pk.halflifeHours} Std`],
                  ['Bioverfügbarkeit', `~${selectedSub.pk.bioavailability}%`],
                ].map(([k, v]) => (
                  <View key={k} style={s.pkCell}>
                    <Text style={s.pkLabel}>{k}</Text>
                    <Text style={s.pkValue}>{v}</Text>
                  </View>
                ))}
              </View>

              {/* Aktuelle Wirkung — prominent */}
              <View style={[s.effectBox, { borderColor: `${selectedSub.color}30` }]}>
                <Text style={s.effectLabel}>Aktuelle Wirkung</Text>
                <Text style={[s.effectValue, { color: selectedSub.color }]}>{currentEffect}%</Text>
              </View>

              {selectedSub.warnings?.[0] && (
                <View style={s.warnBox}>
                  <Text style={s.warnText}>⚠️ {selectedSub.warnings[0]}</Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* ── WECHSELWIRKUNGEN ────────────────── */}
        <View style={s.section}>
          <Text style={s.cardTitle}>Überlagerungen · {interactions.length} erkannt</Text>
          {interactions.length === 0 && (
            <Text style={s.emptyText}>Keine Wechselwirkungen zwischen aktiven Substanzen</Text>
          )}
          {interactions.map((ix: any, i: number) => {
            const subA = getSubstance(ix.a);
            const subB = getSubstance(ix.b);
            const ixMeta = IX_TYPE[ix.type] ?? IX_TYPE.mixed;
            const sevColor = ix.type === 'synergy' ? '#4ade80' : IX_SEVERITY_COLOR[ix.severity] ?? '#94a3b8';
            return (
              <View key={i} style={s.ixCard}>
                <View style={s.ixHeader}>
                  <View style={s.ixIcons}>
                    {[subA, subB].filter(Boolean).map((sub: any) => (
                      <SubIcon key={sub.id} icon={sub.icon} color={sub.color} size={24} />
                    ))}
                    <Text style={s.ixSubNames} numberOfLines={1}>{subA?.name} + {subB?.name}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: `${sevColor}20`, borderColor: `${sevColor}35` }]}>
                    <Text style={[s.badgeText, { color: sevColor }]}>{ixMeta.tag}</Text>
                  </View>
                </View>
                <Text style={s.ixNote} numberOfLines={3}>{ix.note}</Text>
                <Text style={s.ixSeverity}>
                  Stärke: <Text style={{ color: sevColor, fontWeight: '600' }}>{IX_SEVERITY_LABEL[ix.severity]}</Text>
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── ZIELE ───────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.cardTitle}>Deine Ziele</Text>
            <TouchableOpacity><Text style={s.linkText}>Bearbeiten</Text></TouchableOpacity>
          </View>
          {GOALS.map(g => (
            <View key={g.label} style={{ marginBottom: 12 }}>
              <View style={s.goalRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <SubIcon icon={g.icon} color={g.col} size={18} />
                  <Text style={s.goalLabel}>{g.label}</Text>
                </View>
                <Text style={[s.goalPct, { color: g.col }]}>{g.pct}%</Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressBar, { width: `${g.pct}%` as any, backgroundColor: g.col }]} />
              </View>
            </View>
          ))}
        </View>

        {/* ── INSIGHTS ────────────────────────── */}
        <View style={[s.section, { marginBottom: 20 }]}>
          <Text style={s.cardTitle}>💡 Tages-Insights</Text>
          {[
            'Dein Koffein-Peak trifft dein Leistungstief – gute Timing-Optimierung!',
            'Magnesium am Abend unterstützt deine Regeneration.',
          ].map((t, i) => (
            <View key={i} style={s.insightCard}>
              <Text style={s.insightText}>{t}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── MODAL ───────────────────────────── */}
      <AddIntakeModal visible={modalVisible} onClose={() => setModalVisible(false)} />

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.borderDim, backgroundColor: '#070e1a' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoIcon: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#1a3a5a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${C.accent}40` },
  logoText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateArrow: { fontSize: 16, color: C.textDim, paddingHorizontal: 4 },
  dateText: { fontSize: 12, fontWeight: '600', color: C.text },
  addBtn: { backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 6 },
  addBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  section: { backgroundColor: C.surface, marginHorizontal: 12, marginTop: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  nowBadge: { fontSize: 11, color: C.textDim, backgroundColor: C.surfaceDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 12 },

  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLine: { width: 20, height: 2, borderRadius: 1 },
  legendLabel: { fontSize: 11 },

  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 4, paddingVertical: 4 },
  timelineItem: { alignItems: 'center', gap: 3 },
  timelineTime: { fontSize: 10, color: C.textDim },

  intakeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 10, marginBottom: 6, borderWidth: 1 },
  intakeLeft: { flexDirection: 'row', alignItems: 'center' },
  intakeName: { fontSize: 12, fontWeight: '600', color: '#dde6f4' },
  intakeDose: { fontSize: 10, color: C.textDim, marginTop: 1 },
  intakeWindowLabel: { fontSize: 9, color: C.textDim, marginBottom: 1 },
  intakeRemaining: { fontSize: 11, fontWeight: '600' },

  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  detailDose: { fontSize: 11, color: C.textDim, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  badgeIntro: { fontSize: 11, color: C.textDim },
  badge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  pkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  pkCell: { backgroundColor: C.surfaceDim, borderRadius: 9, padding: 9, width: '47.5%' },
  pkLabel: { fontSize: 10, color: C.textDim, marginBottom: 3 },
  pkValue: { fontSize: 11, fontWeight: '600', color: '#cbd5e1' },
  effectBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surfaceDim, borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 8 },
  effectLabel: { fontSize: 11, color: C.textDim },
  effectValue: { fontSize: 24, fontWeight: '800' },
  warnBox: { backgroundColor: '#f8717112', borderRadius: 9, padding: 10, borderWidth: 1, borderColor: '#f8717130' },
  warnText: { fontSize: 11, color: '#fca5a5', lineHeight: 17 },

  ixCard: { backgroundColor: C.surfaceDim, borderRadius: 10, padding: 11, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  ixHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  ixIcons: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  ixSubNames: { fontSize: 11, fontWeight: '600', color: '#cbd5e1', marginLeft: 2, flexShrink: 1 },
  ixNote: { fontSize: 11, color: C.textDim, lineHeight: 17, marginBottom: 4 },
  ixSeverity: { fontSize: 10, color: '#374560' },

  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  goalLabel: { fontSize: 11, color: C.textMuted },
  goalPct: { fontSize: 11, fontWeight: '700' },
  progressTrack: { height: 5, backgroundColor: '#1e2d45', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },

  insightCard: { backgroundColor: C.surfaceDim, borderRadius: 9, padding: 10, marginBottom: 8, borderLeftWidth: 2, borderLeftColor: C.accent, borderWidth: 1, borderColor: C.border },
  insightText: { fontSize: 11, color: '#8899b0', lineHeight: 18 },
  emptyText: { fontSize: 11, color: '#2d3f5a', textAlign: 'center', paddingVertical: 12 },
  linkText: { fontSize: 11, color: C.accent },
});
