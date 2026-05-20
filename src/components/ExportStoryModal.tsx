/**
 * ExportStoryModal — Instagram Story Export (9:16 JPEG)
 *
 * Rendert eine schöne Story-Karte mit den Einnahmen des gewählten Zeitraums,
 * nimmt einen Screenshot via react-native-view-shot und teilt/speichert die Datei.
 */
import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useThemeStore } from '../store/themeStore';
import { useIntakeStore } from '../store/intakeStore';
import { getSubstance } from '../data/substanceDB';
import { fmtHour, buildChartData } from '../utils/pkHelpers';
import type { Intake } from '../utils/pkHelpers';

// ── Types ─────────────────────────────────────────────────────

type Period = '1d' | '7d' | '30d';

interface PeriodDef {
  id: Period;
  chip: string;
  title: string;
  days: number;
}

const PERIODS: PeriodDef[] = [
  { id: '1d',  chip: '1 Tag',   title: 'DEIN TAG',   days: 1  },
  { id: '7d',  chip: '1 Woche', title: 'DEINE WOCHE', days: 7  },
  { id: '30d', chip: '1 Monat', title: 'DEIN MONAT',  days: 30 },
];

// ── Helpers ───────────────────────────────────────────────────

function dateLabel(period: Period): string {
  const now = new Date();
  if (period === '1d') {
    return now.toLocaleDateString('de-DE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }
  const days = period === '7d' ? 6 : 29;
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  const fromStr = from.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
  const toStr = now.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${fromStr} – ${toStr}`;
}

function filterIntakes(intakes: Intake[], period: Period): Intake[] {
  const now = new Date();
  const days = period === '1d' ? 1 : period === '7d' ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

  return intakes.filter(i => {
    if (i.takenAt) {
      return new Date(i.takenAt) >= cutoff;
    }
    // No timestamp → treat as today
    return period === '1d';
  });
}

function intakeTime(i: Intake): string {
  if (i.takenAt) {
    return new Date(i.takenAt).toLocaleTimeString('de-DE', {
      hour: '2-digit', minute: '2-digit',
    });
  }
  return fmtHour(i.timeH);
}

function intakeDay(i: Intake): string {
  if (!i.takenAt) return 'Heute';
  const d = new Date(i.takenAt);
  const today = new Date();
  const diff = Math.round((today.setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Mini PK Curve Chart (1d) ──────────────────────────────────

const CHART_W = 272;
const CHART_H = 90;
const CHART_PAD = { t: 6, b: 10, l: 2, r: 2 };
const innerW = CHART_W - CHART_PAD.l - CHART_PAD.r;
const innerH = CHART_H - CHART_PAD.t - CHART_PAD.b;

function MiniCurveChart({ intakes }: { intakes: Intake[] }) {
  const chartData = useMemo(() => buildChartData(intakes), [intakes]);
  const subIds    = useMemo(() => [...new Set(intakes.map(i => i.substanceId))], [intakes]);
  const windowHours = (chartData.length - 1) / 2;

  const nowH = (Date.now() - (() => {
    const m = new Date(); m.setHours(0, 0, 0, 0); return m.getTime();
  })()) / 3_600_000;

  const xOf = (h: number) =>
    CHART_PAD.l + Math.min(1, Math.max(0, h / windowHours)) * innerW;
  const yOf = (v: number) =>
    CHART_PAD.t + innerH - (Math.min(100, Math.max(0, v)) / 100) * innerH;

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Horizontal baseline */}
      <Line
        x1={CHART_PAD.l} y1={CHART_PAD.t + innerH}
        x2={CHART_PAD.l + innerW} y2={CHART_PAD.t + innerH}
        stroke="#1e293b" strokeWidth={1}
      />

      {/* Per-substance curve */}
      {subIds.map(subId => {
        const sub = getSubstance(subId);
        if (!sub) return null;

        // Build smooth polyline from chart data
        const pts = chartData
          .map((row, i) => {
            const v = (row[subId] as number) ?? 0;
            return `${xOf(i / 2).toFixed(1)},${yOf(v).toFixed(1)}`;
          })
          .join(' ');

        return (
          <Path
            key={subId}
            d={`M ${pts}`}
            fill="none"
            stroke={sub.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}

      {/* NOW line */}
      {nowH >= 0 && nowH <= windowHours && (
        <Line
          x1={xOf(nowH)} y1={CHART_PAD.t}
          x2={xOf(nowH)} y2={CHART_PAD.t + innerH}
          stroke="#ffffff" strokeWidth={1.2}
          strokeDasharray="3,4"
          opacity={0.5}
        />
      )}

      {/* Hour ticks at 0, 6, 12, 18, 24 */}
      {[0, 6, 12, 18, 24].map(h => {
        if (h > windowHours) return null;
        const x = xOf(h);
        return (
          <Line
            key={h}
            x1={x} y1={CHART_PAD.t + innerH}
            x2={x} y2={CHART_PAD.t + innerH + 3}
            stroke="#334155" strokeWidth={1}
          />
        );
      })}
    </Svg>
  );
}

// ── Mini Activity Chart (7d / 30d) ────────────────────────────

function MiniActivityChart({ intakes, period }: { intakes: Intake[]; period: Period }) {
  const days = period === '7d' ? 7 : 30;
  const W = CHART_W, H = 60;
  const colW = W / days;

  // Build a map: dayIndex → array of substance colors (newest day = right)
  const now = new Date();
  const dayBuckets: string[][] = Array.from({ length: days }, () => []);

  intakes.forEach(i => {
    const ts = i.takenAt ? new Date(i.takenAt) : new Date();
    const diffDays = Math.floor(
      (now.setHours(0,0,0,0) - ts.setHours(0,0,0,0)) / 86_400_000,
    );
    if (diffDays >= 0 && diffDays < days) {
      const bucketIdx = days - 1 - diffDays; // 0 = oldest, days-1 = today
      const sub = getSubstance(i.substanceId);
      if (sub) dayBuckets[bucketIdx].push(sub.color);
    }
  });

  return (
    <Svg width={W} height={H}>
      {dayBuckets.map((colors, dayIdx) => {
        const cx = dayIdx * colW + colW / 2;
        if (colors.length === 0) {
          // Empty day marker
          return (
            <Circle key={dayIdx} cx={cx} cy={H / 2} r={3}
              fill="#1e293b" />
          );
        }
        return colors.slice(0, 4).map((color, ci) => (
          <Circle
            key={`${dayIdx}-${ci}`}
            cx={cx}
            cy={H / 2 - (colors.length - 1) * 5 / 2 + ci * 5}
            r={4}
            fill={color}
            opacity={0.85}
          />
        ));
      })}
      {/* Baseline */}
      <Line x1={0} y1={H - 4} x2={W} y2={H - 4}
        stroke="#1e293b" strokeWidth={1} />
    </Svg>
  );
}

// ── Story Card (this View gets screenshot'd) ──────────────────

interface StoryCardProps {
  period: Period;
  intakes: Intake[];
}

function StoryCard({ period, intakes }: StoryCardProps) {
  const periodDef = PERIODS.find(p => p.id === period)!;
  const label = dateLabel(period);
  const substanceCount = new Set(intakes.map(i => i.substanceId)).size;

  // Sort: newest first → group by day
  const sorted = [...intakes].sort((a, b) => {
    const ta = a.takenAt ? new Date(a.takenAt).getTime() : Date.now();
    const tb = b.takenAt ? new Date(b.takenAt).getTime() : Date.now();
    return tb - ta;  // newest first
  });

  const shown = sorted.slice(0, 5);
  const overflow = sorted.length - shown.length;

  return (
    <View style={sc.card}>
      {/* ── decorative glow blobs ─────────────────────────── */}
      <View style={sc.blob1} />
      <View style={sc.blob2} />
      <View style={sc.blob3} />

      {/* ── header: logo ─────────────────────────────────── */}
      <View style={sc.logoRow}>
        <View style={sc.logoBox}>
          <Text style={sc.logoWave}>〜</Text>
        </View>
        <Text style={sc.logoText}>CurveDay</Text>
      </View>

      {/* ── period + date ─────────────────────────────────── */}
      <View style={sc.titleBlock}>
        <Text style={sc.periodTitle}>{periodDef.title}</Text>
        <View style={sc.accentBar} />
        <Text style={sc.dateText}>{label}</Text>
      </View>

      {/* ── divider ───────────────────────────────────────── */}
      <View style={sc.divider} />

      {/* ── mini chart ────────────────────────────────────── */}
      <View style={sc.chartWrapper}>
        {period === '1d'
          ? <MiniCurveChart intakes={intakes} />
          : <MiniActivityChart intakes={intakes} period={period} />
        }
        <View style={sc.chartLabel}>
          <Text style={sc.chartLabelText}>
            {period === '1d' ? '— Wirkungsverlauf heute' : `— Einnahmen letzte ${period === '7d' ? '7' : '30'} Tage`}
          </Text>
        </View>
      </View>

      {/* ── list + stats + footer (flex: 1, space-between ensures footer always visible) */}
      <View style={sc.bottomSection}>

        {/* intake list */}
        <View style={sc.intakeList}>
          {shown.map((intake, idx) => {
            const sub = getSubstance(intake.substanceId);
            if (!sub) return null;
            return (
              <View key={`${intake.id}-${idx}`} style={sc.intakeRow}>
                <View style={[sc.intakeBar, { backgroundColor: sub.color }]} />
                <View style={[sc.iconBubble, { backgroundColor: `${sub.color}22` }]}>
                  <Text style={sc.iconText}>{sub.icon}</Text>
                </View>
                <View style={sc.intakeInfo}>
                  <Text style={sc.intakeName} numberOfLines={1}>{sub.name}</Text>
                  <Text style={sc.intakeMeta}>
                    {intake.doseLabel}{'  ·  '}
                    {period !== '1d' && `${intakeDay(intake)}, `}
                    {intakeTime(intake)}
                  </Text>
                </View>
                <View style={[sc.effectDot, { backgroundColor: sub.color }]} />
              </View>
            );
          })}
          {overflow > 0 && (
            <Text style={sc.overflowText}>+{overflow} weitere Einnahme{overflow !== 1 ? 'n' : ''}</Text>
          )}
          {shown.length === 0 && (
            <View style={sc.emptySlot}>
              <Text style={sc.emptySlotText}>Keine Einnahmen in diesem Zeitraum</Text>
            </View>
          )}
        </View>

        {/* stats row */}
        <View style={sc.statsRow}>
          <View style={sc.statItem}>
            <Text style={sc.statVal}>{intakes.length}</Text>
            <Text style={sc.statLbl}>{intakes.length === 1 ? 'Einnahme' : 'Einnahmen'}</Text>
          </View>
          <View style={sc.statSep} />
          <View style={sc.statItem}>
            <Text style={sc.statVal}>{substanceCount}</Text>
            <Text style={sc.statLbl}>{substanceCount === 1 ? 'Substanz' : 'Substanzen'}</Text>
          </View>
          {intakes.length > 0 && (
            <>
              <View style={sc.statSep} />
              <View style={sc.statItem}>
                <Text style={sc.statVal}>{new Set(intakes.map(i => intakeDay(i))).size}</Text>
                <Text style={sc.statLbl}>{period === '1d' ? 'Heute' : 'Tage'}</Text>
              </View>
            </>
          )}
        </View>

        {/* footer — always pinned to bottom via space-between */}
        <View style={sc.footer}>
          <View style={sc.footerLine} />
          <Text style={sc.footerBrand}>📲  curveday.app</Text>
        </View>

      </View>
    </View>
  );
}

// ── Main Modal ────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ExportStoryModal({ visible, onClose }: Props) {
  const { colors: C } = useThemeStore();
  const { intakes } = useIntakeStore();

  const [period, setPeriod] = useState<Period>('1d');
  const [loading, setLoading] = useState(false);

  const cardRef = useRef<View>(null);

  const filtered = useMemo(
    () => filterIntakes(intakes, period),
    [intakes, period],
  );

  // ── Actions ─────────────────────────────────────────────────

  async function capture(): Promise<string | null> {
    if (!cardRef.current) {
      Alert.alert('Fehler', 'Karte nicht bereit – bitte kurz warten.');
      return null;
    }
    // Small delay ensures SVG/layout is fully rendered before capture
    await new Promise(res => setTimeout(res, 120));
    try {
      const uri = await captureRef(cardRef, {
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
        snapshotContentContainer: false,
      });
      return uri;
    } catch (e) {
      Alert.alert('Fehler', 'Screenshot konnte nicht erstellt werden.');
      return null;
    }
  }

  async function handleShare() {
    setLoading(true);
    const uri = await capture();
    if (!uri) { setLoading(false); return; }
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Story teilen' });
      } else {
        Alert.alert('Teilen nicht verfügbar', 'Auf diesem Gerät ist Teilen nicht möglich.');
      }
    } catch {}
    setLoading(false);
  }

  async function handleSave() {
    setLoading(true);
    const uri = await capture();
    if (!uri) { setLoading(false); return; }
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Zugriff verweigert', 'Bitte Fotoalbum-Zugriff in den Einstellungen erlauben.');
        setLoading(false);
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('✅ Gespeichert', 'Story wurde im Fotoalbum gespeichert.');
    } catch {
      Alert.alert('Fehler', 'Speichern fehlgeschlagen.');
    }
    setLoading(false);
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[m.container, { backgroundColor: C.bg }]}>

        {/* ── Modal header ──────────────────────────────── */}
        <View style={[m.header, { borderBottomColor: C.border }]}>
          <Text style={[m.headerTitle, { color: C.text }]}>Story exportieren</Text>
          <TouchableOpacity onPress={onClose} style={m.closeBtn}>
            <Text style={[m.closeTxt, { color: C.textDim }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={m.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Period selector ───────────────────────── */}
          <View style={m.chipRow}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setPeriod(p.id)}
                style={[
                  m.chip,
                  { backgroundColor: C.surfaceHigh, borderColor: C.border },
                  period === p.id && { backgroundColor: `${C.accent}18`, borderColor: C.accent },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  m.chipTxt,
                  { color: C.textDim },
                  period === p.id && { color: C.accent, fontWeight: '700' },
                ]}>
                  {p.chip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Intake count hint ─────────────────────── */}
          <Text style={[m.countHint, { color: C.textDim }]}>
            {filtered.length === 0
              ? 'Keine Einnahmen in diesem Zeitraum'
              : `${filtered.length} Einnahme${filtered.length !== 1 ? 'n' : ''} · ${new Set(filtered.map(i => i.substanceId)).size} Substanz${new Set(filtered.map(i => i.substanceId)).size !== 1 ? 'en' : ''}`
            }
          </Text>

          {/* ── Format hint ───────────────────────────── */}
          <Text style={[m.formatHint, { color: C.textDim }]}>
            📐 Instagram Story Format (9:16) · JPEG
          </Text>

        </ScrollView>

        {/* ── Story card preview (outside ScrollView for reliable capture) ── */}
        <View style={m.previewWrapper}>
          <View style={m.cardShadow}>
            <View ref={cardRef} collapsable={false}>
              <StoryCard period={period} intakes={filtered} />
            </View>
          </View>
        </View>

        {/* ── Action buttons ────────────────────────── */}
        <View style={[m.actions, { borderTopColor: C.border, backgroundColor: C.bg }]}>
          {loading ? (
            <ActivityIndicator color={C.accent} size="large" style={{ paddingVertical: 18 }} />
          ) : (
            <>
              <TouchableOpacity
                onPress={handleSave}
                style={[m.btn, m.btnSecondary, { backgroundColor: C.surfaceHigh, borderColor: C.border }]}
                activeOpacity={0.75}
              >
                <Text style={{ fontSize: 18 }}>💾</Text>
                <Text style={[m.btnTxt, { color: C.text }]}>Speichern</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={[m.btn, m.btnPrimary, { backgroundColor: C.accent }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 18 }}>📤</Text>
                <Text style={[m.btnTxt, { color: '#000' }]}>Teilen</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      </View>
    </Modal>
  );
}

// ── Story Card Styles ─────────────────────────────────────────

const CARD_W = 320;
const CARD_H = Math.round(CARD_W * 16 / 9);  // 569px

const sc = StyleSheet.create({
  card: {
    width:           CARD_W,
    height:          CARD_H,
    backgroundColor: '#060c16',
    borderRadius:    20,
    overflow:        'hidden',
    padding:         24,
  },

  // Decorative glow blobs
  blob1: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#38bdf812',
  },
  blob2: {
    position: 'absolute', bottom: 60, left: -80,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#818cf80e',
  },
  blob3: {
    position: 'absolute', top: '45%', right: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#0ea5e910',
  },

  // Logo row
  logoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18,
  },
  logoBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#38bdf818',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#38bdf830',
  },
  logoWave:  { fontSize: 14, color: '#38bdf8' },
  logoText:  { fontSize: 14, fontWeight: '800', color: '#e2e8f0', letterSpacing: 0.2 },

  // Title block
  titleBlock: { marginBottom: 14 },
  periodTitle: {
    fontSize: 28, fontWeight: '900', color: '#f8fafc',
    letterSpacing: -0.5, marginBottom: 6,
  },
  accentBar: {
    width: 36, height: 3, borderRadius: 2,
    backgroundColor: '#38bdf8', marginBottom: 6,
  },
  dateText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },

  divider: {
    height: 1, backgroundColor: '#1e293b', marginBottom: 10,
  },

  // Mini chart
  chartWrapper: {
    marginBottom: 10,
    backgroundColor: '#080f1a',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chartLabel: { paddingHorizontal: 10, marginTop: 2 },
  chartLabelText: { fontSize: 8, color: '#334155', fontWeight: '500' },

  // Bottom section: flex:1 container that spaces list / stats / footer
  bottomSection: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Intake list
  intakeList: {},
  intakeRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 7, marginBottom: 5,
  },
  intakeBar: { width: 2.5, height: 30, borderRadius: 2 },
  iconBubble: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 13 },
  intakeInfo: { flex: 1 },
  intakeName: { fontSize: 11, fontWeight: '700', color: '#e2e8f0', marginBottom: 1 },
  intakeMeta: { fontSize: 9, color: '#64748b' },
  effectDot:  { width: 5, height: 5, borderRadius: 2.5, opacity: 0.8 },

  overflowText: { fontSize: 9, color: '#475569', marginTop: 2, paddingLeft: 10 },
  emptySlot: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  emptySlotText: { fontSize: 11, color: '#475569', textAlign: 'center' },

  // Stats row
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#0f1e2e', borderRadius: 10,
  },
  statItem:  { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 18, fontWeight: '800', color: '#38bdf8' },
  statLbl:   { fontSize: 8, color: '#64748b', marginTop: 1, fontWeight: '500' },
  statSep:   { width: 1, height: 24, backgroundColor: '#1e293b' },

  // Footer — always sits at bottom thanks to space-between on bottomSection
  footer: { paddingTop: 8 },
  footerLine: { height: 1, backgroundColor: '#1e293b', marginBottom: 6 },
  footerBrand: { fontSize: 9.5, color: '#475569', textAlign: 'center', letterSpacing: 0.5 },
});

// ── Modal Styles ──────────────────────────────────────────────

const m = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  closeBtn: { padding: 6 },
  closeTxt:  { fontSize: 18 },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, alignItems: 'center' },

  // Period chips
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1,
  },
  chipTxt: { fontSize: 14, fontWeight: '500' },

  // Count hint
  countHint: { fontSize: 12, marginBottom: 20 },

  // Card preview
  previewWrapper: { alignItems: 'center', marginBottom: 12 },
  cardShadow: {
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },

  // Format hint
  formatHint: { fontSize: 11, marginTop: 4 },

  // Actions
  actions: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1,
  },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 15,
  },
  btnSecondary: { borderWidth: 1 },
  btnPrimary:   {},
  btnTxt: { fontSize: 15, fontWeight: '700' },
});
