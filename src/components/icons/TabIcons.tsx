import React from 'react';
import Svg, { Path, Rect, Circle, Line, Ellipse } from 'react-native-svg';

// ── Tageskurve – smooth area chart ───────────────────────────
export function IconChart({ focused, size = 28 }: { focused: boolean; size?: number }) {
  const accent = focused ? '#38bdf8' : '#3a5570';
  const fill   = focused ? '#38bdf825' : '#1a2840';
  const bg     = focused ? '#0d2040' : '#0a1828';

  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {/* Background card */}
      <Rect x="2" y="4" width="24" height="20" rx="4" fill={bg} />
      {/* Axes */}
      <Line x1="5" y1="20" x2="23" y2="20" stroke={focused ? '#1e3a5a' : '#162030'} strokeWidth="1" />
      <Line x1="5" y1="8"  x2="5"  y2="20" stroke={focused ? '#1e3a5a' : '#162030'} strokeWidth="1" />
      {/* Area under curve */}
      <Path
        d="M5 19 C7 19 8 13 10.5 12.5 C12.5 12 13.5 15.5 15.5 13.5 C17.5 11.5 19.5 9 23 9.5 L23 20 Z"
        fill={fill}
      />
      {/* Curve line */}
      <Path
        d="M5 19 C7 19 8 13 10.5 12.5 C12.5 12 13.5 15.5 15.5 13.5 C17.5 11.5 19.5 9 23 9.5"
        stroke={accent}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Peak dot */}
      <Circle cx="19.5" cy="9" r={focused ? 2.2 : 1.6} fill={accent} />
      <Circle cx="19.5" cy="9" r="1" fill={focused ? '#fff' : bg} />
    </Svg>
  );
}

// ── Einnahmen – horizontal pill capsule ──────────────────────
export function IconPill({ focused, size = 28 }: { focused: boolean; size?: number }) {
  const purple  = focused ? '#c084fc' : '#4a5070';
  const light   = focused ? '#ede9fe' : '#2a3050';
  const stroke  = focused ? '#a855f7' : '#3a4060';

  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {/* Left half */}
      <Path d="M14 9 L11 9 Q6 9 6 14 Q6 19 11 19 L14 19 Z" fill={purple} />
      {/* Right half */}
      <Path d="M14 9 L17 9 Q22 9 22 14 Q22 19 17 19 L14 19 Z" fill={light} />
      {/* Outline */}
      <Path
        d="M11 9 Q6 9 6 14 Q6 19 11 19 L17 19 Q22 19 22 14 Q22 9 17 9 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Divider */}
      <Line x1="14" y1="9.5" x2="14" y2="18.5" stroke={stroke} strokeWidth="1" opacity="0.5" />
      {/* Dots on right half (decoration) */}
      {focused && (
        <>
          <Circle cx="17.5" cy="12.5" r="1" fill={stroke} opacity="0.35" />
          <Circle cx="18.5" cy="15.5" r="0.7" fill={stroke} opacity="0.25" />
        </>
      )}
    </Svg>
  );
}

// ── Substanzen – lab flask ────────────────────────────────────
export function IconFlask({ focused, size = 28 }: { focused: boolean; size?: number }) {
  const blue  = focused ? '#60a5fa' : '#3a5070';
  const body  = focused ? '#dbeafe' : '#1a2840';
  const water = focused ? '#93c5fd' : '#2a4060';

  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {/* Neck cap */}
      <Rect x="9.5" y="4" width="9" height="2.5" rx="1.25" fill={blue} />
      {/* Flask body fill */}
      <Path
        d="M12 6.5 L12 13.5 L6 21.5 Q5 23.5 8 23.5 L20 23.5 Q23 23.5 22 21.5 L16 13.5 L16 6.5 Z"
        fill={body}
      />
      {/* Liquid fill */}
      <Path
        d="M8.5 18.5 L19.5 18.5 L21.5 23 Q22 24 20 23.5 L8 23.5 Q6 24 6.5 23 Z"
        fill={water}
      />
      {/* Outline */}
      <Path
        d="M12 6.5 L12 13.5 L6 21.5 Q5 23.5 8 23.5 L20 23.5 Q23 23.5 22 21.5 L16 13.5 L16 6.5"
        fill="none"
        stroke={blue}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bubbles */}
      {focused && (
        <>
          <Circle cx="11" cy="20.5" r="1.2" fill="#bfdbfe" />
          <Circle cx="14.5" cy="19.5" r="0.9" fill="#bfdbfe" />
          <Circle cx="17.5" cy="21" r="0.7" fill="#bfdbfe" />
        </>
      )}
    </Svg>
  );
}

// ── Einstellungen – three sliders ────────────────────────────
export function IconSliders({ focused, size = 28 }: { focused: boolean; size?: number }) {
  const track = focused ? '#1e3a5a' : '#162030';
  const knob  = focused ? '#38bdf8' : '#3a5070';
  const fill  = focused ? '#ffffff' : '#1a2840';

  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {/* Row 1 */}
      <Line x1="4" y1="9"  x2="24" y2="9"  stroke={track} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="10" cy="9"  r="3.5" fill={fill} stroke={knob} strokeWidth="1.6" />

      {/* Row 2 */}
      <Line x1="4" y1="16" x2="24" y2="16" stroke={track} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="18" cy="16" r="3.5" fill={fill} stroke={knob} strokeWidth="1.6" />

      {/* Row 3 */}
      <Line x1="4" y1="23" x2="24" y2="23" stroke={track} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="13" cy="23" r="3.5" fill={fill} stroke={knob} strokeWidth="1.6" />
    </Svg>
  );
}
