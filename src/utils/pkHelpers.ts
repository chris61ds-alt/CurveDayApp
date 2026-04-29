import { getSubstance, generateCurve, getActiveInteractions } from '../data/substanceDB';

export interface Intake {
  substanceId: string;
  timeH: number;      // z.B. 8.5 = 08:30
  doseLabel: string;  // z.B. "400 mg"
  id: string;
}

export interface ChartRow {
  time: string;
  total: number;
  [substanceId: string]: number | string;
}

export function fmtHour(h: number): string {
  const H = Math.floor(h) % 24;
  return `${String(H).padStart(2, '0')}:${h % 1 >= 0.5 ? '30' : '00'}`;
}

export function getPeakLabel(timeH: number, substanceId: string): string {
  const sub = getSubstance(substanceId);
  if (!sub) return '–';
  const peak = timeH + sub.pk.tmaxHours;
  return `${fmtHour(peak)} – ${fmtHour(peak + 1)}`;
}

export function buildChartData(intakes: Intake[]): ChartRow[] {
  const curves = intakes.map(intake => {
    const sub = getSubstance(intake.substanceId);
    return { id: intake.substanceId, curve: sub ? generateCurve(sub, intake.timeH) : [] };
  });

  return Array.from({ length: 49 }, (_, i) => {
    const h = i / 2;
    const row: ChartRow = {
      time: `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`,
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
  const rem = intake.timeH + sub.pk.durationHours - nowH;
  if (rem <= 0) return 'abgelaufen';
  const h = Math.floor(rem);
  const m = Math.round((rem - h) * 60);
  return m > 0 ? `noch ${h}h ${m}m` : `noch ${h}h`;
}

export function isActive(intake: Intake, nowH: number): boolean {
  const sub = getSubstance(intake.substanceId);
  if (!sub) return false;
  return nowH >= intake.timeH && nowH <= intake.timeH + sub.pk.durationHours;
}

export function getCurrentEffect(substanceId: string, chartData: ChartRow[], nowH: number): number {
  const idx = Math.min(Math.round(nowH * 2), 48);
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
