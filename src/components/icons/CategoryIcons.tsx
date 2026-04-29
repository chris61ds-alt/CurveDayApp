import React from 'react';
import Svg, { Path, Circle, Line, Rect, Ellipse, G } from 'react-native-svg';

interface IconProps { color: string; s: number }

// ── Analgesic – scored tablet ─────────────────────────────────
export function IconAnalgesic({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      <Circle cx="11" cy="11" r="8.5" fill={`${color}28`} stroke={color} strokeWidth="1.6" />
      <Line x1="11" y1="3.5" x2="11" y2="18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

// ── ADHD – brain + lightning bolt ─────────────────────────────
export function IconADHD({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      {/* Brain left lobe */}
      <Path
        d="M11 16.5 C7.5 16.5 4 14 4 10 C4 7.5 5.5 5.5 8 5 C8.5 3.8 9.5 3 11 3"
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Brain right lobe */}
      <Path
        d="M11 16.5 C14.5 16.5 18 14 18 10 C18 7.5 16.5 5.5 14 5 C13.5 3.8 12.5 3 11 3"
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Center divider */}
      <Line x1="11" y1="5.5" x2="11" y2="16" stroke={color} strokeWidth="1" opacity="0.4" strokeDasharray="2,2" />
      {/* Lightning bolt */}
      <Path d="M12.5 8 L10 12 L12 12 L9.5 16.5 L14 11 L12 11 Z" fill={color} opacity="0.85" />
    </Svg>
  );
}

// ── Sleep – crescent moon + stars ────────────────────────────
export function IconSleep({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      {/* Moon */}
      <Path
        d="M15.5 10.5 C15.5 14.09 12.59 17 9 17 C7.8 17 6.68 16.67 5.73 16.1 C7.02 16.68 8.47 17 10 17 C14.14 17 17.5 13.64 17.5 9.5 C17.5 7.97 17.08 6.52 16.3 5.3 C16.1 6.95 16 8.76 15.5 10.5 Z"
        fill={color} opacity="0.3"
      />
      <Path
        d="M15 9.5 C15 6.46 12.76 3.94 9.84 3.5 C10.5 3.18 11.22 3 12 3 C15.31 3 18 5.69 18 9 C18 12.31 15.31 15 12 15 C11.22 15 10.5 14.82 9.84 14.5 C12.76 14.06 15 11.54 15 9.5 Z"
        fill={color}
      />
      {/* Stars */}
      <Circle cx="4.5" cy="6.5" r="0.9" fill={color} opacity="0.7" />
      <Circle cx="7.5" cy="4"   r="0.65" fill={color} opacity="0.55" />
      <Circle cx="3"   cy="12"  r="0.55" fill={color} opacity="0.45" />
    </Svg>
  );
}

// ── Stimulant – coffee cup + steam ───────────────────────────
export function IconStimulant({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      {/* Steam */}
      <Path d="M8.5 7.5 Q9 6 8.5 4.5"   fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <Path d="M11 7.5 Q11.5 5.5 11 4"  fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
      <Path d="M13.5 7.5 Q14 6 13.5 4.5" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      {/* Cup body */}
      <Path
        d="M5 9.5 L6 18 Q6.2 19 8 19 L14 19 Q15.8 19 16 18 L17 9.5 Z"
        fill={`${color}28`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Handle */}
      <Path
        d="M17 11.5 Q20.5 11.5 20.5 14.5 Q20.5 17.5 17 17.5"
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Coffee top */}
      <Ellipse cx="11" cy="9.5" rx="6" ry="1.5" fill={color} opacity="0.2" />
    </Svg>
  );
}

// ── Antihistamine – leaf with veins ──────────────────────────
export function IconAntihistamine({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      {/* Leaf */}
      <Path
        d="M11 19 C11 19 3.5 15.5 3.5 8 C3.5 5 6 2.5 11 2.5 C16 2.5 18.5 5 18.5 8 C18.5 15.5 11 19 11 19 Z"
        fill={`${color}30`} stroke={color} strokeWidth="1.5"
      />
      {/* Stem */}
      <Line x1="11" y1="19" x2="11" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Centre vein */}
      <Line x1="11" y1="5.5" x2="11" y2="17" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      {/* Side veins */}
      <Line x1="11" y1="9"  x2="7.5"  y2="12" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <Line x1="11" y1="9"  x2="14.5" y2="12" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <Line x1="11" y1="13" x2="8.5"  y2="15.5" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <Line x1="11" y1="13" x2="13.5" y2="15.5" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

// ── Cardiovascular – heart with pulse ─────────────────────────
export function IconCardiovascular({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      {/* Heart */}
      <Path
        d="M11 18 C11 18 3 13 3 7.5 C3 5.2 4.8 3.5 7.5 3.5 C9 3.5 10.2 4.3 11 5.2 C11.8 4.3 13 3.5 14.5 3.5 C17.2 3.5 19 5.2 19 7.5 C19 13 11 18 11 18 Z"
        fill={`${color}28`} stroke={color} strokeWidth="1.6"
      />
      {/* Pulse line */}
      <Path
        d="M5 9.5 L7.5 9.5 L9 7 L11 12 L12.5 8.5 L14 9.5 L17 9.5"
        fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Antidepressant – smiling sun ──────────────────────────────
export function IconAntidepressant({ color, s }: IconProps) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      {rays.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 11 + Math.cos(rad) * 6.5;
        const y1 = 11 + Math.sin(rad) * 6.5;
        const x2 = 11 + Math.cos(rad) * 9.5;
        const y2 = 11 + Math.sin(rad) * 9.5;
        return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round" />;
      })}
      <Circle cx="11" cy="11" r="5.5" fill={`${color}35`} stroke={color} strokeWidth="1.5" />
      {/* Eyes */}
      <Circle cx="9"  cy="10" r="0.7" fill={color} />
      <Circle cx="13" cy="10" r="0.7" fill={color} />
      {/* Smile */}
      <Path d="M8.5 12.5 Q11 15 13.5 12.5" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

// ── Supplement – potted sprout ────────────────────────────────
export function IconSupplement({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      {/* Pot body */}
      <Path d="M7 15 L7.8 19.5 L14.2 19.5 L15 15 Z" fill={`${color}35`} stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      {/* Pot rim */}
      <Rect x="5.5" y="13.5" width="11" height="2" rx="1" fill={color} opacity="0.45" />
      {/* Stem */}
      <Line x1="11" y1="13.5" x2="11" y2="8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Left leaf */}
      <Path d="M11 10.5 C9 9.5 5.5 10 5.5 10 C5.5 10 7.5 7 11 8 Z"
        fill={`${color}40`} stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      {/* Right leaf */}
      <Path d="M11 9.5 C13 8.5 16.5 9 16.5 9 C16.5 9 14.5 6 11 7 Z"
        fill={`${color}40`} stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Gastro – stomach shape ────────────────────────────────────
export function IconGastro({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      <Path
        d="M8 4.5 C6 4.5 4.5 6 4.5 7.5 C4.5 10 5.5 11 5.5 13 C5.5 16 7.5 18.5 11 18.5 C14.5 18.5 17.5 16 17.5 13 C17.5 11 16.5 9 16.5 7.5 C16.5 5.8 15 4 13.5 4 C12.5 4 12 5 11 5 C10 5 9.5 4 8.5 4 C8.3 4 8 4.2 8 4.5 Z"
        fill={`${color}28`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Highlight fold */}
      <Path d="M8.5 7 Q10 6 11.5 7" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <Path d="M7 11 Q8 9.5 9 11" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

// ── Recreational – mug with froth ─────────────────────────────
export function IconRecreational({ color, s }: IconProps) {
  return (
    <Svg width={s} height={s} viewBox="0 0 22 22">
      {/* Mug body */}
      <Path
        d="M4.5 9.5 L4.5 18 Q4.5 19 5.5 19 L14.5 19 Q15.5 19 15.5 18 L15.5 9.5 Z"
        fill={`${color}28`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Handle */}
      <Path
        d="M15.5 11.5 Q19.5 11.5 19.5 14.5 Q19.5 17.5 15.5 17.5"
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Froth */}
      <Ellipse cx="10" cy="9.5" rx="5.5" ry="1.8" fill={color} opacity="0.3" />
      <Ellipse cx="10" cy="9.5" rx="5.5" ry="1.8" fill="none" stroke={color} strokeWidth="1" />
      {/* Froth bubbles */}
      <Circle cx="8"  cy="9" r="1.1" fill={color} opacity="0.2" />
      <Circle cx="11" cy="9.5" r="0.9" fill={color} opacity="0.2" />
      <Circle cx="13.5" cy="9" r="0.7" fill={color} opacity="0.2" />
    </Svg>
  );
}

// ── Dispatch table ────────────────────────────────────────────
export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  analgesic:      IconAnalgesic,
  adhd:           IconADHD,
  sleep:          IconSleep,
  stimulant:      IconStimulant,
  antihistamine:  IconAntihistamine,
  cardiovascular: IconCardiovascular,
  antidepressant: IconAntidepressant,
  supplement:     IconSupplement,
  gastro:         IconGastro,
  recreational:   IconRecreational,
};
