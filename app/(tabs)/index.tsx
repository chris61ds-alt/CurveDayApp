import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Easing, Platform, Modal, Pressable, useWindowDimensions, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import Reanimated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useIntakeStore } from '../../src/store/intakeStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useReminderStore } from '../../src/store/reminderStore';
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
import type { Strings } from '../../src/i18n/strings';

const MASCOT_IMAGES: Record<string, any> = {
  tired:            require('../../assets/state/tired.jpeg'),
  energetic:        require('../../assets/state/energetic.jpeg'),
  nervous:          require('../../assets/state/nervous.jpeg'),
  focused:          require('../../assets/state/focused.jpeg'),
  dizzy:            require('../../assets/state/dizzy.jpeg'),
  happy:            require('../../assets/state/happy.jpeg'),
  relaxed:          require('../../assets/state/relaxed.jpeg'),
  confused:         require('../../assets/state/confused.jpeg'),
  peacefull:        require('../../assets/state/peacefull.jpeg'),
  anxious:          require('../../assets/state/anxious.jpeg'),
  energeticFocused: require('../../assets/state/Energetic + Focused.jpeg'),
  euphoricMuted:    require('../../assets/state/Euphoric + Muted.jpeg'),
  focusedConfused:  require('../../assets/state/Focused + Confused.jpeg'),
  nervousTired:     require('../../assets/state/Nervous + Tired.jpeg'),
  tiredDizzy:       require('../../assets/state/tired&dizzy.jpeg'),
};

function getStateMap(t: Strings): Record<string, { label: string; emoji: string; color: string }> {
  return {
    pain:            { label: t.statePain,          emoji: '🛡️', color: '#c084fc' },
    sleep:           { label: t.stateSleep,          emoji: '😴', color: '#818cf8' },
    relaxation:      { label: t.stateRelaxation,     emoji: '😌', color: '#818cf8' },
    anxietyReduction:{ label: t.stateAnxiety,        emoji: '🧘', color: '#34d399' },
    concentration:   { label: t.stateConcentration,  emoji: '🎯', color: '#38bdf8' },
    impulseControl:  { label: t.stateFocus,          emoji: '🎯', color: '#38bdf8' },
    focus:           { label: t.stateFocus,          emoji: '🎯', color: '#38bdf8' },
    energy:          { label: t.stateEnergy,         emoji: '⚡', color: '#f59e0b' },
    mood:            { label: t.stateMood,           emoji: '😊', color: '#fb923c' },
    alertness:       { label: t.stateAlertness,      emoji: '✨', color: '#38bdf8' },
    disinhibition:   { label: t.stateDisinhibition,  emoji: '☺️', color: '#94a3b8' },
    muscleRelax:     { label: t.stateMuscleRelax,    emoji: '💆', color: '#4ade80' },
    cardiovascular:  { label: t.stateCardio,         emoji: '❤️', color: '#f87171' },
    stressReduction: { label: t.stateStress,         emoji: '🌿', color: '#4ade80' },
    antihistamine:   { label: t.stateAntihistamine,  emoji: '🌸', color: '#34d399' },
    acidSuppression: { label: t.stateAcid,           emoji: '✨', color: '#a3e635' },
    bloodPressure:   { label: t.stateBloodPressure,  emoji: '💗', color: '#f87171' },
    fatigueReduction:{ label: t.stateFatigue,        emoji: '💪', color: '#f59e0b' },
    cognition:       { label: t.stateCognition,      emoji: '🧠', color: '#38bdf8' },
    // unmapped effects → sensible fallbacks so mascot never gets null
    immunity:        { label: 'Immunsystem',   emoji: '🛡️', color: '#4ade80' },
    antioxidant:     { label: 'Antioxidans',   emoji: '🌿', color: '#4ade80' },
    inflammation:    { label: 'Entzündung ↓',  emoji: '🛡️', color: '#c084fc' },
    fever:           { label: 'Fieber ↓',      emoji: '🛡️', color: '#c084fc' },
    strength:        { label: 'Kraft',         emoji: '💪', color: '#f59e0b' },
  };
}

// Effekte die man nicht aktiv "fühlt" — passive Symptomreduktion, keine Stimmungs-/Energiewirkung
const BACKGROUND_EFFECTS = new Set([
  'pain', 'fever', 'inflammation', 'acidSuppression',
  'bloodPressure', 'cardiovascular', 'antihistamine',
  'immunity', 'antioxidant', 'strength',
]);

function computeCurrentState(
  activeIntakes: any[],
  chartData: any[],
  now: number,
  t: Strings,
): { label: string; emoji: string; color: string; strength: string } | null {
  const totals: Record<string, number> = {};
  for (const intake of activeIntakes) {
    const sub = getSubstance(intake.substanceId);
    if (!sub) continue;
    // Chronische Substanzen (z.B. Vitamine, Supplemente) → kein Momentangefühl
    if (sub.pk?.curveType === 'chronic') continue;
    // Substanzen bei denen ALLE Effekte nur passiv/medizinisch sind (z.B. Ibuprofen, Paracetamol)
    // → man merkt die Schmerzreduktion, aber kein psychoaktives Erlebnis
    const feltEffects = Object.entries(sub.effects as Record<string, number>)
      .filter(([k, v]) => (v as number) > 0 && !BACKGROUND_EFFECTS.has(k));
    if (feltEffects.length === 0) continue;
    const eff = getCurrentEffect(intake.substanceId, chartData, now) / 100;
    for (const [key, val] of Object.entries(sub.effects as Record<string, number>)) {
      if (typeof val === 'number' && val > 0 && !BACKGROUND_EFFECTS.has(key)) {
        totals[key] = (totals[key] ?? 0) + val * eff;
      }
    }
  }
  // Walk down sorted effects until one maps — avoids null when top effect isn't in stateMap
  const sorted  = Object.entries(totals).sort(([, a], [, b]) => b - a);
  if (!sorted.length) return null;
  const stateMap = getStateMap(t);
  const entry    = sorted.find(([k]) => stateMap[k]);
  if (!entry) return null;
  const mapped   = stateMap[entry[0]];
  const strength = entry[1] > 60 ? t.homeStateStrong : entry[1] > 25 ? t.homeStateModerate : t.homeStateLight;
  return { ...mapped, strength };
}

function getMascotKey(
  state: { label: string; emoji: string; color: string; strength: string } | null,
  activeCount: number,
  interactions: any[],
  substanceIds: string[],
  intakes: any[],
): string {
  // Nur psychoaktiv spürbare, akute Substanzen zählen für den Mascot-Zustand.
  // Chronische (Vitamine) und rein medizinische (Schmerzmittel, Antihistaminika …) raus.
  const acuteIds = substanceIds.filter(id => {
    const sub = getSubstance(id);
    if (!sub || sub.pk?.curveType === 'chronic') return false;
    const feltEffects = Object.entries(sub.effects as Record<string, number>)
      .filter(([k, v]) => (v as number) > 0 && !BACKGROUND_EFFECTS.has(k));
    return feltEffects.length > 0; // mindestens ein spürbarer Effekt
  });
  if (acuteIds.length === 0) return activeCount === 0 ? 'happy' : 'relaxed';

  const hasCritical = interactions.some((ix: any) => ix.severity === 'critical');
  if (hasCritical) return 'anxious';

  const hasHigh    = interactions.some((ix: any) => ix.severity === 'high');
  const hasAlcohol = acuteIds.some(id => ['alkohol','bier_klein','bier_gross','wein_rot','wein_weiss','cocktail','shot','sekt'].includes(id));
  const hasADHD    = acuteIds.some(id => ['mph_ir','mph_la','lisdex','adderall'].includes(id));
  const hasCaffeine= acuteIds.some(id => ['koffein','espresso','energy_drink','filter_coffee','kaffee_filter','cold_brew'].includes(id));
  const hasSleep   = acuteIds.some(id => ['melatonin','zolpidem','diazepam','lorazepam'].includes(id));
  const hasPain    = acuteIds.some(id => ['ibuprofen','paracetamol','aspirin','naproxen','diclofenac'].includes(id));

  if (hasHigh && acuteIds.length >= 2) return 'nervous';
  if (hasADHD && hasCaffeine) return 'energeticFocused';
  if (hasAlcohol && acuteIds.length >= 2) return 'euphoricMuted';
  if (hasAlcohol) return 'dizzy';
  if (hasSleep) return 'tired';
  if (hasPain && acuteIds.length === 1) return 'relaxed';
  // confused only when truly contradictory: many substances + high-severity interaction
  const hasHighOrCritical = interactions.some((ix: any) => ix.severity === 'high' || ix.severity === 'critical');
  if (acuteIds.length >= 4 && hasHighOrCritical) return 'confused';
  if (!state) return 'happy';

  const isStrong = state.strength === 'stark' || state.strength === 'strong';
  switch (state.emoji) {
    case '🎯': return hasADHD ? 'energeticFocused' : 'focused';
    case '⚡': return isStrong ? 'energetic' : 'energetic';
    case '✨': return 'focused';
    case '🧠': return 'focused';
    case '💪': return 'energetic';
    case '😴': return 'tired';
    case '😌': return 'relaxed';
    case '🧘': return 'peacefull';
    case '🌿': return 'peacefull';
    case '😊': return 'happy';
    case '💆': return 'relaxed';
    case '🛡️': return 'relaxed';
    case '☺️': return 'happy';
    case '❤️': return 'happy';
    case '💗': return 'happy';
    case '🌸': return 'happy';
    default:   return 'happy';
  }
}

function getGreeting(nowH: number): string {
  if (nowH >= 5  && nowH < 12) return 'Guten Morgen ☀️';
  if (nowH >= 12 && nowH < 17) return 'Guten Tag 👋';
  if (nowH >= 17 && nowH < 22) return 'Guten Abend 🌙';
  return 'Nacht-Eule 🦉';
}

// Wirkphase einer Substanz: aufsteigend / Peak / abklingend
function getPhase(intake: any, now: number): 'rising' | 'peak' | 'falling' {
  const sub = getSubstance(intake.substanceId);
  if (!sub) return 'falling';
  const takenH = intake.takenAt
    ? (new Date(intake.takenAt).getTime() - new Date().setHours(0,0,0,0)) / 3_600_000
    : intake.timeH;
  const peakH = takenH + sub.pk.tmaxHours;
  if (now < peakH - 0.08) return 'rising';
  if (now < peakH + 0.5)  return 'peak';
  return 'falling';
}

// "vor 2h 30min" etc.
function timeAgo(takenAt: string): string {
  const ms = Date.now() - new Date(takenAt).getTime();
  const h  = Math.floor(ms / 3_600_000);
  const m  = Math.floor((ms % 3_600_000) / 60_000);
  if (h === 0) return `vor ${m} min`;
  return `vor ${h}h${m > 0 ? ` ${m}m` : ''}`;
}

// Einnahme-Uhrzeit formatiert
function intakeTimeLabel(intake: any): string {
  const d = intake.takenAt ? new Date(intake.takenAt) : null;
  if (!d) return fmtHour(intake.timeH);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ── Animated card: Reanimated spring entrance ────────────────
function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  return (
    <Reanimated.View
      entering={FadeInDown.delay(delay).springify().damping(16).stiffness(130)}
      style={style}
    >
      {children}
    </Reanimated.View>
  );
}

export default function TageskurveScreen() {
  const { intakes, selectedId, setSelectedId, hydrate, hydrated, removeIntake, addIntake, togglePin } = useIntakeStore();
  const { colors: C } = useThemeStore();
  const { prefs } = useOnboardingStore();
  const { reminders, hydrate: hydrateReminders } = useReminderStore();
  const t = useT();
  const now = useNow();
  const insets = useSafeAreaInsets();

  // Sleep window from profile (default: 23:00 → 07:00)
  const sleepWindow = useMemo(() => {
    const s = prefs.profile?.sleepStart;
    const e = prefs.profile?.sleepEnd;
    if (s !== undefined && e !== undefined) return { start: s, end: e };
    return { start: 23, end: 7 }; // sensible default
  }, [prefs.profile?.sleepStart, prefs.profile?.sleepEnd]);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionSheet, setActionSheet] = useState<{ id: string; name: string; pinned?: boolean } | null>(null);
  const [expandedIx, setExpandedIx] = useState<Set<number>>(new Set());
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [reminderSubstance, setReminderSubstance] = useState<any>(null);
  const { width: screenWidth } = useWindowDimensions();

  // ── Page fade-in ─────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Chart reveal (left→right wipe) ───────────────────────────
  const chartReveal = useRef(new Animated.Value(0)).current;

  // ── FAB glow pulse ───────────────────────────────────────────
  const fabPulse = useRef(new Animated.Value(0)).current;

  // ── XP floats (game-style "+Substance" popups) ───────────────
  type XpFloat = { id: string; text: string; color: string; anim: Animated.Value };
  const [xpFloats, setXpFloats] = useState<XpFloat[]>([]);
  const prevIntakeCount = useRef(0);

  useEffect(() => { hydrate(); hydrateReminders(); }, []);

  function handleLongPressIntake(id: string, name: string, pinned?: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActionSheet({ id, name, pinned });
  }


  // Page fade-in
  useEffect(() => {
    if (hydrated) {
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }).start();
    }
  }, [hydrated]);

  // Chart reveal: wipe left→right whenever intakes change
  useEffect(() => {
    if (!hydrated) return;
    chartReveal.setValue(0);
    Animated.timing(chartReveal, {
      toValue: 1, duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [intakes.length, hydrated]);

  // FAB glow: continuous breathe
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.sin), useNativeDriver: true }),
        Animated.timing(fabPulse, { toValue: 0, duration: 1400, easing: Easing.in(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);


  // XP floats: trigger when a new intake is added
  useEffect(() => {
    if (!hydrated) { prevIntakeCount.current = intakes.length; return; }
    if (intakes.length > prevIntakeCount.current) {
      const newOnes = intakes.slice(prevIntakeCount.current);
      newOnes.forEach((intake, idx) => {
        const sub  = getSubstance(intake.substanceId);
        const anim = new Animated.Value(0);
        const entry: XpFloat = {
          id:    `${intake.id}_${Date.now()}_${idx}`,
          text:  `+ ${sub?.name ?? '✓'}`,
          color: sub?.color ?? '#38bdf8',
          anim,
        };
        setXpFloats(prev => [...prev, entry]);
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }).start(() => {
          setXpFloats(prev => prev.filter(f => f.id !== entry.id));
        });
      });
    }
    prevIntakeCount.current = intakes.length;
  }, [intakes.length, hydrated]);

  const chartData     = useMemo(() => buildChartData(intakes), [intakes]);
  const interactions  = useMemo(() => getActiveInteractions(intakes.map(i => i.substanceId)), [intakes]);
  const activeIntakes = useMemo(() => intakes.filter(i => isActive(i, now)), [intakes, now]);

  // ── Smart Insights ─────────────────────────────────────────────
  // Wann sind alle akuten Substanzen abgebaut?
  const clearanceHour = useMemo(() => {
    let maxH = 0;
    for (const intake of activeIntakes) {
      const sub = getSubstance(intake.substanceId);
      if (!sub || sub.pk?.curveType === 'chronic') continue;
      const takenH = intake.takenAt
        ? (new Date(intake.takenAt).getTime() - new Date().setHours(0,0,0,0)) / 3_600_000
        : intake.timeH;
      const clearH = takenH + sub.pk.durationHours;
      if (clearH > maxH) maxH = clearH;
    }
    return maxH > 0 ? maxH : null;
  }, [activeIntakes]);

  // Welche Substanz erreicht als nächste ihren Peak? (in den nächsten 3h)
  const nextPeak = useMemo(() => {
    let best: { name: string; minutesAway: number } | null = null;
    for (const intake of activeIntakes) {
      const sub = getSubstance(intake.substanceId);
      if (!sub) continue;
      const takenH = intake.takenAt
        ? (new Date(intake.takenAt).getTime() - new Date().setHours(0,0,0,0)) / 3_600_000
        : intake.timeH;
      const peakH = takenH + sub.pk.tmaxHours;
      const minsAway = Math.round((peakH - now) * 60);
      if (minsAway > 0 && minsAway <= 180 && (!best || minsAway < best.minutesAway)) {
        best = { name: sub.name, minutesAway: minsAway };
      }
    }
    return best;
  }, [activeIntakes, now]);

  // Wie viele Einnahmen heute?
  const todayCount = useMemo(() => {
    const todayMs = new Date().setHours(0,0,0,0);
    return intakes.filter(i => i.takenAt && new Date(i.takenAt).getTime() >= todayMs).length;
  }, [intakes]);

  // Ausstehende Erinnerungen: Reminder für Substanzen die heute noch nicht eingenommen wurden
  const pendingReminders = useMemo(() => {
    const todayMs  = new Date().setHours(0, 0, 0, 0);
    const takenTodayIds = new Set(
      intakes
        .filter(i => i.takenAt && new Date(i.takenAt).getTime() >= todayMs)
        .map(i => i.substanceId),
    );
    return reminders
      .filter(r => !takenTodayIds.has(r.substanceId))
      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  }, [reminders, intakes]);

  // Alle heutigen Einnahmen chronologisch für Tages-Zusammenfassung
  const todayIntakes = useMemo(() => {
    const todayMs = new Date().setHours(0,0,0,0);
    return intakes
      .filter(i => i.takenAt && new Date(i.takenAt).getTime() >= todayMs)
      .sort((a, b) => new Date(a.takenAt!).getTime() - new Date(b.takenAt!).getTime());
  }, [intakes]);

  // Peak-Fenster: ≥2 aktive Substanzen gleichzeitig ≥70% Wirkung
  const peakWindowActive = useMemo(() => {
    if (activeIntakes.length < 2) return null;
    const atPeak = activeIntakes.filter(i =>
      getCurrentEffect(i.substanceId, chartData, now) >= 70
    );
    if (atPeak.length < 2) return null;
    return atPeak.map(i => getSubstance(i.substanceId)?.name).filter(Boolean).join(' + ');
  }, [activeIntakes, chartData, now]);

  // Ambient color: drives gradient background + mascot glow
  const ambientColor = useMemo(() => {
    if (activeIntakes.length === 0) return C.accent;
    const st = computeCurrentState(activeIntakes, chartData, now, t);
    return st?.color ?? C.accent;
  }, [activeIntakes, chartData, now, t]);

  // ── Quick-Retake: letzte 24h, nicht mehr aktiv, dedupliziert ──
  const quickRetakes = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const seen = new Set<string>();
    return intakes
      .filter(i => {
        if (isActive(i, now)) return false; // aktive raus
        const ts = i.takenAt ? new Date(i.takenAt).getTime() : null;
        return ts !== null && ts >= cutoff;
      })
      .sort((a, b) =>
        new Date(b.takenAt!).getTime() - new Date(a.takenAt!).getTime()
      )
      .filter(i => {
        if (seen.has(i.substanceId)) return false;
        seen.add(i.substanceId);
        return true;
      });
  }, [intakes, now]);

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

  const peakMarks = useMemo(() => {
    const seen = new Set<string>();
    return intakes
      .map(i => {
        const sub = getSubstance(i.substanceId);
        if (!sub) return null;
        if (seen.has(i.substanceId)) return null; // deduplicate by substance
        seen.add(i.substanceId);
        const intakeH   = i.takenAt
          ? (new Date(i.takenAt).getTime() - new Date().setHours(0,0,0,0)) / 3_600_000
          : i.timeH;
        const peakH     = intakeH + sub.pk.tmaxHours;
        const maxIdx    = chartData.length > 0 ? chartData.length - 1 : 48;
        const peakIndex = Math.min(Math.round(peakH * 2), maxIdx);
        return { substanceId: i.substanceId, peakIndex, color: sub.color, label: fmtHour(peakH) };
      })
      .filter(Boolean) as any[];
  }, [intakes, chartData]);


  // ── Schlaf-Warnung: Stimulanzien noch aktiv bei Schlafbeginn? ──
  // Substanzen mit Wach/Energie/Konzentrations-Effekten
  const STIMULANT_EFFECTS = ['alertness', 'energy', 'concentration', 'impulseControl'];
  const bedtimeWarnings = useMemo(() => {
    if (!chartData.length) return [];
    const bedtimeIdx = Math.min(Math.round(sleepWindow.start * 2), chartData.length - 1);
    const seen = new Set<string>();
    return intakes
      .filter(intake => {
        if (seen.has(intake.substanceId)) return false; // deduplizieren
        const sub = getSubstance(intake.substanceId);
        if (!sub) return false;
        if (sub.pk?.curveType === 'chronic') return false; // Supplemente ignorieren
        const hasStimEffect = STIMULANT_EFFECTS.some(k => (sub.effects as any)[k] > 0);
        if (!hasStimEffect) return false;
        const val = chartData[bedtimeIdx]?.[intake.substanceId];
        const active = typeof val === 'number' && val > 18; // >18% = noch spürbar
        if (active) seen.add(intake.substanceId);
        return active;
      })
      .map(i => {
        const sub = getSubstance(i.substanceId);
        const val = chartData[bedtimeIdx]?.[i.substanceId] as number;
        return { name: sub?.name ?? i.substanceId, color: sub?.color ?? '#fff', val: Math.round(val) };
      });
  }, [chartData, intakes, sleepWindow.start]);

  if (!hydrated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, color: C.textDim }}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Mascot/state computed values (used in both chart area and combined card) ──
  const currentState   = activeIntakes.length > 0 ? computeCurrentState(activeIntakes, chartData, now, t) : null;
  const mascotKey      = getMascotKey(currentState, activeIntakes.length, interactions, activeIntakes.map(i => i.substanceId), activeIntakes);
  const mascotImg      = MASCOT_IMAGES[mascotKey];
  const cardColor      = currentState?.color ?? C.textDim;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── AMBIENT GRADIENT ─────────────────── */}
      <LinearGradient
        colors={[`${ambientColor}22`, `${ambientColor}09`, 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380, zIndex: 0 }}
        pointerEvents="none"
      />

      {/* ── HEADER ─────────────────────────────── */}
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <View style={s.logoRow}>
          <View style={[s.logoIcon, { backgroundColor: C.surfaceHigh, borderColor: `${C.accent}30` }]}>
            <Text style={{ fontSize: 14 }}>〜</Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>CurveDay</Text>
            <Text style={{ fontSize: 13, color: C.textDim, marginTop: 1 }}>{getGreeting(now)}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, color: C.textDim }}>{t.homeDate(new Date())}</Text>
      </View>

      {/* ── EMPTY STATE ──────────────────────── */}
      {intakes.length === 0 && (
        <Animated.View style={[s.emptyState, { opacity: fadeAnim }]}>
          <CurveChart
            data={buildChartData([])} entries={[]} selectedId=""
            nowHour={now} height={160}
          />
          <View style={s.emptyContent}>
            <View style={s.mascotImgWrapper}>
              <Image source={MASCOT_IMAGES.tired} style={[s.mascotImg, { width: 160, height: 80 }]} resizeMode="contain" />
            </View>
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

      {/* ── SCROLLBARER INHALT (Chart + alle Karten scrollen zusammen) ── */}
      <Animated.ScrollView
        style={[
          { flex: 1, opacity: fadeAnim },
          intakes.length === 0 && { display: 'none' },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (Platform.OS === 'ios' ? 100 : 80 + insets.bottom) }}
        scrollEventThrottle={16}
      >

        {/* ── CHART-KARTE (randlos) ── */}
        {intakes.length > 0 && (
          <View style={{ backgroundColor: C.surface, marginBottom: 0 }}>
            <View style={{ position: 'relative', overflow: 'hidden' }}>
              <CurveChart
                data={chartData} entries={chartEntries} selectedId={selectedId}
                nowHour={now} peakMarks={peakMarks}
                sleepWindow={sleepWindow}
                height={310}
                labelNow={t.chartNow}
                labelTomorrow={t.chartTomorrow}
                labelSteadyState={t.chartSteadyState}
                labelSleep={t.chartSleep}
                labelNoIntakes={t.chartNoIntakes}
                gridColor={C.gridLine} labelColor={C.textMuted}
                accentColor={C.accent} isDark={C.isDark}
                onSelectSubstance={setSelectedId}
              />
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute', top: 0, bottom: 0, right: 0,
                  left: chartReveal.interpolate({ inputRange: [0, 1], outputRange: [30, screenWidth + 60] }),
                  backgroundColor: C.surface,
                }}
              />
            </View>
            {peakWindowActive && (
              <View style={[s.peakBanner, { backgroundColor: `${C.accent}12`, borderColor: `${C.accent}30`, marginHorizontal: 14 }]}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.accent }}>⚡ Optimales Wirkfenster</Text>
                <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{peakWindowActive} gleichzeitig auf Peak</Text>
              </View>
            )}
            {bedtimeWarnings.length > 0 && (
              <View style={[s.sleepWarnBox, { backgroundColor: '#818cf808', borderColor: '#818cf830', marginHorizontal: 14 }]}>
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
          </View>
        )}

        {/* ── KOMBINIERTE KARTE: Mascot + Substanzliste ── */}
        <View
          style={[s.card, s.combinedCard, {
            borderColor: `${cardColor}30`,
            backgroundColor: C.isDark ? 'rgba(12,24,40,0.96)' : 'rgba(255,255,255,0.96)',
          }]}
        >

          {/* Drag-Handle */}
          <View style={{ alignItems: 'center', paddingBottom: 12 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} />
          </View>

          {/* Mascot row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            {(() => {
              const imgW = Math.round(screenWidth * 0.22);
              const imgH = Math.round(imgW * 0.72);
              return (
                <View style={[s.mascotImgWrapper, { width: imgW, height: imgH }]}>
                  <Image source={mascotImg} style={{ width: imgW + 8, height: imgH + 8 }} resizeMode="contain" />
                </View>
              );
            })()}
            <View style={{ flex: 1, paddingLeft: 14 }}>
              <Text style={{ fontSize: 19, fontWeight: '800', color: cardColor, letterSpacing: -0.5 }}>
                {activeIntakes.length === 0 ? 'Alles ruhig' : (currentState?.label ?? 'Aktiv')}
              </Text>
              <Text style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>
                {activeIntakes.length === 0
                  ? 'Keine aktiven Substanzen'
                  : `${currentState?.strength ?? ''} · ${activeIntakes.length} aktiv`}
              </Text>
            </View>
          </View>

          {/* Trennlinie + Substanz-Label */}
          {(activeIntakes.length > 0 || quickRetakes.length > 0) && (
            <View style={s.dividerRow}>
              <View style={[s.dividerLine, { backgroundColor: C.border }]} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 12 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textDim, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {t.homeActiveNow}
                </Text>
              </View>
              <View style={[s.dividerLine, { backgroundColor: C.border }]} />
            </View>
          )}

          {/* Aktive Substanzen */}
          {activeIntakes.map((intake, idx) => {
            const sub    = getSubstance(intake.substanceId);
            if (!sub) return null;
            const sel    = selectedId === intake.substanceId;
            const effect = getCurrentEffect(intake.substanceId, chartData, now);
            const barW   = `${effect}%` as any;
            const phase  = getPhase(intake, now);
            const phaseIcon  = phase === 'rising' ? '▲' : phase === 'peak' ? '◉' : '▼';
            const phaseColor = phase === 'rising' ? '#f59e0b' : phase === 'peak' ? sub.color : C.textDim;
            return (
              <AnimatedCard key={intake.id} delay={idx * 50}>
                <View style={[s.compactRow, sel && { backgroundColor: `${sub.color}08`, borderRadius: 12 }]}>
                  <TouchableOpacity
                    onPress={() => setSelectedId(intake.substanceId)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    activeOpacity={0.75}
                  >
                    <SubIcon substance={sub} size={32} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: sel ? sub.color : C.text, letterSpacing: -0.2 }} numberOfLines={1}>
                          {sub.name}
                        </Text>
                        {intake.pinned && <Text style={{ fontSize: 11 }}>📌</Text>}
                      </View>
                      <Text style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>
                        {intakeTimeLabel(intake)} · {getRemainingTime(intake, now)}
                      </Text>
                      <View style={[s.barTrack, { backgroundColor: C.surfaceHigh, marginTop: 5 }]}>
                        <View style={[s.barFill, { width: barW, backgroundColor: sub.color }]} />
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginLeft: 12, minWidth: 56 }}>
                      <Text style={{ fontSize: 21, fontWeight: '800', color: sub.color, letterSpacing: -0.5 }}>{effect}%</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <Text style={{ fontSize: 10, color: phaseColor, fontWeight: '700' }}>{phaseIcon}</Text>
                        <Text style={{ fontSize: 10, color: phaseColor }}>
                          {phase === 'rising' ? 'steigt' : phase === 'peak' ? 'Peak' : 'sinkt'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleLongPressIntake(intake.id, sub.name, intake.pinned)}
                    style={[s.rowMenu, { borderColor: C.border }]}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                    activeOpacity={0.6}
                  >
                    <Text style={{ fontSize: 15, color: C.textDim, lineHeight: 18 }}>⋯</Text>
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            );
          })}

          {/* Quick-Retake */}
          {quickRetakes.length > 0 && (
            <>
              <View style={[s.divider, { backgroundColor: C.border, marginVertical: 6 }]} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 2 }}>
                  {quickRetakes.map(intake => {
                    const sub = getSubstance(intake.substanceId);
                    if (!sub) return null;
                    return (
                      <TouchableOpacity
                        key={`retake-${intake.id}`}
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          const d = new Date();
                          addIntake({ substanceId: sub.id, timeH: d.getHours() + d.getMinutes() / 60, doseLabel: intake.doseLabel, takenAt: d.toISOString() });
                        }}
                        style={[s.retakeChip, { backgroundColor: `${sub.color}12`, borderColor: `${sub.color}35` }]}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 12, color: sub.color, opacity: 0.75 }}>{sub.icon ?? '●'}</Text>
                        <View>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: sub.color }}>{sub.name}</Text>
                          {intake.takenAt && (
                            <Text style={{ fontSize: 10, color: sub.color, opacity: 0.6 }}>{timeAgo(intake.takenAt)}</Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 13, color: sub.color, fontWeight: '700' }}>＋</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </>
          )}

          {activeIntakes.length === 0 && quickRetakes.length === 0 && (
            <View style={s.emptyInline}>
              <Text style={{ fontSize: 12, color: C.textDim }}>{t.homeNoActive}</Text>
            </View>
          )}

          {/* ── NOCH AUSSTEHEND ── */}
          {pendingReminders.length > 0 && (
            <>
              <View style={[s.dividerRow, { marginTop: 10 }]}>
                <View style={[s.dividerLine, { backgroundColor: C.border }]} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 12 }}>
                  <Text style={{ fontSize: 11 }}>🕐</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.textDim, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Geplant heute
                  </Text>
                </View>
                <View style={[s.dividerLine, { backgroundColor: C.border }]} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {pendingReminders.map(r => {
                  const sub = getSubstance(r.substanceId);
                  if (!sub) return null;
                  const timeStr = `${String(r.hour).padStart(2,'0')}:${String(r.minute).padStart(2,'0')}`;
                  const isPast  = now * 60 > r.hour * 60 + r.minute;
                  return (
                    <TouchableOpacity
                      key={r.substanceId}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReminderSubstance(sub); setModalVisible(true); }}
                      style={[s.pendingChip, {
                        backgroundColor: isPast ? `${sub.color}18` : C.surfaceHigh,
                        borderColor: isPast ? `${sub.color}50` : C.border,
                      }]}
                      activeOpacity={0.75}
                    >
                      <SubIcon substance={sub} size={22} />
                      <View style={{ marginLeft: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isPast ? sub.color : C.text }}>
                          {sub.name}
                        </Text>
                        <Text style={{ fontSize: 10, color: isPast ? sub.color : C.textDim, opacity: 0.85 }}>
                          {isPast ? 'fällig' : timeStr}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 13, color: isPast ? sub.color : C.textDim, marginLeft: 4, fontWeight: '700' }}>+</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: selectedSub?.color ?? C.accent }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {t.homeSectionDetail}
                </Text>
              </View>
              <View style={[s.detailHeader]}>
                <SubIcon substance={selectedSub} size={44} />
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: C.text }}>{selectedSub.name}</Text>
                  <Text style={{ fontSize: 13, color: C.textDim }}>{selectedIntake.doseLabel} · {fmtHour(selectedIntake.timeH)}{t.timeUnit}</Text>
                  <View style={s.effectChips}>
                    {effects.map(e => (
                      <View key={e} style={[s.chip, { backgroundColor: `${selectedSub.color}18`, borderColor: `${selectedSub.color}30` }]}>
                        <Text style={{ fontSize: 12, color: selectedSub.color }}>{e}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Einfache Karten — verständliche Sprache */}
              <View style={s.pkGrid}>
                <View style={[s.pkCell, { backgroundColor: C.bg, borderColor: C.border }]}>
                  <Text style={{ fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>Peak um</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.accent, marginTop: 4, letterSpacing: -0.5 }}>{getPeakLabel(selectedIntake.timeH, selectedId)}</Text>
                </View>
                <View style={[s.pkCell, { backgroundColor: C.bg, borderColor: C.border }]}>
                  <Text style={{ fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>Wirkt</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.accent, marginTop: 4, letterSpacing: -0.5 }}>{selectedSub.pk.durationHours} h</Text>
                </View>
              </View>

              {/* Technische Details — aufklappbar */}
              <TouchableOpacity
                onPress={() => setShowTechDetails(v => !v)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 12, color: C.textDim }}>
                  {showTechDetails ? '▲' : '▼'} Technische Details
                </Text>
              </TouchableOpacity>
              {showTechDetails && (
                <View style={[s.pkGrid, { marginTop: 0 }]}>
                  {[
                    ['Halbwertszeit', `${selectedSub.pk.halflifeHours} h`, 'In dieser Zeit sinkt die Wirkung auf 50%'],
                    ['Bioverfügbar',  `${selectedSub.pk.bioavailability}%`, 'Anteil der wirksam wird'],
                  ].map(([k, v, hint]) => (
                    <View key={k} style={[s.pkCell, { backgroundColor: C.bg, borderColor: C.border }]}>
                      <Text style={{ fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>{k}</Text>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: C.textSub, marginTop: 4, letterSpacing: -0.5 }}>{v}</Text>
                      <Text style={{ fontSize: 10, color: C.textDim, marginTop: 2, lineHeight: 14 }}>{hint}</Text>
                    </View>
                  ))}
                </View>
              )}

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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: '#f87171' }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t.homeSectionIx}
              </Text>
              <View style={{ backgroundColor: '#f8717120', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#f87171' }}>{interactions.length}</Text>
              </View>
            </View>
            {interactions.map((ix: any, i: number) => {
              const subA     = getSubstance(ix.a);
              const subB     = getSubstance(ix.b);
              const ixMeta   = IX_TYPE[ix.type] ?? IX_TYPE.mixed;
              const sevColor = ix.type === 'synergy' ? '#4ade80' : IX_SEVERITY_COLOR[ix.severity] ?? '#94a3b8';
              const isOpen   = expandedIx.has(i);
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.85}
                  onPress={() => {
                    setExpandedIx(prev => {
                      const next = new Set(prev);
                      isOpen ? next.delete(i) : next.add(i);
                      return next;
                    });
                  }}
                  style={[s.ixRow, { backgroundColor: C.surfaceHigh, borderColor: `${sevColor}40`, borderLeftColor: sevColor }]}
                >
                  {/* Compact header — always visible */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {[subA, subB].filter(Boolean).map((sub: any) => (
                        <SubIcon key={sub.id} substance={sub} size={20} />
                      ))}
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.text, flex: 1 }} numberOfLines={1}>
                      {subA?.name} + {subB?.name}
                    </Text>
                    <View style={[s.ixBadge, { backgroundColor: `${sevColor}20`, borderColor: `${sevColor}40` }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: sevColor }}>{ixMeta.tag}</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: C.textDim, marginLeft: 2 }}>{isOpen ? '▲' : '▼'}</Text>
                  </View>
                  {/* Expanded detail */}
                  {isOpen && (
                    <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border }}>
                      <Text style={{ fontSize: 13, color: C.textSub, lineHeight: 20 }}>{ix.note}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sevColor }} />
                        <Text style={{ fontSize: 12, color: C.textDim }}>
                          {IX_SEVERITY_LABEL[ix.severity]}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── INSIGHTS ───────────────────────── */}
        {(() => {
          const insights: { icon: string; text: string; sub?: string; color: string }[] = [];

          // Clearance time
          if (clearanceHour !== null) {
            const totalMins = Math.round(clearanceHour * 60);
            const h = Math.floor(totalMins / 60) % 24;
            const m = totalMins % 60;
            const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const isNextDay = clearanceHour >= 24;
            insights.push({
              icon: '⏱',
              text: isNextDay ? `Abgebaut morgen gegen ${timeStr} Uhr` : `Alle Substanzen abgebaut gegen ${timeStr} Uhr`,
              color: C.accent,
            });
          }

          // Next peak
          if (nextPeak) {
            const mins = nextPeak.minutesAway;
            const peakStr = mins < 60 ? `in ${mins} min` : `in ${Math.round(mins/60*10)/10} h`;
            insights.push({
              icon: '📈',
              text: `${nextPeak.name} erreicht Peak ${peakStr}`,
              color: '#f59e0b',
            });
          }

          // Today count
          if (todayCount > 0) {
            insights.push({
              icon: '📋',
              text: `Heute ${todayCount} ${todayCount === 1 ? 'Einnahme' : 'Einnahmen'} erfasst`,
              color: C.success,
            });
          }

          // Interactions summary
          if (interactions.length > 0) {
            const critical = interactions.filter((ix: any) => ix.severity === 'critical').length;
            insights.push({
              icon: critical > 0 ? '⛔' : '⚠️',
              text: critical > 0
                ? `${critical} kritische Wechselwirkung${critical > 1 ? 'en' : ''} aktiv`
                : `${interactions.length} Wechselwirkung${interactions.length > 1 ? 'en' : ''} beachten`,
              color: critical > 0 ? '#f87171' : '#f59e0b',
            });
          }

          if (insights.length === 0) return null;

          return (
            <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: C.accent }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {t.homeInsightsTitle}
                </Text>
              </View>
              {insights.map((ins, i) => (
                <View key={i} style={[s.insightRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border, paddingTop: 10, marginTop: 2 }]}>
                  <Text style={{ fontSize: 16, width: 24 }}>{ins.icon}</Text>
                  <Text style={{ fontSize: 13, color: C.textSub, lineHeight: 19, flex: 1 }}>{ins.text}</Text>
                </View>
              ))}
            </View>
          );
        })()}

        {/* ── TAGES-ZUSAMMENFASSUNG ──────────── */}
        {todayIntakes.length > 0 && (
          <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border, marginBottom: 8 }]}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: C.success }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Heute
                </Text>
              </View>
              <View style={{ backgroundColor: `${C.success}18`, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: `${C.success}30` }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.success }}>
                  {todayIntakes.length} {todayIntakes.length === 1 ? 'Einnahme' : 'Einnahmen'}
                </Text>
              </View>
            </View>

            {/* Timeline */}
            {todayIntakes.map((intake, idx) => {
              const sub = getSubstance(intake.substanceId);
              if (!sub) return null;
              const timeLabel = intakeTimeLabel(intake);
              const isLast = idx === todayIntakes.length - 1;
              const stillActive = isActive(intake, now);
              return (
                <View key={intake.id} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  {/* Timeline line + dot */}
                  <View style={{ width: 36, alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: sub.color, marginTop: 13, opacity: stillActive ? 1 : 0.45 }} />
                    {!isLast && (
                      <View style={{ width: 1.5, flex: 1, minHeight: 18, backgroundColor: C.border, marginTop: 3 }} />
                    )}
                  </View>
                  {/* Content */}
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingBottom: isLast ? 0 : 14, gap: 10 }}>
                    <SubIcon substance={sub} size={28} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: stillActive ? C.text : C.textDim }}>
                        {sub.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: C.textDim, marginTop: 1 }}>
                        {intake.doseLabel}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 3 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: stillActive ? sub.color : C.textDim }}>
                        {timeLabel}
                      </Text>
                      {stillActive && (
                        <View style={{ backgroundColor: `${sub.color}18`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: sub.color }}>aktiv</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </Animated.ScrollView>

      {/* ── FAB + glow ring ─────────────────── */}
      <View style={[s.fabContainer, Platform.OS === 'android' && { bottom: 20 + insets.bottom }]}>
        <Animated.View style={[s.fabGlow, {
          backgroundColor: C.accent,
          opacity: fabPulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.28] }),
          transform: [{ scale: fabPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
        }]} />
        <TouchableOpacity
          style={[s.fab, { backgroundColor: C.accent, shadowColor: C.accent }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setModalVisible(true); }}
          activeOpacity={0.85}
        >
          <Text style={s.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <AddIntakeModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setReminderSubstance(null); }}
        initialSubstance={reminderSubstance}
      />

      {/* ── ACTION SHEET (pin / delete) ──────── */}
      <Modal
        visible={!!actionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setActionSheet(null)}
      >
        <Pressable style={s.sheetOverlay} onPress={() => setActionSheet(null)}>
          <Pressable style={[s.sheetCard, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => {}}>
            <Text style={[s.sheetTitle, { color: C.text }]} numberOfLines={1}>{actionSheet?.name}</Text>
            <Text style={[s.sheetSubtitle, { color: C.textDim }]}>
              {actionSheet?.pinned ? '📌 Angeheftet – wird nicht automatisch gelöscht' : 'Was möchtest du tun?'}
            </Text>
            <View style={[s.sheetDivider, { backgroundColor: C.border }]} />
            <TouchableOpacity
              style={s.sheetBtn}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); if (actionSheet) { togglePin(actionSheet.id); } setActionSheet(null); }}
              activeOpacity={0.7}
            >
              <Text style={[s.sheetBtnText, { color: C.accent }]}>
                {actionSheet?.pinned ? '📌 Loslösen' : '📌 Anheften'}
              </Text>
            </TouchableOpacity>
            <View style={[s.sheetDivider, { backgroundColor: C.border }]} />
            <TouchableOpacity
              style={s.sheetBtn}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); if (actionSheet) { removeIntake(actionSheet.id); } setActionSheet(null); }}
              activeOpacity={0.7}
            >
              <Text style={[s.sheetBtnText, { color: '#f87171' }]}>🗑️ Löschen</Text>
            </TouchableOpacity>
            <View style={[s.sheetDivider, { backgroundColor: C.border }]} />
            <TouchableOpacity style={s.sheetBtn} onPress={() => setActionSheet(null)} activeOpacity={0.7}>
              <Text style={[s.sheetBtnText, { color: C.textDim }]}>{t.cancel}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── XP floats ────────────────────────── */}
      {xpFloats.map(f => (
        <Animated.View
          key={f.id}
          pointerEvents="none"
          style={{
            position: 'absolute', right: 28, bottom: 110,
            opacity: f.anim.interpolate({ inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateY: f.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) }],
          }}
        >
          <View style={[s.xpBubble, { backgroundColor: `${f.color}18`, borderColor: `${f.color}55` }]}>
            <Text style={{ fontSize: 14 }}>⬆</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: f.color }}>{f.text}</Text>
          </View>
        </Animated.View>
      ))}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon:   { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  // ── Cards ────────────────────────────────────────────────────
  card: {
    marginHorizontal: 14, marginTop: 12, borderRadius: 22, padding: 18, borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  activeBadge:{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },

  legendRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  legendDot:  { width: 9, height: 9, borderRadius: 4.5, marginTop: 1 },

  pillRow:    { flexDirection: 'row', gap: 8 },
  intakePill: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },

  mascotCard:      { flexDirection: 'row', alignItems: 'center' },
  combinedCard:    { marginTop: 8 },
  mascotImgWrapper:{ borderRadius: 16, backgroundColor: 'white', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  mascotImg:       { resizeMode: 'contain' } as any,

  // ── Substance rows ───────────────────────────────────────────
  divider:      { height: StyleSheet.hairlineWidth, marginVertical: 8 },
  dividerRow:   { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  dividerLine:  { flex: 1, height: StyleSheet.hairlineWidth },
  compactRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, marginVertical: 1, gap: 8, borderRadius: 14 },
  rowMenu:      { width: 30, height: 30, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
  barTrack:     { height: 7, borderRadius: 4, marginTop: 7, overflow: 'hidden' },
  barFill:      { height: 7, borderRadius: 4 },
  retakeChip:   { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1 },
  pendingChip:  { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1 },

  emptyInline:{ paddingVertical: 20, alignItems: 'center' },

  // ── Detail card ───────────────────────────────────────────────
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, marginBottom: 16 },
  effectChips:  { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 },
  chip:         { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  pkGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  pkCell:       { flex: 1, minWidth: 80, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  warnBox:      { borderRadius: 14, padding: 14, borderWidth: 1 },

  peakBanner:     { marginTop: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  sleepWarnBox:   { marginTop: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  sleepWarnTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  sleepWarnItem:  { fontSize: 12, lineHeight: 19 },

  // ── Interactions ─────────────────────────────────────────────
  ixCard:    { borderRadius: 16, padding: 16, marginTop: 10, borderWidth: 1, borderLeftWidth: 4 },
  ixHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ixRow:     { borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderLeftWidth: 3 },
  ixBadge:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },

  // ── Insights ─────────────────────────────────────────────────
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  insightDot: { width: 8, height: 8, borderRadius: 4 },

  // ── Empty state ───────────────────────────────────────────────
  emptyState:   { flex: 1 },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 8 },
  emptyEmoji:   { fontSize: 52, marginBottom: 16 },
  emptyHints:   { alignSelf: 'stretch', marginBottom: 32, gap: 10 },
  emptyHintRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyHintDot: { width: 6, height: 6, borderRadius: 3 },
  emptyBtn:     { borderRadius: 18, paddingVertical: 16, paddingHorizontal: 28, alignSelf: 'stretch', alignItems: 'center' },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // ── FAB ───────────────────────────────────────────────────────
  fabContainer: {
    position: 'absolute', right: 20,
    bottom: Platform.OS === 'ios' ? 24 : 20,
    width: 60, height: 60,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 30,
    elevation: 30,
  },
  fabGlow: {
    position: 'absolute',
    width: 60, height: 60, borderRadius: 30,
  },
  fab: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  fabIcon: { fontSize: 28, color: '#000', fontWeight: '300', marginTop: -2 },

  // ── XP float ──────────────────────────────────────────────────
  xpBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },

  // ── Action sheet ──────────────────────────────────────────────
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end', paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  sheetCard: {
    marginHorizontal: 12, borderRadius: 24, borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
  },
  sheetTitle:    { fontSize: 17, fontWeight: '700', textAlign: 'center', paddingTop: 20, paddingHorizontal: 20 },
  sheetSubtitle: { fontSize: 13, textAlign: 'center', paddingBottom: 16, paddingHorizontal: 20, marginTop: 4 },
  sheetDivider:  { height: StyleSheet.hairlineWidth },
  sheetBtn:      { paddingVertical: 17, alignItems: 'center' },
  sheetBtnText:  { fontSize: 16, fontWeight: '600' },

});
