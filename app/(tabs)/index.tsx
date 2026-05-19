import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Easing, Platform, Alert, useWindowDimensions, Image,
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
  };
}

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
    const eff = getCurrentEffect(intake.substanceId, chartData, now) / 100;
    for (const [key, val] of Object.entries(sub.effects as Record<string, number>)) {
      if (typeof val === 'number' && val > 0) {
        totals[key] = (totals[key] ?? 0) + val * eff;
      }
    }
  }
  const top = Object.entries(totals).sort(([, a], [, b]) => b - a)[0];
  if (!top) return null;
  const stateMap = getStateMap(t);
  const mapped   = stateMap[top[0]];
  if (!mapped) return null;
  const strength = top[1] > 60 ? t.homeStateStrong : top[1] > 25 ? t.homeStateModerate : t.homeStateLight;
  return { ...mapped, strength };
}

function getMascotKey(
  state: { label: string; emoji: string; color: string; strength: string } | null,
  activeCount: number,
  interactions: any[],
  substanceIds: string[],
): string {
  if (activeCount === 0) return 'tired';
  const hasCritical = interactions.some((ix: any) => ix.severity === 'critical');
  if (hasCritical) return 'anxious';
  const hasHigh = interactions.some((ix: any) => ix.severity === 'high');
  if (hasHigh && activeCount >= 2) return 'nervous';
  const hasADHD     = substanceIds.some(id => ['mph_ir','mph_la','lisdex','adderall'].includes(id));
  const hasCaffeine = substanceIds.some(id => ['koffein','espresso','energy_drink','filter_coffee','kaffee_filter','cold_brew'].includes(id));
  const hasAlcohol  = substanceIds.some(id => ['alkohol','bier_klein','bier_gross','wein_rot','wein_weiss','cocktail','shot','sekt'].includes(id));
  if (hasADHD && hasCaffeine) return 'energeticFocused';
  if (!state) return activeCount >= 3 ? 'confused' : 'happy';
  if (activeCount >= 3 && interactions.length > 0) return 'confused';
  if (hasAlcohol && activeCount >= 2) return 'euphoricMuted';
  switch (state.emoji) {
    case '🎯': return 'focused';
    case '⚡': return state.strength === 'stark' || state.strength === 'strong' ? 'energetic' : 'nervous';
    case '😴': return 'tired';
    case '😌': return 'relaxed';
    case '🌿': return 'peacefull';
    case '😊': return 'happy';
    case '🧠': return 'focused';
    case '💆': return 'relaxed';
    case '☺️': return hasAlcohol ? 'dizzy' : 'happy';
    default:   return 'happy';
  }
}

function getGreeting(nowH: number): string {
  if (nowH >= 5  && nowH < 12) return 'Guten Morgen ☀️';
  if (nowH >= 12 && nowH < 17) return 'Guten Tag 👋';
  if (nowH >= 17 && nowH < 22) return 'Guten Abend 🌙';
  return 'Nacht-Eule 🦉';
}

// ── Animated card: spring-entrance on mount ───────────────────
function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1, delay, friction: 7, tension: 120, useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[style, {
      opacity: anim,
      transform: [
        { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
      ],
    }]}>
      {children}
    </Animated.View>
  );
}

export default function TageskurveScreen() {
  const { intakes, selectedId, setSelectedId, hydrate, hydrated, removeIntake, addIntake } = useIntakeStore();
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
  const { width: screenWidth } = useWindowDimensions();

  // ── Page fade-in ─────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Chart reveal (left→right wipe) ───────────────────────────
  const chartReveal = useRef(new Animated.Value(0)).current;

  // ── FAB glow pulse ───────────────────────────────────────────
  const fabPulse = useRef(new Animated.Value(0)).current;

  // ── NOW dot heartbeat ────────────────────────────────────────
  const dotPulse = useRef(new Animated.Value(1)).current;

  // ── XP floats (game-style "+Substance" popups) ───────────────
  type XpFloat = { id: string; text: string; color: string; anim: Animated.Value };
  const [xpFloats, setXpFloats] = useState<XpFloat[]>([]);
  const prevIntakeCount = useRef(0);

  useEffect(() => { hydrate(); }, []);

  function handleDeleteIntake(id: string, name: string) {
    Alert.alert(
      t.intakeDeleteTitle,
      t.intakeDeleteMsg(name),
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: () => removeIntake(id) },
      ],
    );
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

  // NOW dot heartbeat
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.delay(600),
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
          <Text style={{ fontSize: 12, color: C.textDim }}>{t.loading}</Text>
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
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>CurveDay</Text>
            <Text style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{getGreeting(now)}</Text>
          </View>
        </View>
        <View style={s.dateRow}>
          <Text style={{ fontSize: 12, color: C.textDim }}>
            {t.homeDate(new Date())}
          </Text>
        </View>
        <View style={[s.nowPill, { backgroundColor: `${C.accent}12`, borderColor: `${C.accent}25` }]}>
          <Animated.View style={[s.nowDot, { backgroundColor: C.accent, opacity: dotPulse }]} />
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

      <Animated.ScrollView
        style={[{ flex: 1, opacity: fadeAnim }, intakes.length === 0 && { display: 'none' }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEventThrottle={16}
      >

        {/* ── CHART ──────────────────────────── */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          {/* Chart + left→right reveal wipe */}
          <View style={{ position: 'relative', overflow: 'hidden' }}>
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
            onSelectSubstance={setSelectedId}
          />
          {/* Reveal wipe: covers curves, slides right to expose them */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute', top: 0, bottom: 0,
              right: 0,
              left: chartReveal.interpolate({ inputRange: [0, 1], outputRange: [30, screenWidth + 60] }),
              backgroundColor: C.surface,
            }}
          />
          </View>

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
                      onLongPress={() => handleDeleteIntake(intake.id, sub.name)}
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
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {t.homeActiveNow}
            </Text>
            <View style={[s.activeBadge, { backgroundColor: C.surfaceHigh, borderColor: C.borderMid }]}>
              <Text style={{ fontSize: 12, color: activeIntakes.length > 0 ? C.accent : C.textDim }}>
                {t.homeActiveCount(activeIntakes.length)}
              </Text>
            </View>
          </View>

          {/* Mascot card */}
          {(() => {
            const state      = activeIntakes.length > 0 ? computeCurrentState(activeIntakes, chartData, now, t) : null;
            const mascotKey  = getMascotKey(state, activeIntakes.length, interactions, activeIntakes.map(i => i.substanceId));
            const mascotImg  = MASCOT_IMAGES[mascotKey];
            const cardColor  = state?.color ?? C.textDim;
            const phrase     = activeIntakes.length === 0
              ? 'Nichts aktiv – alles ruhig 😴'
              : state ? `${state.label} · ${state.strength}` : 'Aktiv';
            return (
              <View style={[s.mascotCard, { backgroundColor: `${cardColor}10`, borderColor: `${cardColor}25` }]}>
                <View style={s.mascotImgWrapper}>
                  <Image source={mascotImg} style={s.mascotImg} resizeMode="contain" />
                </View>
                <View style={{ flex: 1, paddingLeft: 14 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: cardColor, letterSpacing: -0.3 }}>
                    {state?.label ?? 'Alles ruhig'}
                  </Text>
                  <Text style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>
                    {activeIntakes.length === 0 ? 'Keine aktiven Substanzen' : `${state?.strength ?? ''} · ${activeIntakes.length} aktiv`}
                  </Text>
                  {activeIntakes.length > 0 && (
                    <Text style={{ fontSize: 11, color: C.textMuted ?? C.textDim, marginTop: 5 }} numberOfLines={1}>
                      {activeIntakes.map(i => getSubstance(i.substanceId)?.name).filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
              </View>
            );
          })()}

          {activeIntakes.length === 0 && quickRetakes.length === 0 ? (
            <View style={s.emptyInline}>
              <Text style={{ fontSize: 12, color: C.textDim }}>{t.homeNoActive}</Text>
            </View>
          ) : (
            <View style={s.activeGrid}>
              {/* Aktive Substanzen — volle Farbe */}
              {activeIntakes.map((intake, idx) => {
                const sub = getSubstance(intake.substanceId);
                if (!sub) return null;
                const sel    = selectedId === intake.substanceId;
                const effect = getCurrentEffect(intake.substanceId, chartData, now);
                const atPeak = effect >= 85;
                return (
                  <AnimatedCard key={intake.id} delay={idx * 70}>
                    <TouchableOpacity
                      onPress={() => setSelectedId(intake.substanceId)}
                      onLongPress={() => handleDeleteIntake(intake.id, sub.name)}
                      style={[s.activeCard, { backgroundColor: C.surfaceHigh, borderColor: C.border },
                        sel && { borderColor: `${sub.color}40`, backgroundColor: `${sub.color}08` }]}
                      activeOpacity={0.8}
                    >
                      <SubIcon substance={sub} size={36} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.text, marginTop: 6 }} numberOfLines={1}>
                        {sub.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{intake.doseLabel}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: sub.color }}>{effect}%</Text>
                        {atPeak && <Text style={{ fontSize: 10 }}>⚡</Text>}
                      </View>
                      <Text style={{ fontSize: 10, color: C.textDim }}>{getRemainingTime(intake, now)}</Text>
                    </TouchableOpacity>
                  </AnimatedCard>
                );
              })}

              {/* Abgelaufen letzte 24h — ausgegraut + Retake-Button */}
              {quickRetakes.map((intake, idx) => {
                const sub = getSubstance(intake.substanceId);
                if (!sub) return null;
                return (
                  <AnimatedCard key={`retake-${intake.id}`} delay={(activeIntakes.length + idx) * 70}>
                    <View style={[s.activeCard, s.retakeCard, { backgroundColor: C.surfaceHigh, borderColor: C.border }]}>
                      <View style={{ opacity: 0.45 }}>
                        <SubIcon substance={sub} size={30} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: C.text, marginTop: 5, textAlign: 'center' }} numberOfLines={1}>
                          {sub.name}
                        </Text>
                        <Text style={{ fontSize: 10, color: C.textDim, marginTop: 1, textAlign: 'center' }}>{intake.doseLabel}</Text>
                        <Text style={{ fontSize: 9, color: C.textDim, marginTop: 3, textAlign: 'center' }}>abgelaufen</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const d = new Date();
                          const h = d.getHours() + d.getMinutes() / 60;
                          addIntake({ substanceId: sub.id, timeH: h, doseLabel: intake.doseLabel, takenAt: d.toISOString() });
                        }}
                        style={[s.retakeBtn, { backgroundColor: `${sub.color}20`, borderColor: `${sub.color}50` }]}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: sub.color }}>＋ nochmal</Text>
                      </TouchableOpacity>
                    </View>
                  </AnimatedCard>
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
                {t.homeSectionDetail}
              </Text>
              <View style={[s.detailHeader]}>
                <SubIcon substance={selectedSub} size={44} />
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: C.text }}>{selectedSub.name}</Text>
                  <Text style={{ fontSize: 12, color: C.textDim }}>{selectedIntake.doseLabel} · {fmtHour(selectedIntake.timeH)}{t.timeUnit}</Text>
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
              {t.homeSectionIx} · {interactions.length}
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
            {t.homeInsightsTitle}
          </Text>
          {[
            {
              text: activeIntakes.length > 0 ? t.homeInsightActive(activeIntakes.length) : t.homeInsightNone,
              color: C.accent,
            },
            {
              text: interactions.length > 0 ? t.homeInsightIx(interactions.length) : t.homeInsightNoIx,
              color: C.success,
            },
          ].map((insight, i) => (
            <View key={i} style={s.insightRow}>
              <View style={[s.insightDot, { backgroundColor: insight.color }]} />
              <Text style={{ fontSize: 14, color: C.textSub, lineHeight: 20, flex: 1 }}>{insight.text}</Text>
            </View>
          ))}
        </View>

      </Animated.ScrollView>

      {/* ── FAB + glow ring ─────────────────── */}
      <View style={s.fabContainer}>
        <Animated.View style={[s.fabGlow, {
          backgroundColor: C.accent,
          opacity: fabPulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.28] }),
          transform: [{ scale: fabPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
        }]} />
        <TouchableOpacity
          style={[s.fab, { backgroundColor: C.accent, shadowColor: C.accent }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={s.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <AddIntakeModal visible={modalVisible} onClose={() => setModalVisible(false)} />

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
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  logoIcon:   { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  dateRow:    { flex: 2, alignItems: 'center' },
  nowPill:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  nowDot:     { width: 6, height: 6, borderRadius: 3 },

  card:       { marginHorizontal: 14, marginTop: 14, borderRadius: 20, padding: 18, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  activeBadge:{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },

  legendRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  legendDot:  { width: 9, height: 9, borderRadius: 4.5, marginTop: 1 },

  pillRow:    { flexDirection: 'row', gap: 8 },
  intakePill: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },

  activeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  activeCard: { flex: 1, minWidth: 110, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1 },
  stateRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1 },
  mascotCard:   { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1 },
  mascotImgWrapper: { width: 150, height: 78, borderRadius: 14, backgroundColor: 'white', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  mascotImg:    { width: 160, height: 88 },
  emptyInline:{ paddingVertical: 16, alignItems: 'center' },

  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, marginBottom: 14 },
  effectChips:  { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  chip:         { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  pkGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  pkCell:       { flex: 1, minWidth: 80, borderRadius: 12, padding: 12, alignItems: 'center' },
  warnBox:      { borderRadius: 12, padding: 14, borderWidth: 1 },

  sleepWarnBox:   { marginTop: 10, borderRadius: 10, padding: 10, borderWidth: 1 },
  sleepWarnTitle: { fontSize: 12, fontWeight: '600', marginBottom: 3 },
  sleepWarnItem:  { fontSize: 11, lineHeight: 18 },

  ixCard:    { borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderLeftWidth: 3 },
  ixHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },

  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 12 },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },

  retakeCard: { opacity: 1, alignItems: 'center' },
  retakeBtn: {
    marginTop: 10, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, alignItems: 'center',
  },

  emptyState:   { flex: 1 },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 8 },
  emptyEmoji:   { fontSize: 52, marginBottom: 16 },
  emptyHints:   { alignSelf: 'stretch', marginBottom: 32, gap: 10 },
  emptyHintRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyHintDot: { width: 6, height: 6, borderRadius: 3 },
  emptyBtn:     { borderRadius: 16, paddingVertical: 15, paddingHorizontal: 28, alignSelf: 'stretch', alignItems: 'center' },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },

  fabContainer: {
    position: 'absolute', right: 20,
    bottom: Platform.OS === 'ios' ? 24 : 16,
    width: 58, height: 58,
    alignItems: 'center', justifyContent: 'center',
  },
  fabGlow: {
    position: 'absolute',
    width: 58, height: 58, borderRadius: 29,
  },
  fab: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  fabIcon: { fontSize: 28, color: '#000', fontWeight: '300', marginTop: -2 },

  xpBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1,
  },

});
