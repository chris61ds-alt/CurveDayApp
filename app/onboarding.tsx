import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboardingStore, UserProfile } from '../src/store/onboardingStore';
import { requestNotificationPermissions } from '../src/services/notifications';
import {
  Region, REGION_OPTIONS,
  weightUnitLabel, heightUnitLabel,
  parseWeightToKg, parseHeightToCm,
} from '../src/utils/regionUtils';
import { de, en } from '../src/i18n';
import type { Strings } from '../src/i18n/strings';

const { width: W } = Dimensions.get('window');

// ── Tracking Goals (i18n-aware) ───────────────────────────────
function getGoals(t: Strings) {
  return [
    { id: 'medication',   icon: '💊', label: t.goalMedicationLabel, desc: t.goalMedicationDesc,  color: '#c084fc' },
    { id: 'adhd',         icon: '🧠', label: t.goalAdhdLabel,       desc: t.goalAdhdDesc,        color: '#38bdf8' },
    { id: 'sleep',        icon: '🌙', label: t.goalSleepLabel,      desc: t.goalSleepDesc,       color: '#818cf8' },
    { id: 'stimulant',    icon: '⚡', label: t.goalStimulantLabel,  desc: t.goalStimulantDesc,   color: '#f59e0b' },
    { id: 'supplement',   icon: '🌱', label: t.goalSupplementLabel, desc: t.goalSupplementDesc,  color: '#4ade80' },
    { id: 'recreational', icon: '🍺', label: t.goalRecLabel,        desc: t.goalRecDesc,         color: '#94a3b8' },
  ];
}

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
function StepWelcome({ onNext, t }: { onNext: () => void; t: Strings }) {
  return (
    <View style={s.stepWrap}>
      <View style={s.welcomeLogo}>
        <Text style={s.welcomeEmoji}>〜</Text>
      </View>
      <Text style={s.welcomeTitle}>CurveDay</Text>
      <Text style={s.welcomeTagline}>{t.onboardingWelcomeTagline}</Text>
      <Text style={s.welcomeDesc}>{t.onboardingWelcomeDesc}</Text>
      <TouchableOpacity style={s.btnPrimary} onPress={onNext}>
        <Text style={s.btnPrimaryText}>{t.onboardingStart}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 1: Region ────────────────────────────────────────────
function StepRegion({ onNext, t }: { onNext: (region: Region) => void; t: Strings }) {
  const [selected, setSelected] = useState<Region | null>(null);

  return (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>{t.onboardingRegionTitle}</Text>
      <Text style={s.stepSub}>{t.onboardingRegionSub}</Text>

      <View style={{ gap: 12, marginTop: 8, marginBottom: 24 }}>
        {REGION_OPTIONS.map(r => {
          const active = selected === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[s.regionRow, active && s.regionRowActive]}
              onPress={() => setSelected(r.id)}
              activeOpacity={0.75}
            >
              <Text style={s.regionFlag}>{r.flag}</Text>
              <View style={s.regionBody}>
                <Text style={[s.regionLabel, active && { color: '#fff' }]}>{r.label}</Text>
                <Text style={s.regionSub}>{r.sub}</Text>
              </View>
              <View style={[s.regionCheck, active && s.regionCheckActive]}>
                {active && <Text style={s.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[s.btnPrimary, !selected && s.btnDisabled]}
        onPress={() => selected && onNext(selected)}
        disabled={!selected}
      >
        <Text style={s.btnPrimaryText}>{t.next} →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 2: Disclaimer ────────────────────────────────────────
function StepDisclaimer({ onNext, t }: { onNext: (timestamp: string) => void; t: Strings }) {
  const [scrolled, setScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);

  function handleScroll(e: any) {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 40) {
      setScrolled(true);
    }
  }

  return (
    <View style={s.stepWrap}>
      <Text style={s.disclaimerHeadline}>{t.onboardingDisclTitle}</Text>
      <Text style={s.disclaimerSub}>{t.onboardingDisclSub}</Text>

      <ScrollView
        style={s.disclaimerScroll}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator
      >
        <Text style={s.disclaimerBody}>
          <Text style={s.disclaimerBold}>CurveDay ist kein medizinisches Produkt.{'\n\n'}</Text>

          Diese App dient ausschließlich zur allgemeinen Information und Visualisierung
          pharmakologischer Durchschnittsdaten. Sie ist{' '}
          <Text style={s.disclaimerBold}>kein Medizinprodukt</Text>,{' '}
          <Text style={s.disclaimerBold}>keine Diagnosesoftware</Text> und ersetzt{' '}
          <Text style={s.disclaimerBold}>keinen Arzt, Apotheker oder medizinischen Fachmann</Text>.{'\n\n'}

          <Text style={s.disclaimerBold}>Was diese App NICHT kann:{'\n'}</Text>
          {'• '}Medizinische Diagnosen stellen{'\n'}
          {'• '}Therapieempfehlungen geben{'\n'}
          {'• '}Wechselwirkungen vollständig bewerten{'\n'}
          {'• '}Individuelle Pharmakodynamik vorhersagen{'\n'}
          {'• '}Notfallsituationen erkennen oder behandeln{'\n\n'}

          <Text style={s.disclaimerBold}>Individuelle Variabilität:{'\n'}</Text>
          Alle Werte sind{' '}
          <Text style={s.disclaimerBold}>Populationsdurchschnitte eines 70 kg schweren Erwachsenen</Text>.
          Körpergewicht, Alter, Geschlecht, Erkrankungen, Genetik (z. B. CYP-Enzyme),
          Nahrungsaufnahme und weitere Medikamente können die tatsächliche Wirkung und
          Wirkdauer bei dir <Text style={s.disclaimerBold}>erheblich</Text> abweichen lassen.{'\n\n'}

          <Text style={s.disclaimerBold}>Deine Verantwortung:{'\n'}</Text>
          Du nutzt diese App auf eigene Verantwortung. Die Entwickler übernehmen keinerlei
          Haftung für Entscheidungen, die auf Basis der angezeigten Informationen getroffen werden.{'\n\n'}

          <Text style={s.disclaimerBold}>Bei medizinischen Fragen:{'\n'}</Text>
          Wende dich immer an einen Arzt oder Apotheker — vor allem bei verschreibungspflichtigen
          Medikamenten und Betäubungsmitteln.{'\n\n'}

          <Text style={[s.disclaimerBold, { color: '#f87143' }]}>Im Notfall: Ruf sofort 112 an.{'\n\n'}</Text>

          Durch Antippen von „Akzeptieren" bestätigst du, dass du diese Hinweise vollständig
          gelesen und verstanden hast, und dass du CurveDay ausschließlich als allgemeine
          Informationsquelle nutzt.
        </Text>
        {!scrolled && (
          <Text style={s.scrollHint}>{t.onboardingDisclScroll}</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={s.checkRow}
        onPress={() => scrolled && setAccepted(a => !a)}
        activeOpacity={0.7}
      >
        <View style={[s.checkbox, accepted && s.checkboxChecked]}>
          {accepted && <Text style={s.checkmark}>✓</Text>}
        </View>
        <Text style={[s.checkLabel, !scrolled && s.checkLabelDim]}>
          {t.onboardingDisclAccept}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.btnPrimary, (!accepted || !scrolled) && s.btnDisabled]}
        onPress={() => (accepted && scrolled) && onNext(new Date().toISOString())}
        disabled={!accepted || !scrolled}
      >
        <Text style={s.btnPrimaryText}>{t.onboardingDisclAcceptBtn}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 3: Tracking Goals ────────────────────────────────────
function StepGoals({ onNext, t }: { onNext: (goals: string[]) => void; t: Strings }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const GOALS = getGoals(t);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>{t.onboardingGoalsTitle}</Text>
      <Text style={s.stepSub}>{t.onboardingGoalsSub}</Text>

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
        <Text style={s.btnPrimaryText}>{t.onboardingGoalsBtn(selected.size)}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 4: Profile ───────────────────────────────────────────
function StepProfile({ onNext, t, region }: {
  onNext: (profile: UserProfile) => void;
  t: Strings;
  region: Region;
}) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge]       = useState('');
  const [sex, setSex]       = useState<string | null>(null);

  const wUnit = weightUnitLabel(region);
  const hUnit = heightUnitLabel(region);

  function handleNext(skip = false) {
    if (skip) return onNext({});
    const profile: UserProfile = {};
    const wKg = parseWeightToKg(weight, region);
    const hCm = parseHeightToCm(height, region);
    const a   = parseInt(age, 10);
    if (wKg > 0)                profile.weight = wKg;
    if (hCm > 0)                profile.height = hCm;
    if (!isNaN(a) && a > 0)    profile.age    = a;
    if (sex)                    profile.sex    = sex as any;
    onNext(profile);
  }

  const SEX_OPTIONS = [
    { id: 'male',   label: t.onboardingSexMale },
    { id: 'female', label: t.onboardingSexFemale },
    { id: 'other',  label: t.onboardingSexOther },
  ];

  return (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>{t.onboardingProfileTitle}</Text>
      <Text style={s.stepSub}>{t.onboardingProfileSub}</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: 12 }}>

        {/* Info hint */}
        <View style={s.profileHint}>
          <Text style={s.profileHintText}>{t.onboardingProfileHint}</Text>
        </View>

        {/* Weight + Height */}
        <View style={s.profileRow}>
          <View style={[s.profileField, { flex: 1 }]}>
            <Text style={s.profileLabel}>{t.onboardingWeight}</Text>
            <View style={s.profileInputWrap}>
              <TextInput
                style={s.profileInput}
                value={weight}
                onChangeText={setWeight}
                placeholder={region === 'US' ? '154' : '70'}
                placeholderTextColor="#4a5a70"
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={s.profileUnit}>{wUnit}</Text>
            </View>
          </View>
          <View style={[s.profileField, { flex: 1 }]}>
            <Text style={s.profileLabel}>{t.onboardingHeight}</Text>
            <View style={s.profileInputWrap}>
              <TextInput
                style={s.profileInput}
                value={height}
                onChangeText={setHeight}
                placeholder={region === 'US' ? '69' : '175'}
                placeholderTextColor="#4a5a70"
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={s.profileUnit}>{hUnit}</Text>
            </View>
          </View>
        </View>

        {/* Age */}
        <View style={s.profileField}>
          <Text style={s.profileLabel}>{t.onboardingAge}</Text>
          <View style={s.profileInputWrap}>
            <TextInput
              style={s.profileInput}
              value={age}
              onChangeText={setAge}
              placeholder="30"
              placeholderTextColor="#4a5a70"
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={s.profileUnit}>{t.settingsAgeUnit}</Text>
          </View>
        </View>

        {/* Sex */}
        <View style={s.profileField}>
          <Text style={s.profileLabel}>{t.onboardingSex}</Text>
          <View style={s.sexRow}>
            {SEX_OPTIONS.map(o => (
              <TouchableOpacity
                key={o.id}
                style={[s.sexChip, sex === o.id && s.sexChipActive]}
                onPress={() => setSex(sex === o.id ? null : o.id)}
                activeOpacity={0.75}
              >
                <Text style={[s.sexChipText, sex === o.id && s.sexChipTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.profileFieldNote}>{t.onboardingSexNote}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={s.btnSecondary} onPress={() => handleNext(true)}>
        <Text style={s.btnSecondaryText}>{t.onboardingProfileSkipBtn}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnPrimary} onPress={() => handleNext(false)}>
        <Text style={s.btnPrimaryText}>{t.onboardingProfileSaveBtn}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 5: Ready ─────────────────────────────────────────────
function StepReady({ goals, onFinish, t }: {
  goals: string[];
  onFinish: () => void;
  t: Strings;
}) {
  const GOALS = getGoals(t);
  const selectedGoals = GOALS.filter(g => goals.includes(g.id));

  return (
    <View style={s.stepWrap}>
      <Text style={s.readyEmoji}>🚀</Text>
      <Text style={s.stepTitle}>{t.onboardingReadyTitle}</Text>
      <Text style={s.stepSub}>{t.onboardingReadySub}</Text>

      <View style={s.readyGoals}>
        {selectedGoals.map(g => (
          <View key={g.id} style={[s.readyChip, { backgroundColor: g.color + '20', borderColor: g.color + '50' }]}>
            <Text style={s.readyChipText}>{g.icon} {g.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.readyHints}>
        <Text style={s.readyHint}>{t.onboardingReadyHint1}</Text>
        <Text style={s.readyHint}>{t.onboardingReadyHint2}</Text>
        <Text style={s.readyHint}>{t.onboardingReadyHint3}</Text>
        <Text style={s.readyHint}>{t.onboardingReadyHint4}</Text>
      </View>

      <TouchableOpacity style={s.btnPrimary} onPress={onFinish}>
        <Text style={s.btnPrimaryText}>{t.onboardingReadyBtn}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main Onboarding ───────────────────────────────────────────
export default function OnboardingScreen() {
  const { completeOnboarding } = useOnboardingStore();
  const [step,    setStep]   = useState(0);
  const [region,  setRegion] = useState<Region>('DE');
  const [discTs,  setDiscTs] = useState<string | null>(null);
  const [goals,   setGoals]  = useState<string[]>([]);
  const [profile, setProfile]= useState<UserProfile>({});

  // Language switches as soon as user picks their region on step 1
  const t: Strings = region === 'US' ? en : de;

  const TOTAL_STEPS = 5; // steps 1–5 shown in indicator

  async function finish() {
    await requestNotificationPermissions();
    await completeOnboarding({
      trackingGoals: goals,
      disclaimerAcceptedAt: discTs,
      profile: { ...profile, region },
    });
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={s.safe}>
      {step > 0 && <Steps current={step - 1} total={TOTAL_STEPS} />}

      {step === 0 && <StepWelcome    onNext={() => setStep(1)} t={t} />}
      {step === 1 && <StepRegion     onNext={(r) => { setRegion(r); setStep(2); }} t={t} />}
      {step === 2 && <StepDisclaimer onNext={(ts) => { setDiscTs(ts); setStep(3); }} t={t} />}
      {step === 3 && <StepGoals      onNext={(g) => { setGoals(g); setStep(4); }} t={t} />}
      {step === 4 && <StepProfile    onNext={(p) => { setProfile(p); setStep(5); }} t={t} region={region} />}
      {step === 5 && <StepReady      goals={goals} onFinish={finish} t={t} />}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const ACCENT = '#38bdf8';
const BG     = '#060b13';
const SURFACE= '#0d1a2a';
const BORDER = '#132033';
const TEXT   = '#e2f0ff';
const DIM    = '#4a5a70';
const SUB    = '#7a9ab5';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  steps: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 16, paddingBottom: 4 },
  step:  { width: 24, height: 4, borderRadius: 2, backgroundColor: BORDER },
  stepActive: { backgroundColor: ACCENT },

  stepWrap: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },

  // Welcome
  welcomeLogo: {
    width: 96, height: 96, borderRadius: 26,
    backgroundColor: `${ACCENT}15`, borderWidth: 1, borderColor: `${ACCENT}30`,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 48, marginBottom: 28,
  },
  welcomeEmoji:   { fontSize: 48, color: ACCENT },
  welcomeTitle:   { fontSize: 36, fontWeight: '800', color: TEXT, textAlign: 'center', marginBottom: 12 },
  welcomeTagline: { fontSize: 20, color: ACCENT, fontWeight: '600', textAlign: 'center', lineHeight: 28, marginBottom: 20 },
  welcomeDesc:    { fontSize: 15, color: SUB, textAlign: 'center', lineHeight: 22, marginBottom: 40 },

  // Disclaimer
  disclaimerHeadline: { fontSize: 22, fontWeight: '800', color: TEXT, marginTop: 24, marginBottom: 4 },
  disclaimerSub:      { fontSize: 13, color: SUB, marginBottom: 16 },
  disclaimerScroll:   {
    flex: 1, backgroundColor: SURFACE, borderRadius: 14,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER,
  },
  disclaimerBody: { fontSize: 13, color: SUB, lineHeight: 20 },
  disclaimerBold: { color: TEXT, fontWeight: '700' },
  scrollHint:     { fontSize: 12, color: ACCENT, textAlign: 'center', marginTop: 12, marginBottom: 4 },

  checkRow:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  checkbox:        { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: DIM, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkmark:       { color: '#000', fontWeight: '900', fontSize: 13 },
  checkLabel:      { flex: 1, fontSize: 13, color: TEXT, lineHeight: 19 },
  checkLabelDim:   { color: DIM },

  // Region
  regionRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURFACE, borderRadius: 14,
    padding: 16, borderWidth: 1.5, borderColor: BORDER,
  },
  regionRowActive: { borderColor: ACCENT, backgroundColor: `${ACCENT}12` },
  regionFlag:  { fontSize: 32, width: 46, textAlign: 'center' },
  regionBody:  { flex: 1, marginLeft: 10 },
  regionLabel: { fontSize: 16, fontWeight: '700', color: '#b0c8e0', marginBottom: 2 },
  regionSub:   { fontSize: 12, color: DIM },
  regionCheck: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: DIM, alignItems: 'center', justifyContent: 'center' },
  regionCheckActive: { backgroundColor: ACCENT, borderColor: ACCENT },

  // Goals
  stepTitle:   { fontSize: 24, fontWeight: '800', color: TEXT, marginTop: 24, marginBottom: 8 },
  stepSub:     { fontSize: 14, color: SUB, lineHeight: 20, marginBottom: 20 },
  goalsScroll: { flex: 1, marginBottom: 16 },
  goalRow:     {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURFACE, borderRadius: 14,
    padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: BORDER,
  },
  goalIcon:  { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  goalEmoji: { fontSize: 24 },
  goalBody:  { flex: 1, marginHorizontal: 12 },
  goalLabel: { fontSize: 15, fontWeight: '700', color: '#b0c8e0', marginBottom: 3 },
  goalDesc:  { fontSize: 12, color: DIM, lineHeight: 16 },
  goalCheck: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: DIM, alignItems: 'center', justifyContent: 'center' },

  // Profile
  profileHint:     { backgroundColor: `${ACCENT}12`, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: `${ACCENT}25` },
  profileHintText: { fontSize: 13, color: ACCENT, lineHeight: 19 },
  profileRow:      { flexDirection: 'row', gap: 12 },
  profileField:    { backgroundColor: SURFACE, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  profileLabel:    { fontSize: 11, fontWeight: '700', color: DIM, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  profileInputWrap:{ flexDirection: 'row', alignItems: 'center' },
  profileInput:    { flex: 1, fontSize: 22, fontWeight: '700', color: TEXT },
  profileUnit:     { fontSize: 14, color: DIM, marginLeft: 6 },
  profileFieldNote:{ fontSize: 11, color: DIM, lineHeight: 16, marginTop: 8 },
  sexRow:          { flexDirection: 'row', gap: 8, marginTop: 4 },
  sexChip:         { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: BORDER, backgroundColor: BG, alignItems: 'center' },
  sexChipActive:   { backgroundColor: `${ACCENT}20`, borderColor: ACCENT },
  sexChipText:     { fontSize: 13, color: DIM, fontWeight: '600' },
  sexChipTextActive:{ color: ACCENT },

  // Ready
  readyEmoji:    { fontSize: 56, textAlign: 'center', marginTop: 36, marginBottom: 16 },
  readyGoals:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 28 },
  readyChip:     { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  readyChipText: { fontSize: 13, color: TEXT, fontWeight: '600' },
  readyHints:    { gap: 10, marginBottom: 36 },
  readyHint:     { fontSize: 14, color: SUB },

  // Buttons
  btnPrimary:      { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled:     { backgroundColor: BORDER },
  btnPrimaryText:  { fontSize: 16, fontWeight: '700', color: '#000' },
  btnSecondary:    { borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnSecondaryText:{ fontSize: 14, color: DIM },
});
