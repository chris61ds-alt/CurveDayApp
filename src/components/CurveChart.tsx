import React, { useMemo, useRef, useState } from 'react';
import { View, useWindowDimensions, PanResponder } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ChartRow } from '../utils/pkHelpers';

const PAD = { left: 32, right: 12, top: 20, bottom: 26 };

interface ChartEntry { substanceId: string; color: string; }
interface PeakMark  { substanceId: string; peakIndex: number; color: string; label: string; }
export interface MealMark { timeH: number; size: 'klein' | 'mittel' | 'groß'; }

interface Props {
  data: ChartRow[];
  entries: ChartEntry[];
  selectedId: string;
  nowHour: number;
  peakMarks?: PeakMark[];
  mealMarks?: MealMark[];
  height?: number;
  // Theme
  gridColor?:   string;
  labelColor?:  string;
  accentColor?: string;
  isDark?:      boolean;
}

const MEAL_COLOR = '#f97316';
const MEAL_OPACITY: Record<string, number> = { klein: 0.3, mittel: 0.55, groß: 0.85 };

function smoothLinePath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x},${pts[i].y} ${mx},${my}`;
  }
  d += ` L${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
  return d;
}

function smoothAreaPath(pts: { x: number; y: number }[], baseline: number): string {
  if (pts.length === 0) return '';
  const line  = smoothLinePath(pts);
  const last  = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L${last.x},${baseline} L${first.x},${baseline} Z`;
}

function buildGhostPts(plotW: number, plotH: number, padLeft: number, padTop: number) {
  return Array.from({ length: 49 }, (_, i) => {
    const t = i / 48;
    const v = 38 * Math.sin(t * Math.PI * 1.8) * Math.max(0, 1 - t * 0.55)
            + 22 * Math.sin(t * Math.PI * 3.4 + 1) * Math.max(0, 1 - t * 0.5);
    return { x: padLeft + t * plotW, y: padTop + plotH - Math.max(0, v / 100) * plotH };
  });
}

function touchDist(touches: any[]): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function CurveChart({
  data, entries, selectedId, nowHour,
  peakMarks = [], mealMarks = [], height = 280,
  gridColor   = '#182840',
  labelColor  = '#3a5570',
  accentColor = '#38bdf8',
  isDark      = true,
}: Props) {
  const { width } = useWindowDimensions();
  const svgW  = width - 28;
  const plotW = svgW - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  // ── Zoom/Pan state ───────────────────────────────────────────
  const [zoomRange, setZoomRangeState] = useState<[number, number]>([0, 48]);
  const zoomRef  = useRef<[number, number]>([0, 48]);
  const plotWRef = useRef(plotW);
  plotWRef.current = plotW;

  function setZoomRange(r: [number, number]) {
    zoomRef.current = r;
    setZoomRangeState(r);
  }

  const pinchRef = useRef<{ dist: number; range: [number, number] } | null>(null);
  const panRef   = useRef<{ x: number; range: [number, number] } | null>(null);

  // ── PanResponder: 1 finger = pan, 2 fingers = pinch-zoom ────
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_, gs) => gs.numberActiveTouches >= 1,
    onMoveShouldSetPanResponder:  (_, gs) => gs.numberActiveTouches >= 1,

    onPanResponderGrant: (evt) => {
      const t = evt.nativeEvent.touches;
      if (t.length >= 2) {
        pinchRef.current = { dist: touchDist(Array.from(t)), range: [...zoomRef.current] as [number, number] };
        panRef.current   = null;
      } else {
        panRef.current   = { x: t[0].pageX, range: [...zoomRef.current] as [number, number] };
        pinchRef.current = null;
      }
    },

    onPanResponderMove: (evt) => {
      const t = evt.nativeEvent.touches;

      if (t.length >= 2) {
        // Switch to pinch if second finger just appeared
        if (!pinchRef.current) {
          pinchRef.current = { dist: touchDist(Array.from(t)), range: [...zoomRef.current] as [number, number] };
          panRef.current   = null;
        }
        // Pinch zoom
        const newDist   = touchDist(Array.from(t));
        const scale     = pinchRef.current.dist / Math.max(1, newDist);
        const [is, ie]  = pinchRef.current.range;
        const center    = (is + ie) / 2;
        const halfSpan  = Math.max(6, Math.min(24, ((ie - is) * scale) / 2));
        const newS = Math.max(0,  Math.round(center - halfSpan));
        const newE = Math.min(48, Math.round(center + halfSpan));
        setZoomRange([newS, newE]);

      } else if (t.length === 1 && panRef.current) {
        // Pan / swipe to scroll through time
        const [rs, re] = panRef.current.range;
        const span = re - rs;
        if (span >= 47) return; // No pan when fully zoomed out

        const dx       = t[0].pageX - panRef.current.x;
        const idxDelta = -(dx / plotWRef.current) * span;
        const rawS     = rs + idxDelta;
        const clampedS = Math.max(0, Math.min(48 - span, rawS));
        setZoomRange([Math.round(clampedS), Math.round(clampedS + span)]);
      }
    },

    onPanResponderRelease: () => {
      pinchRef.current = null;
      panRef.current   = null;
    },
  })).current;

  const [zS, zE] = zoomRange;
  const visibleSpan = zE - zS;

  const xOf = (i: number) => PAD.left + ((i - zS) / visibleSpan) * plotW;
  const yOf = (v: number) => PAD.top + plotH - Math.max(0, Math.min(1, v / 100)) * plotH;

  function visiblePts(id: string): { x: number; y: number }[] {
    return data
      .map((d, i) => ({ i, v: typeof d[id] === 'number' ? (d[id] as number) : 0 }))
      .filter(({ i }) => i >= zS && i <= zE)
      .map(({ i, v }) => ({ x: xOf(i), y: yOf(v) }));
  }

  const sorted = useMemo(
    () => [...entries].sort((a) => (a.substanceId === selectedId ? 1 : -1)),
    [entries, selectedId],
  );

  const rawTicks = visibleSpan <= 12
    ? [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48].filter(t => t >= zS && t <= zE)
    : [0, 12, 24, 36, 48].filter(t => t >= zS && t <= zE);

  const nowIdx  = Math.min(nowHour * 2, 48);
  const nowX    = nowIdx >= zS && nowIdx <= zE ? xOf(nowIdx) : null;
  const nowLabel = `${String(Math.floor(nowHour)).padStart(2, '0')}:${nowHour % 1 >= 0.5 ? '30' : '00'}`;
  const baseline = yOf(0);

  const yTicks = [25, 50, 75, 100];
  const totalStroke = isDark ? '#ffffff20' : '#00000015';
  const isZoomed = zS > 0 || zE < 48;

  return (
    <View {...panResponder.panHandlers}>
      <Svg width={svgW} height={height}>
        <Defs>
          {sorted.map(e => (
            <LinearGradient key={e.substanceId} id={`g${e.substanceId}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={e.color} stopOpacity={e.substanceId === selectedId ? 0.5 : 0.15} />
              <Stop offset="100%" stopColor={e.color} stopOpacity={0} />
            </LinearGradient>
          ))}
        </Defs>

        {/* Grid lines */}
        {yTicks.map(v => (
          <G key={v}>
            <Line x1={PAD.left} y1={yOf(v)} x2={svgW - PAD.right} y2={yOf(v)} stroke={gridColor} strokeWidth={1} />
            <SvgText x={PAD.left - 5} y={yOf(v) + 3.5} fontSize={9} fill={labelColor} textAnchor="end">{v}%</SvgText>
          </G>
        ))}

        {/* X-axis */}
        {rawTicks.map(idx => {
          const h = idx / 2;
          const label = `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;
          return (
            <SvgText key={idx} x={xOf(idx)} y={height - 6} fontSize={9} fill={labelColor} textAnchor="middle">
              {label}
            </SvgText>
          );
        })}

        {/* Ghost curve (empty state) */}
        {entries.length === 0 && (() => {
          const gPts = buildGhostPts(plotW, plotH, PAD.left, PAD.top);
          return (
            <>
              <Path d={smoothAreaPath(gPts, baseline)} fill={isDark ? '#38bdf806' : '#0ea5e908'} />
              <Path d={smoothLinePath(gPts)} fill="none" stroke={isDark ? '#38bdf818' : '#0ea5e825'} strokeWidth={1.5} strokeDasharray="6,4" />
              <SvgText x={PAD.left + plotW / 2} y={PAD.top + plotH / 2} fontSize={12} fill={labelColor} textAnchor="middle">
                Noch keine Einnahmen
              </SvgText>
            </>
          );
        })()}

        {/* Area fills */}
        {sorted.map(e => {
          const pts = visiblePts(e.substanceId);
          return <Path key={`a${e.substanceId}`} d={smoothAreaPath(pts, baseline)} fill={`url(#g${e.substanceId})`} />;
        })}

        {/* Total effect line (dashed) */}
        <Path d={smoothLinePath(visiblePts('total'))} fill="none" stroke={totalStroke} strokeWidth={1.5} strokeDasharray="5,3" />

        {/* Substance lines */}
        {sorted.map(e => {
          const pts   = visiblePts(e.substanceId);
          const isSel = e.substanceId === selectedId;
          return (
            <Path
              key={`l${e.substanceId}`}
              d={smoothLinePath(pts)}
              fill="none"
              stroke={e.color}
              strokeWidth={isSel ? 2.8 : 1.6}
              opacity={isSel ? 1 : 0.5}
            />
          );
        })}

        {/* Peak markers */}
        {peakMarks.map((pm) => {
          if (pm.peakIndex < zS || pm.peakIndex > zE) return null;
          const v = typeof data[pm.peakIndex]?.[pm.substanceId] === 'number'
            ? data[pm.peakIndex][pm.substanceId] as number : 0;
          if (v < 5) return null;
          const px    = xOf(pm.peakIndex);
          const py    = yOf(v);
          const isSel = pm.substanceId === selectedId;
          return (
            <G key={`peak-${pm.substanceId}`}>
              <Circle cx={px} cy={py} r={isSel ? 9 : 5} fill={pm.color} opacity={0.15} />
              <Circle cx={px} cy={py} r={isSel ? 4.5 : 3} fill={pm.color} opacity={isSel ? 1 : 0.7} />
              {isSel && (
                <SvgText x={px} y={py - 12} fontSize={10} fill={pm.color} textAnchor="middle" fontWeight="700">
                  {pm.label}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* Meal markers */}
        {mealMarks.map((m, idx) => {
          const mIdx = m.timeH * 2;
          if (mIdx < zS || mIdx > zE) return null;
          const mx  = xOf(mIdx);
          const op  = MEAL_OPACITY[m.size] ?? 0.5;
          const labelY = baseline - 4;
          return (
            <G key={`meal-${idx}`}>
              <Line
                x1={mx} y1={PAD.top + 4}
                x2={mx} y2={baseline}
                stroke={MEAL_COLOR} strokeWidth={1.5}
                opacity={op} strokeDasharray="3,3"
              />
              <SvgText
                x={mx} y={labelY - 6}
                fontSize={9} fill={MEAL_COLOR}
                textAnchor="middle" opacity={op}
              >
                🍽
              </SvgText>
            </G>
          );
        })}

        {/* NOW line */}
        {nowX !== null && (
          <>
            <Line x1={nowX} y1={PAD.top} x2={nowX} y2={height - PAD.bottom} stroke={accentColor} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.75} />
            <SvgText x={nowX} y={PAD.top - 6} fontSize={9} fill={accentColor} textAnchor="middle" fontWeight="700">JETZT</SvgText>
            <SvgText x={nowX + 4} y={PAD.top + 13} fontSize={8} fill={accentColor} opacity={0.7}>{nowLabel}</SvgText>
          </>
        )}

        {/* Zoom/pan indicator */}
        {isZoomed && (
          <>
            <SvgText x={PAD.left + plotW / 2} y={PAD.top - 6} fontSize={9} fill={accentColor} textAnchor="middle" opacity={0.7}>
              {`◀  ${String(Math.floor(zS/2)).padStart(2,'0')}:${zS%2?'30':'00'} – ${String(Math.floor(zE/2)).padStart(2,'0')}:${zE%2?'30':'00'}  ▶`}
            </SvgText>
          </>
        )}

      </Svg>
    </View>
  );
}
