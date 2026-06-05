// ── CurveDay Design Tokens ────────────────────────────────────

export const DARK = {
  // Backgrounds
  bg:          '#060b13',
  surface:     '#0c1828',
  surfaceHigh: '#0f1f32',
  bg2:         '#0d1a2a',
  bg3:         '#132033',
  // Borders
  border:      '#122238',
  borderMid:   '#1a2f48',
  border2:     '#132033',
  // Text
  text:        '#eaf2fa',
  textSub:     '#8ab0cc',
  textDim:     '#5a7d98',
  textMuted:   '#5a7d98',
  // Accent
  accent:      '#38bdf8',
  accentBg:    '#38bdf820',
  accentDim:   '#38bdf812',
  // States
  danger:      '#f87143',
  dangerBg:    '#f8714320',
  success:     '#4ade80',
  successBg:   '#4ade8020',
  warning:     '#f59e0b',
  warningBg:   '#f59e0b20',
  // Special
  gridLine:    '#182840',
  statusBar:   'light' as 'light' | 'dark',
  isDark:      true,
  // Elevation
  shadowColor:   '#000' as string,
  shadowOpacity: 0.28,
  cardElevation: 4,
};

export const LIGHT = {
  // Backgrounds
  bg:          '#eef4fa',
  surface:     '#ffffff',
  surfaceHigh: '#f6f9fc',
  bg2:         '#ffffff',
  bg3:         '#e4edf6',
  // Borders
  border:      '#d8e4ef',
  borderMid:   '#c6d8e8',
  border2:     '#d8e4ef',
  // Text
  text:        '#0a1622',
  textSub:     '#32506a',
  textDim:     '#7090a8',
  textMuted:   '#7090a8',
  // Accent
  accent:      '#0ea5e9',
  accentBg:    '#0ea5e920',
  accentDim:   '#0ea5e912',
  // States
  danger:      '#dc4c1a',
  dangerBg:    '#dc4c1a15',
  success:     '#16a34a',
  successBg:   '#16a34a15',
  warning:     '#d97706',
  warningBg:   '#d9770615',
  // Special
  gridLine:    '#d8e4ef',
  statusBar:   'dark' as 'light' | 'dark',
  isDark:      false,
  // Elevation
  shadowColor:   '#1a3a5c' as string,
  shadowOpacity: 0.09,
  cardElevation: 3,
};

export type ThemeColors = typeof DARK;
