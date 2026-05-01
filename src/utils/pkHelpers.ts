import { getSubstance, generateCurve, getActiveInteractions } from '../data/substanceDB';

export interface Intake {
  substanceId: string;
  timeH: number;      // Uhrzeit als Dezimalstunde, z.B. 8.5 = 08:30
  doseLabel: string;  // z.B. "400 mg"
  id: string;
  takenAt?: string;   // ISO-Timestamp, z.B. "2026-04-30T23:00:00.000Z"
                      // Ermöglicht Carry-over von gestern. Falls fehlt: timeH = heute.
}

export interface ChartRow {
  time: string;
  total: number;
  [substanceId: string]: number | string;
}

// ─────────────────────────────────────────────────────────────
// Hilfsfunktion: Stunden relativ zu heute 00:00 Uhr (lokal)
// Gestern 23:00 → -1.0  |  Heute 08:30 → 8.5  |  Morgen 02:00 → 26.0
// ─────────────────────────────────────────────────────────────
export function getIntakeHourToday(intake: Intake): number {
  if (!intake.takenAt) return intake.timeH; // Rückwärtskompatibilität

  const taken        = new Date(intake.takenAt);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  return (taken.getTime() - todayMidnight.getTime()) / 3_600_000;
}

export function fmtHour(h: number): string {
  const H = Math.floor(h) % 24;
  const M = Math.round((h % 1) * 60);
  if (M === 60) return `${String((H + 1) % 24).padStart(2, '0')}:00`;
  return `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}`;
}

export function getPeakLabel(timeH: number, substanceId: string): string {
  const sub = getSubstance(substanceId);
  if (!sub) return '–';
  const peak = timeH + sub.pk.tmaxHours;
  return `${fmtHour(peak)} – ${fmtHour(peak + 1)}`;
}

// ─────────────────────────────────────────────────────────────
// Chart-Daten aufbauen mit dynamischem Zeitfenster.
//
// Das Fenster reicht von 0:00 bis max(24h, letztes Kurvenende),
// maximal 48h. Intakes von gestern werden mit negativem intakeHour
// eingebaut → Carry-over korrekt sichtbar.
// ─────────────────────────────────────────────────────────────
export function buildChartData(intakes: Intake[]): ChartRow[] {
  // 1) Benötigtes Fenster berechnen
  let maxEndHour = 24;
  for (const intake of intakes) {
    const sub = getSubstance(intake.substanceId);
    if (!sub) continue;
    const intakeHour = getIntakeHourToday(intake);
    // Sehr lange Substanzen (Vitamin D3 72h) auf 36h deckeln —
    // ihr Plateau-Effekt ist ohnehin über generateCurve als Steady-State dargestellt
    const effectiveDur = Math.min(sub.pk.durationHours ?? 0, 36);
    const endHour = intakeHour + effectiveDur;
    if (endHour > maxEndHour) maxEndHour = endHour;
  }
  // Fenster: auf halbe Stunden aufrunden, Minimum 24h, Maximum 48h
  const windowHours = Math.min(48, Math.ceil(maxEndHour / 0.5) * 0.5 + 1);
  const numPoints   = Math.round(windowHours * 2) + 1;

  // 2) Kurven mit korrekter Punktanzahl generieren
  const curves = intakes.map(intake => {
    const sub        = getSubstance(intake.substanceId);
    if (!sub) return { id: intake.substanceId, curve: [] };
    const intakeHour = getIntakeHourToday(intake);
    const endHour    = intakeHour + (sub.pk.durationHours ?? 0);
    // Intakes überspringen die >36h in der Vergangenheit enden oder zu weit in der Zukunft
    if (endHour < -2 || intakeHour > windowHours) {
      return { id: intake.substanceId, curve: [] };
    }
    return { id: intake.substanceId, curve: generateCurve(sub, intakeHour, numPoints) };
  });

  // 3) ChartRow-Array mit dynamischer Länge aufbauen
  return Array.from({ length: numPoints }, (_, i) => {
    const h = i / 2;
    const row: ChartRow = {
      time: `${String(Math.floor(h % 24)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`,
      total: 0,
    };
    curves.forEach(({ id, curve }) => {
      row[id] = (curve[i] as any)?.value ?? 0;
    });
    const vals = curves.map(({ curve }) => (curve[i] as any)?.value ?? 0);
    row.total = +Math.min(100, vals.reduce((a: number, b: number) => a + b, 0) * 0.38).toFixed(1);
    return row;
  });
}

export function getRemainingTime(intake: Intake, nowH: number): string {
  const sub = getSubstance(intake.substanceId);
  if (!sub) return '–';
  const intakeHour = getIntakeHourToday(intake);
  const rem = intakeHour + sub.pk.durationHours - nowH;
  if (rem <= 0) return 'abgelaufen';
  const h = Math.floor(rem);
  const m = Math.round((rem - h) * 60);
  return m > 0 ? `noch ${h}h ${m}m` : `noch ${h}h`;
}

export function isActive(intake: Intake, nowH: number): boolean {
  const sub = getSubstance(intake.substanceId);
  if (!sub) return false;
  const intakeHour = getIntakeHourToday(intake);
  return nowH >= intakeHour && nowH <= intakeHour + sub.pk.durationHours;
}

export function getCurrentEffect(substanceId: string, chartData: ChartRow[], nowH: number): number {
  const idx = Math.min(Math.round(nowH * 2), Math.max(0, chartData.length - 1));
  const val = chartData[idx]?.[substanceId];
  return typeof val === 'number' ? val : 0;
}

export const EFFECT_LABELS: Record<string, string> = {
  pain: 'Schmerzreduktion', inflammation: 'Entzündung', fever: 'Fieber',
  concentration: 'Konzentration', impulseControl: 'Impulskontrolle',
  energy: 'Energie', mood: 'Stimmung', relaxation: 'Entspannung',
  sleep: 'Schlaf', alertness: 'Wachheit', focus: 'Fokus',
  immunity: 'Immunsystem', muscleRelax: 'Muskelentspannung',
  stressReduction: 'Stressabbau', cognition: 'Kognition',
  cardiovascular: 'Herz-Kreislauf', antioxidant: 'Antioxidans',
  strength: 'Kraft', anxietyReduction: 'Angstabbau',
  antihistamine: 'Antiallergisch', acidSuppression: 'Magensäure ↓',
};

export const IX_TYPE: Record<string, { tag: string; tc: string }> = {
  synergy:    { tag: 'Synergie',     tc: '#4ade80' },
  antagonist: { tag: 'Antagonismus', tc: '#f59e0b' },
  risk:       { tag: 'Risiko',       tc: '#f87171' },
  mixed:      { tag: 'Gemischt',     tc: '#94a3b8' },
};

export const IX_SEVERITY_COLOR: Record<string, string> = {
  low: '#4ade80', moderate: '#f59e0b', high: '#f87171', critical: '#ef4444',
};

export const IX_SEVERITY_LABEL: Record<string, string> = {
  low: 'Niedrig', moderate: 'Moderat', high: 'Hoch', critical: 'Kritisch',
};
