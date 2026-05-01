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
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useThemeStore } from '../store/themeStore';
import { useIntakeStore } from '../store/intakeStore';
import { getSubstance } from '../data/substanceDB';
import { fmtHour } from '../utils/pkHelpers';
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

  const shown = sorted.slice(0, 7);
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
    if (!cardRef.current) return null;
    try {
      const uri = await captureRef(cardRef, {
        format: 'jpg',
        quality: 0.98,
        result: 'tmpfile',
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

          {/* ── Story card preview ────────────────────── */}
          <View style={m.previewWrapper}>
            {/* Shadow ring */}
            <View style={m.cardShadow}>
              <View ref={cardRef} collapsable={false}>
                <StoryCard period={period} intakes={filtered} />
              </View>
            </View>
          </View>

          {/* ── Format hint ───────────────────────────── */}
          <Text style={[m.formatHint, { color: C.textDim }]}>
            📐 Instagram Story Format (9:16) · JPEG
          </Text>

        </ScrollView>

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
    height: 1, backgroundColor: '#1e293b', marginBottom: 12,
  },

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
