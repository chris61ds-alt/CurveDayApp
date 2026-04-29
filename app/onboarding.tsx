import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Animated, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '../src/store/onboardingStore';
import { requestNotificationPermissions } from '../src/services/notifications';

const { width: W } = Dimensions.get('window');

// ── Tracking Goals ────────────────────────────────────────────
const GOALS = [
  {
    id: 'medication',
    icon: '💊',
    label: 'Medikamente',
    desc: 'Verschreibungspflichtige Medikamente, Schmerzmittel, Antibiotika',
    color: '#c084fc',
  },
  {
    id: 'adhd',
    icon: '🧠',
    label: 'ADHS & Fokus',
    desc: 'Methylphenidat, Amphetamine, Atomoxetin, Nootropika',
    color: '#38bdf8',
  },
  {
    id: 'sleep',
    icon: '🌙',
    label: 'Schlaf & Beruhigung',
    desc: 'Melatonin, Baldrian, Benzodiazepine, Antihistaminika',
    color: '#818cf8',
  },
  {
    id: 'stimulant',
    icon: '⚡',
    label: 'Stimulanzien & Energie',
    desc: 'Koffein, L-Theanin, Pre-Workout, Guaraná',
    color: '#f59e0b',
  },
  {
    id: 'supplement',
    icon: '🌱',
    label: 'Nahrungsergänzung',
    desc: 'Vitamine, Mineralstoffe, Omega-3, Probiotika',
    color: '#4ade80',
  },
  {
    id: 'recreational',
    icon: '🍺',
    label: 'Genussmittel',
    desc: 'Alkohol, Cannabis, Nikotin – bewusstes Tracking',
    color: '#94a3b8',
  },
];

// ── Step indicators ───────────────────────────────────────────
function Steps({ current, total }: { current: number; total: number }) {
  return (
    <View style={s.steps}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.step, i <= current && s.stepActive]} />
      ))}
    </View>
  );
}

// ── Step 0: Welcome ───────────────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <View style={s.stepWrap}>
      <View style={s.welcomeLogo}>
        <Text style={s.welcomeEmoji}>📊</Text>
      </View>
      <Text style={s.welcomeTitle}>CurveDay</Text>
      <Text style={s.welcomeTagline}>Verstehe, wann dein Körper{'\n'}auf dem Peak ist.</Text>
      <Text style={s.welcomeDesc}>
        Visualisiere Wirkkurven von Medikamenten, Supplements und Substanzen —
        präzise, übersichtlich, informativ.
      </Text>
      <TouchableOpacity style={s.btnPrimary} onPress={onNext}>
        <Text style={s.btnPrimaryText}>Loslegen →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 1: Disclaimer ────────────────────────────────────────
function StepDisclaimer({ onNext }: { onNext: (timestamp: string) => void }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [accepted,  setAccepted]  = useState(false);

  function handleScroll(e: any) {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const atBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (atBottom) setScrolled(true);
  }

  function handleAccept() {
    if (!accepted || !scrolled) return;
    onNext(new Date().toISOString());
  }

  return (
    <View style={s.stepWrap}>
      <Text style={s.disclaimerHeadline}>⚖️ Wichtiger Hinweis</Text>
      <Text style={s.disclaimerSub}>Bitte lies und akzeptiere diese Bedingungen</Text>

      <ScrollView
        style={s.disclaimerScroll}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator
      >
        <Text style={s.disclaimerBody}>
          <Text style={s.disclaimerBold}>CurveDay ist kein medizinisches Produkt.{'\n\n'}</Text>

          Diese App dient ausschließlich zur allgemeinen Information und Visualisierung
          pharmakologischer Daten. Sie ist{' '}
          <Text style={s.disclaimerBold}>kein Medizinprodukt</Text>,{' '}
          <Text style={s.disclaimerBold}>keine Diagnosesoftware</Text> und ersetzt{' '}
          <Text style={s.disclaimerBold}>keinen Arzt, Apotheker oder medizinischen Fachmann</Text>.
          {'\n\n'}

          <Text style={s.disclaimerBold}>Was diese App NICHT kann:{'\n'}</Text>
          {'• '}Medizinische Diagnosen stellen{'\n'}
          {'• '}Therapieempfehlungen geben{'\n'}
          {'• '}Wechselwirkungen vollständig bewerten{'\n'}
          {'• '}Individuelle Pharmakodynamik vorhersagen{'\n'}
          {'• '}Notfallsituationen erkennen oder behandeln{'\n\n'}

          <Text style={s.disclaimerBold}>Deine Verantwortung:{'\n'}</Text>
          Alle Informationen basieren auf allgemeinen pharmakologischen Durchschnittswerten
          aus öffentlich zugänglichen Quellen (Fachinformationen, PubMed, klinische Studien).
          Individuelle Faktoren wie Gewicht, Alter, Erkrankungen, Genetik und andere Medikamente
          können die tatsächliche Wirkung erheblich beeinflussen.{'\n\n'}

          Du nutzt diese App auf eigene Verantwortung. Die Entwickler übernehmen keinerlei
          Haftung für Entscheidungen, die auf Basis der angezeigten Informationen getroffen werden.{'\n\n'}

          <Text style={s.disclaimerBold}>Bei medizinischen Fragen:{'\n'}</Text>
          Wende dich immer an einen Arzt oder Apotheker.{'\n\n'}

          <Text style={s.disclaimerBold}>Im Notfall:{'\n'}</Text>
          Ruf sofort den Notruf{' '}
          <Text style={[s.disclaimerBold, { color: '#f87143' }]}>112</Text>{' '}an.{'\n\n'}

          Durch die Nutzung dieser App bestätigst du, dass du diese Hinweise gelesen
          und verstanden hast und keine medizinische Beratung erwartest.
        </Text>

        {!scrolled && (
          <Text style={s.scrollHint}>↓ Scrolle bis zum Ende um fortzufahren</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={s.checkRow}
        onPress={() => scrolled && setAccepted(!accepted)}
        activeOpacity={0.7}
      >
        <View style={[s.checkbox, accepted && s.checkboxChecked]}>
          {accepted && <Text style={s.checkmark}>✓</Text>}
        </View>
        <Text style={[s.checkLabel, !scrolled && s.checkLabelDim]}>
          Ich habe die Hinweise gelesen und verstanden. Ich nutze CurveDay als reine
          Informationsquelle und nicht als medizinisches Hilfsmittel.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.btnPrimary, (!accepted || !scrolled) && s.btnDisabled]}
        onPress={handleAccept}
        disabled={!accepted || !scrolled}
      >
        <Text style={s.btnPrimaryText}>Akzeptieren & Weiter →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 2: Tracking Goals ────────────────────────────────────
function StepGoals({ onNext }: { onNext: (goals: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>Was möchtest du tracken?</Text>
      <Text style={s.stepSub}>Wähle einen oder mehrere Bereiche.{'\n'}Du kannst das später jederzeit ändern.</Text>

      <ScrollView style={s.goalsScroll} showsVerticalScrollIndicator={false}>
        {GOALS.map(g => {
          const active = selected.has(g.id);
          return (
            <TouchableOpacity
              key={g.id}
              style={[s.goalRow, active && { borderColor: g.color, backgroundColor: g.color + '15' }]}
              onPress={() => toggle(g.id)}
              activeOpacity={0.75}
            >
              <View style={[s.goalIcon, { backgroundColor: g.color + '25' }]}>
                <Text style={s.goalEmoji}>{g.icon}</Text>
              </View>
              <View style={s.goalBody}>
                <Text style={[s.goalLabel, active && { color: '#fff' }]}>{g.label}</Text>
                <Text style={s.goalDesc} numberOfLines={2}>{g.desc}</Text>
              </View>
              <View style={[s.goalCheck, active && { backgroundColor: g.color, borderColor: g.color }]}>
                {active && <Text style={s.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[s.btnPrimary, selected.size === 0 && s.btnDisabled]}
        onPress={() => selected.size > 0 && onNext([...selected])}
        disabled={selected.size === 0}
      >
        <Text style={s.btnPrimaryText}>Weiter → ({selected.size} gewählt)</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 3: Ready ─────────────────────────────────────────────
function StepReady({ goals, onFinish }: { goals: string[]; onFinish: () => void }) {
  const selectedGoals = GOALS.filter(g => goals.includes(g.id));

  return (
    <View style={s.stepWrap}>
      <Text style={s.readyEmoji}>🚀</Text>
      <Text style={s.stepTitle}>Alles bereit!</Text>
      <Text style={s.stepSub}>Du trackst diese Bereiche:</Text>

      <View style={s.readyGoals}>
        {selectedGoals.map(g => (
          <View key={g.id} style={[s.readyChip, { backgroundColor: g.color + '20', borderColor: g.color + '50' }]}>
            <Text style={s.readyChipText}>{g.icon} {g.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.readyHints}>
        <Text style={s.readyHint}>✓  Kurven aktualisieren sich in Echtzeit</Text>
        <Text style={s.readyHint}>✓  Wechselwirkungen werden automatisch erkannt</Text>
        <Text style={s.readyHint}>✓  Erinnerungen für jede Einnahme möglich</Text>
        <Text style={s.readyHint}>✓  Daten bleiben lokal auf deinem Gerät</Text>
      </View>

      <TouchableOpacity style={s.btnPrimary} onPress={onFinish}>
        <Text style={s.btnPrimaryText}>App starten →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main Onboarding ───────────────────────────────────────────
export default function OnboardingScreen() {
  const { completeOnboarding } = useOnboardingStore();
  const [step, setStep]       = useState(0);
  const [discTs, setDiscTs]   = useState<string | null>(null);
  const [goals,  setGoals]    = useState<string[]>([]);

  const TOTAL_STEPS = 4;

  async function finish() {
    await requestNotificationPermissions();
    await completeOnboarding({
      trackingGoals: goals,
      disclaimerAcceptedAt: discTs,
    });
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060b13" />

      {step > 0 && <Steps current={step - 1} total={TOTAL_STEPS - 1} />}

      {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
      {step === 1 && (
        <StepDisclaimer
          onNext={(ts) => { setDiscTs(ts); setStep(2); }}
        />
      )}
      {step === 2 && (
        <StepGoals
          onNext={(g) => { setGoals(g); setStep(3); }}
        />
      )}
      {step === 3 && <StepReady goals={goals} onFinish={finish} />}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060b13' },

  steps: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 16, paddingBottom: 4 },
  step: { width: 28, height: 4, borderRadius: 2, backgroundColor: '#132033' },
  stepActive: { backgroundColor: '#38bdf8' },

  stepWrap: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'flex-start' },

  // Welcome
  welcomeLogo: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: '#38bdf815', borderWidth: 1, borderColor: '#38bdf830',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 48, marginBottom: 28,
  },
  welcomeEmoji: { fontSize: 48 },
  welcomeTitle: { fontSize: 36, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12 },
  welcomeTagline: { fontSize: 20, color: '#38bdf8', fontWeight: '600', textAlign: 'center', lineHeight: 28, marginBottom: 20 },
  welcomeDesc: { fontSize: 15, color: '#7a9ab5', textAlign: 'center', lineHeight: 22, marginBottom: 40 },

  // Disclaimer
  disclaimerHeadline: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 24, marginBottom: 4 },
  disclaimerSub: { fontSize: 13, color: '#7a9ab5', marginBottom: 16 },
  disclaimerScroll: {
    flex: 1,
    backgroundColor: '#0d1a2a', borderRadius: 14,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#132033',
  },
  disclaimerBody: { fontSize: 13, color: '#7a9ab5', lineHeight: 20 },
  disclaimerBold: { color: '#e2f0ff', fontWeight: '700' },
  scrollHint: { fontSize: 12, color: '#38bdf8', textAlign: 'center', marginTop: 12, marginBottom: 4 },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: '#4a5a70', alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  checkmark: { color: '#000', fontWeight: '900', fontSize: 13 },
  checkLabel: { flex: 1, fontSize: 13, color: '#e2f0ff', lineHeight: 19 },
  checkLabelDim: { color: '#4a5a70' },

  // Goals
  stepTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 24, marginBottom: 8 },
  stepSub: { fontSize: 14, color: '#7a9ab5', lineHeight: 20, marginBottom: 20 },
  goalsScroll: { flex: 1, marginBottom: 16 },
  goalRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1a2a', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#132033',
  },
  goalIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  goalEmoji: { fontSize: 24 },
  goalBody: { flex: 1, marginHorizontal: 12 },
  goalLabel: { fontSize: 15, fontWeight: '700', color: '#b0c8e0', marginBottom: 3 },
  goalDesc: { fontSize: 12, color: '#4a5a70', lineHeight: 16 },
  goalCheck: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#4a5a70',
    alignItems: 'center', justifyContent: 'center',
  },

  // Ready
  readyEmoji: { fontSize: 56, textAlign: 'center', marginTop: 36, marginBottom: 16 },
  readyGoals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 28 },
  readyChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  readyChipText: { fontSize: 13, color: '#e2f0ff', fontWeight: '600' },
  readyHints: { gap: 10, marginBottom: 36 },
  readyHint: { fontSize: 14, color: '#7a9ab5' },

  // Shared buttons
  btnPrimary: {
    backgroundColor: '#38bdf8', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#132033' },
  btnPrimaryText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
