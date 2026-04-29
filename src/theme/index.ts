// ── CurveDay Design Tokens ────────────────────────────────────

export const DARK = {
  // Backgrounds
  bg:          '#060b13',
  surface:     '#0a1520',
  surfaceHigh: '#0d1a2a',
  bg2:         '#0d1a2a',
  bg3:         '#132033',
  // Borders
  border:      '#0f2035',
  borderMid:   '#162840',
  border2:     '#132033',
  // Text
  text:        '#e8f0f8',
  textSub:     '#7a9ab5',
  textDim:     '#3a5570',
  textMuted:   '#4a5a70',
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
};

export const LIGHT = {
  // Backgrounds
  bg:          '#f0f5fa',
  surface:     '#ffffff',
  surfaceHigh: '#f8fafc',
  bg2:         '#ffffff',
  bg3:         '#e8f0f8',
  // Borders
  border:      '#dde6ef',
  borderMid:   '#ccdae8',
  border2:     '#dde6ef',
  // Text
  text:        '#0d1a2a',
  textSub:     '#3a5570',
  textDim:     '#7a9ab5',
  textMuted:   '#7a9ab5',
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
  gridLine:    '#dde6ef',
  statusBar:   'dark' as 'light' | 'dark',
  isDark:      false,
};

export type ThemeColors = typeof DARK;
