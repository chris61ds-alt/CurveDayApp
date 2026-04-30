/**
 * CurveDay – Region / Locale Utilities
 * Supports: DE (Germany), US (United States), AT (Austria), CH (Switzerland)
 */

export type Region = 'DE' | 'US' | 'AT' | 'CH';

export const REGION_OPTIONS: { id: Region; flag: string; label: string; sub: string }[] = [
  { id: 'DE', flag: '🇩🇪', label: 'Deutschland',   sub: 'Deutsch · kg / cm' },
  { id: 'US', flag: '🇺🇸', label: 'United States', sub: 'English · lbs / in' },
  { id: 'AT', flag: '🇦🇹', label: 'Österreich',    sub: 'Deutsch · kg / cm' },
  { id: 'CH', flag: '🇨🇭', label: 'Schweiz',       sub: 'Deutsch · kg / cm' },
];

// ── Substance name ────────────────────────────────────────────
export function getSubstanceName(sub: any, region: Region): string {
  if (region === 'US' && sub.nameUS) return sub.nameUS;
  return sub.name;
}

// ── Weight formatting ─────────────────────────────────────────
export function formatWeight(kg: number | undefined, region: Region): string {
  if (kg === undefined || kg === null) return '–';
  if (region === 'US') return `${Math.round(kg * 2.20462)} lbs`;
  return `${kg} kg`;
}

export function weightUnitLabel(region: Region): string {
  return region === 'US' ? 'lbs' : 'kg';
}

/** Convert user input (lbs for US, kg otherwise) to kg */
export function parseWeightToKg(value: string, region: Region): number {
  const n = parseFloat(value.replace(',', '.'));
  if (isNaN(n) || n <= 0) return 0;
  return region === 'US' ? n / 2.20462 : n;
}

/** Format stored kg value to display value string for input field */
export function weightToDisplayValue(kg: number | undefined, region: Region): string {
  if (!kg) return '';
  if (region === 'US') return String(Math.round(kg * 2.20462));
  return String(kg);
}

// ── Height formatting ─────────────────────────────────────────
export function formatHeight(cm: number | undefined, region: Region): string {
  if (cm === undefined || cm === null) return '–';
  if (region === 'US') {
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inches = Math.round(totalIn % 12);
    return `${ft}'${inches}"`;
  }
  return `${cm} cm`;
}

export function heightUnitLabel(region: Region): string {
  return region === 'US' ? 'in' : 'cm';
}

/** Convert user input (inches for US, cm otherwise) to cm */
export function parseHeightToCm(value: string, region: Region): number {
  const n = parseFloat(value.replace(',', '.'));
  if (isNaN(n) || n <= 0) return 0;
  return region === 'US' ? n * 2.54 : n;
}

/** Format stored cm value to display value string for input field */
export function heightToDisplayValue(cm: number | undefined, region: Region): string {
  if (!cm) return '';
  if (region === 'US') return String(Math.round(cm / 2.54));
  return String(cm);
}

// ── Region label helper ───────────────────────────────────────
export function getRegionLabel(region: Region): string {
  return REGION_OPTIONS.find(r => r.id === region)?.label ?? region;
}
