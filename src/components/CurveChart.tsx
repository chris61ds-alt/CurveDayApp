import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, useWindowDimensions, PanResponder, Animated, Easing, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle, Rect, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';

// Animated SVG primitives (useNativeDriver: false — layout/SVG props)
const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);

// Sans-serif font stack for SVG labels (prevents browser/system serif fallback)
const SF = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
import { ChartRow } from '../utils/pkHelpers';

const PAD = { left: 8, right: 8, top: 22, bottom: 32 };

interface ChartEntry { substanceId: string; color: string; isChronic?: boolean; }
interface PeakMark  { substanceId: string; peakIndex: number; color: string; label: string; }
export interface SleepWindow { start: number; end: number; } // decimal hours, e.g. {start:23, end:7}

interface Props {
  data: ChartRow[];
  entries: ChartEntry[];
  selectedId: string;
  nowHour: number;
  peakMarks?: PeakMark[];
  sleepWindow?: SleepWindow;
  height?: number;
  // i18n labels (defaults to German)
  labelNow?:         string;
  labelTomorrow?:    string;
  labelSteadyState?: string;
  labelSleep?:       string;
  labelNoIntakes?:   string;
  // Theme
  gridColor?:   string;
  labelColor?:  string;
  accentColor?: string;
  isDark?:      boolean;
  // Interaction
  onSelectSubstance?: (substanceId: string) => void;
}

const SLEEP_COLOR = '#818cf8';

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
  peakMarks = [], sleepWindow,
  height = 280,
  labelNow         = 'JETZT',
  labelTomorrow    = 'morgen',
  labelSteadyState = 'Steady-State',
  labelSleep       = 'Schlaf',
  labelNoIntakes   = 'Noch keine Einnahmen',
  gridColor   = '#182840',
  labelColor  = '#3a5570',
  accentColor = '#38bdf8',
  isDark      = true,
  onSelectSubstance,
}: Props) {
  const { width } = useWindowDimensions();
  const svgW  = width;
  const plotW = svgW - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  // ── Dynamisches Zeitfenster ──────────────────────────────────
  // data.length-1 = maximaler Index (z.B. 48 für 24h, 96 für 48h)
  const MAX_IDX = data.length - 1;

  // ── Zoom/Pan state — default: 4h window centred on now ───────
  const getDefaultZoom = (): [number, number] => {
    const maxIdx = data.length > 0 ? data.length - 1 : 48;
    const nowIdx = Math.round(nowHour * 2);
    const s = Math.max(0, nowIdx - 4);           // −2 h
    const e = Math.min(maxIdx, nowIdx + 4);      // +2 h
    return [s, e];
  };
  const [zoomRange, setZoomRangeState] = useState<[number, number]>(getDefaultZoom);
  const zoomRef  = useRef<[number, number]>(getDefaultZoom());
  const plotWRef = useRef(plotW);

  // ── Radar-ping at NOW line ────────────────────────────────────
  const ping1 = useRef(new Animated.Value(0)).current;
  const ping2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: false }),
        ]),
      );
    const l1 = makeLoop(ping1, 0);
    const l2 = makeLoop(ping2, 1100);
    l1.start(); l2.start();
    return () => { l1.stop(); l2.stop(); };
  }, []);

  // ── Selected-peak pulse ───────────────────────────────────────
  const peakPulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(peakPulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.sin), useNativeDriver: false }),
        Animated.timing(peakPulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.sin), useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  plotWRef.current = plotW;

  // Wenn sich das Datenfenster ändert → 4h-Fenster um NOW beibehalten
  const prevMaxIdx = useRef(MAX_IDX);
  if (prevMaxIdx.current !== MAX_IDX) {
    prevMaxIdx.current = MAX_IDX;
    const nowIdx = Math.round(nowHour * 2);
    const s = Math.max(0, nowIdx - 4);
    const e = Math.min(MAX_IDX, nowIdx + 4);
    zoomRef.current = [s, e];
  }

  function setZoomRange(r: [number, number]) {
    zoomRef.current = r;
    setZoomRangeState(r);
  }

  const pinchRef = useRef<{ dist: number; range: [number, number] } | null>(null);
  const panRef   = useRef<{ x: number; range: [number, number] } | null>(null);

  // ── PanResponder: 1 finger = pan, 2 fingers = pinch-zoom ────
  const panResponder = useRef(PanResponder.create({
    // Taps sollen Buttons durchkommen → nur auf Move/Pinch aktivieren
    onStartShouldSetPanResponder: () => false,
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
        const newS = Math.max(0,         Math.round(center - halfSpan));
        const newE = Math.min(zoomRef.current[1] === 0 ? 48 : Math.max(...zoomRef.current), Math.round(center + halfSpan));
        setZoomRange([newS, newE]);

      } else if (t.length === 1 && panRef.current) {
        // Pan / swipe to scroll through time
        const [rs, re] = panRef.current.range;
        const span = re - rs;
        const curMax = prevMaxIdx.current;
        if (span >= curMax - 1) return; // No pan when fully zoomed out

        const dx       = t[0].pageX - panRef.current.x;
        const idxDelta = -(dx / plotWRef.current) * span;
        const rawS     = rs + idxDelta;
        const clampedS = Math.max(0, Math.min(curMax - span, rawS));
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

  // Deduplicate by substanceId — entries has one item per intake,
  // but chart renders one curve per substance (data already sums multiple intakes)
  const sorted = useMemo(
    () => [...entries]
      .filter((e, i, arr) => arr.findIndex(x => x.substanceId === e.substanceId) === i)
      .sort((a) => (a.substanceId === selectedId ? 1 : -1)),
    [entries, selectedId],
  );

  // X-Achsen-Ticks: Schritt so wählen, dass Labels (~38px) nicht überlappen
  const minLabelPx = 40; // Mindestbreite pro Label in Pixel
  const maxTicks   = Math.max(2, Math.floor(plotW / minLabelPx));
  const rawStep    = Math.ceil(visibleSpan / maxTicks);
  // Auf sinnvolle Schritte runden: 1 (30min), 2 (1h), 4 (2h), 8 (4h), 12 (6h)
  const tickStep   = rawStep <= 1 ? 1 : rawStep <= 2 ? 2 : rawStep <= 4 ? 4 : rawStep <= 8 ? 8 : 12;
  const allTickCandidates = Array.from(
    { length: Math.floor(MAX_IDX / tickStep) + 1 },
    (_, i) => i * tickStep,
  );
  const rawTicks = allTickCandidates.filter(t => t >= zS && t <= zE && t <= MAX_IDX);

  const nowIdx   = Math.min(nowHour * 2, MAX_IDX);
  const nowX     = nowIdx >= zS && nowIdx <= zE ? xOf(nowIdx) : null;
  const baseline = yOf(0);

  // "Morgen"-Trennlinie bei idx=48 (Mitternacht), sichtbar wenn Chart >24h
  const midnightIdx = 48;
  const midnightX   = MAX_IDX > 48 && midnightIdx >= zS && midnightIdx <= zE
    ? xOf(midnightIdx) : null;

  const yTicks = [25, 50, 75, 100];
  const totalStroke = isDark ? '#ffffff20' : '#00000015';
  const isZoomed = zS > 0 || zE < MAX_IDX;

  // Radar-ping derived values
  const ping1R  = ping1.interpolate({ inputRange: [0, 1], outputRange: [0, 28] });
  const ping1Op = ping1.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });
  const ping2R  = ping2.interpolate({ inputRange: [0, 1], outputRange: [0, 28] });
  const ping2Op = ping2.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });

  // Peak-pulse derived values
  const peakOuterR  = peakPulse.interpolate({ inputRange: [0, 1], outputRange: [9, 15] });
  const peakOuterOp = peakPulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.28] });

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

        {/* Grid lines + Y-labels overlay (inside chart) */}
        {yTicks.map(v => (
          <G key={v}>
            <Line x1={PAD.left} y1={yOf(v)} x2={svgW - PAD.right} y2={yOf(v)} stroke={gridColor} strokeWidth={1} />
            <SvgText x={PAD.left + 5} y={yOf(v) - 3} fontSize={10} fill={labelColor} textAnchor="start" opacity={0.65} fontFamily={SF}>{v}%</SvgText>
          </G>
        ))}

        {/* Sleep window shading */}
        {sleepWindow && (() => {
          // Sleep may cross midnight: end < start means "next day"
          const sH   = sleepWindow.start;
          const eH   = sleepWindow.end < sleepWindow.start
            ? sleepWindow.end + 24
            : sleepWindow.end;
          const sIdx = sH * 2;
          const eIdx = eH * 2;

          // Clamp to visible zoom range
          const visStart = Math.max(sIdx, zS);
          const visEnd   = Math.min(eIdx, zE);
          if (visEnd <= visStart) return null;

          const rx1 = xOf(visStart);
          const rx2 = xOf(visEnd);
          const bandW = Math.max(0, rx2 - rx1);

          // Show moon label only if sleep start is within zoom
          const showLabel = sIdx >= zS && sIdx <= zE;

          return (
            <G>
              {/* Shaded band */}
              <Rect
                x={rx1} y={PAD.top}
                width={bandW} height={plotH}
                fill={SLEEP_COLOR} fillOpacity={isDark ? 0.09 : 0.06}
              />
              {/* Left border (bedtime line) */}
              {sIdx >= zS && sIdx <= zE && (
                <Line
                  x1={xOf(sIdx)} y1={PAD.top}
                  x2={xOf(sIdx)} y2={PAD.top + plotH}
                  stroke={SLEEP_COLOR} strokeWidth={1}
                  strokeDasharray="3,3" opacity={0.45}
                />
              )}
              {/* Right border (wake-up line) */}
              {eIdx >= zS && eIdx <= zE && (
                <Line
                  x1={xOf(eIdx)} y1={PAD.top}
                  x2={xOf(eIdx)} y2={PAD.top + plotH}
                  stroke={SLEEP_COLOR} strokeWidth={1}
                  strokeDasharray="3,3" opacity={0.35}
                />
              )}
              {/* Label */}
              {showLabel && (
                <SvgText
                  x={xOf(sIdx) + 5} y={PAD.top + plotH - 6}
                  fontSize={10} fill={SLEEP_COLOR} opacity={0.6} fontFamily={SF}
                >
                  {labelSleep}
                </SvgText>
              )}
            </G>
          );
        })()}

        {/* Mitternacht-Trennlinie ("morgen") */}
        {midnightX !== null && (
          <G>
            <Line
              x1={midnightX} y1={PAD.top} x2={midnightX} y2={height - PAD.bottom}
              stroke={labelColor} strokeWidth={1} strokeDasharray="3,4" opacity={0.5}
            />
            <SvgText
              x={midnightX + 4} y={PAD.top + 10}
              fontSize={10} fill={labelColor} opacity={0.75} fontFamily={SF}
            >
              {labelTomorrow}
            </SvgText>
          </G>
        )}

        {/* X-axis labels */}
        {rawTicks.map(idx => {
          const hAbs   = idx / 2;           // Stunden seit heute 00:00 (kann >24 sein)
          const hWrap  = hAbs % 24;          // Tageszeit (0-24)
          const hH     = Math.floor(hWrap);
          const hM     = Math.round((hWrap % 1) * 60);
          const label  = `${String(hH).padStart(2, '0')}:${String(hM).padStart(2, '0')}`;
          return (
            <SvgText key={idx} x={xOf(idx)} y={height - 5} fontSize={11} fill={labelColor} textAnchor="middle" fontFamily={SF}>
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
              <SvgText x={PAD.left + plotW / 2} y={PAD.top + plotH / 2} fontSize={12} fill={labelColor} textAnchor="middle" fontFamily={SF}>
                {labelNoIntakes}
              </SvgText>
            </>
          );
        })()}

        {/* Area fills — nur für akute Kurven */}
        {sorted.filter(e => !e.isChronic).map(e => {
          const pts = visiblePts(e.substanceId);
          return <Path key={`a${e.substanceId}`} d={smoothAreaPath(pts, baseline)} fill={`url(#g${e.substanceId})`} />;
        })}

        {/* Total effect line (dashed) */}
        <Path d={smoothLinePath(visiblePts('total'))} fill="none" stroke={totalStroke} strokeWidth={1.5} strokeDasharray="5,3" />

        {/* Substance lines */}
        {sorted.map(e => {
          const pts   = visiblePts(e.substanceId);
          const isSel = e.substanceId === selectedId;

          if (e.isChronic) {
            // Chronische Substanzen: flache gestrichelte Linie + Label
            if (pts.length < 2) return null;
            const y = pts[0].y;
            const x1 = pts[0].x;
            const x2 = pts[pts.length - 1].x;
            return (
              <G key={`l${e.substanceId}`}>
                <Line
                  x1={x1} y1={y} x2={x2} y2={y}
                  stroke={e.color} strokeWidth={isSel ? 2 : 1.2}
                  strokeDasharray="8,5" opacity={isSel ? 0.9 : 0.45}
                />
                {isSel && (
                  <SvgText
                    x={x1 + 6} y={y - 5}
                    fontSize={10} fill={e.color} opacity={0.85} fontFamily={SF}
                  >
                    {labelSteadyState}
                  </SvgText>
                )}
              </G>
            );
          }

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

        {/* Peak markers — tappable to select substance */}
        {peakMarks.map((pm) => {
          if (pm.peakIndex < zS || pm.peakIndex > zE) return null;
          const v = typeof data[pm.peakIndex]?.[pm.substanceId] === 'number'
            ? data[pm.peakIndex][pm.substanceId] as number : 0;
          if (v < 5) return null;
          const px    = xOf(pm.peakIndex);
          const py    = yOf(v);
          const isSel = pm.substanceId === selectedId;
          return (
            <G
              key={`peak-${pm.substanceId}`}
              onPress={onSelectSubstance ? () => onSelectSubstance(pm.substanceId) : undefined}
            >
              {/* Large invisible tap target (24×24) */}
              <Circle cx={px} cy={py} r={20} fill="transparent" />
              {/* Pulsing outer glow for selected peak */}
              {isSel && (
                <AnimatedCircle cx={px} cy={py} r={peakOuterR} fill={pm.color} opacity={peakOuterOp} />
              )}
              {/* Selection ring hint on non-selected — visible when onSelectSubstance is set */}
              {!isSel && onSelectSubstance && (
                <Circle cx={px} cy={py} r={10} fill="transparent" stroke={pm.color} strokeWidth={1} opacity={0.3} />
              )}
              <Circle cx={px} cy={py} r={isSel ? 9 : 5} fill={pm.color} opacity={0.15} />
              <Circle cx={px} cy={py} r={isSel ? 4.5 : 3} fill={pm.color} opacity={isSel ? 1 : 0.7} />
              {isSel && (
                <SvgText x={px} y={py - 14} fontSize={11} fill={pm.color} textAnchor="middle" fontWeight="700" fontFamily={SF}>
                  {pm.label}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* NOW line + radar ping */}
        {nowX !== null && (
          <>
            {/* Radar rings */}
            <AnimatedCircle cx={nowX} cy={PAD.top + plotH / 2} r={ping1R} fill="none" stroke={accentColor} strokeWidth={1.2} opacity={ping1Op} />
            <AnimatedCircle cx={nowX} cy={PAD.top + plotH / 2} r={ping2R} fill="none" stroke={accentColor} strokeWidth={1.2} opacity={ping2Op} />
            {/* Dashed line */}
            <Line x1={nowX} y1={PAD.top} x2={nowX} y2={height - PAD.bottom} stroke={accentColor} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.75} />
            {/* Kein Text-Label — Uhrzeit steht bereits auf der X-Achse */}
          </>
        )}

        {/* Zoom-Bereich wird nicht mehr als Text angezeigt — X-Achse zeigt den Bereich */}

      </Svg>

      {/* ── Zoom buttons ── */}
      <View style={cs.zoomRow}>
        {/* + zoom in */}
        <TouchableOpacity
          style={[cs.zoomBtn, { borderColor: accentColor + '40', backgroundColor: accentColor + '15' }]}
          onPress={() => {
            const [s, e] = zoomRef.current;
            const span   = e - s;
            const center = Math.round((s + e) / 2);
            const half   = Math.max(3, Math.round(span / 4));
            const nS     = Math.max(0, center - half);
            const nE     = Math.min(MAX_IDX, center + half);
            if (nE - nS >= 4) setZoomRange([nS, nE]);
          }}
          activeOpacity={0.7}
        >
          <Text style={[cs.zoomIcon, { color: accentColor }]}>+</Text>
        </TouchableOpacity>
        {/* − zoom out */}
        <TouchableOpacity
          style={[cs.zoomBtn, { borderColor: accentColor + '40', backgroundColor: accentColor + '15' }]}
          onPress={() => {
            const [s, e] = zoomRef.current;
            const span   = e - s;
            const center = Math.round((s + e) / 2);
            const half   = Math.min(MAX_IDX, Math.round(span));
            const nS     = Math.max(0, center - half);
            const nE     = Math.min(MAX_IDX, center + half);
            if (nE - nS < MAX_IDX - 2) setZoomRange([nS, nE]);
            else setZoomRange([0, MAX_IDX]);
          }}
          activeOpacity={0.7}
        >
          <Text style={[cs.zoomIcon, { color: accentColor }]}>−</Text>
        </TouchableOpacity>
        {/* ⊙ reset to 4h around now */}
        <TouchableOpacity
          style={[cs.zoomBtn, { borderColor: accentColor + '40', backgroundColor: accentColor + '15' }]}
          onPress={() => {
            const nowIdx = Math.round(nowHour * 2);
            const s = Math.max(0, nowIdx - 4);
            const e = Math.min(MAX_IDX, nowIdx + 4);
            setZoomRange([s, e]);
          }}
          activeOpacity={0.7}
        >
          <Text style={[cs.zoomIcon, { color: accentColor, fontSize: 14 }]}>⊙</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const cs = StyleSheet.create({
  zoomRow: {
    position: 'absolute', bottom: 28, right: 10,
    flexDirection: 'row', gap: 6,
  },
  zoomBtn: {
    width: 30, height: 30, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  zoomIcon: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
});
