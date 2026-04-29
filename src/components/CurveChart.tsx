import React, { useMemo, useRef, useState } from 'react';
import { View, useWindowDimensions, PanResponder } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ChartRow } from '../utils/pkHelpers';

const PAD = { left: 32, right: 12, top: 20, bottom: 26 };

interface ChartEntry { substanceId: string; color: string; }
interface PeakMark  { substanceId: string; peakIndex: number; color: string; label: string; }

interface Props {
  data: ChartRow[];
  entries: ChartEntry[];
  selectedId: string;
  nowHour: number;
  peakMarks?: PeakMark[];
  height?: number;
}

// ── Glatte Kurve via quadratische Bezier (Midpoint-Methode) ───
function smoothLinePath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x},${pts[i].y} ${mx},${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last.x},${last.y}`;
  return d;
}

function smoothAreaPath(pts: { x: number; y: number }[], baseline: number): string {
  if (pts.length === 0) return '';
  const line = smoothLinePath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L${last.x},${baseline} L${first.x},${baseline} Z`;
}

// ── Ghost-Kurve für leeren Zustand ────────────────────────────
function buildGhostPts(plotW: number, plotH: number, padLeft: number, padTop: number) {
  return Array.from({ length: 49 }, (_, i) => {
    const t = i / 48;
    const v = 38 * Math.sin(t * Math.PI * 1.8) * Math.max(0, 1 - t * 0.55)
            + 22 * Math.sin(t * Math.PI * 3.4 + 1) * Math.max(0, 1 - t * 0.5);
    return { x: padLeft + (i / 48) * plotW, y: padTop + plotH - Math.max(0, v / 100) * plotH };
  });
}

// ── Pinch-Distanz zwischen zwei Touches ──────────────────────
function touchDist(touches: any[]): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

// ── Hauptkomponente ───────────────────────────────────────────
export function CurveChart({ data, entries, selectedId, nowHour, peakMarks = [], height = 280 }: Props) {
  const { width } = useWindowDimensions();
  const svgW  = width - 28;
  const plotW = svgW - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  // Zoom-State: Zeitfenster in Indizes (0–48 = 00:00–24:00)
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, 48]);
  const pinchRef = useRef<{ dist: number; range: [number, number] } | null>(null);

  const [zS, zE] = zoomRange;
  const visibleSpan = zE - zS;

  const xOf = (i: number) => PAD.left + ((i - zS) / visibleSpan) * plotW;
  const yOf = (v: number) => PAD.top + plotH - Math.max(0, Math.min(1, v / 100)) * plotH;

  // Nur sichtbare Datenpunkte rendern
  function visiblePts(id: string): { x: number; y: number }[] {
    return data
      .map((d, i) => ({ i, v: typeof d[id] === 'number' ? (d[id] as number) : 0 }))
      .filter(({ i }) => i >= zS && i <= zE)
      .map(({ i, v }) => ({ x: xOf(i), y: yOf(v) }));
  }

  // ── Pinch-to-Zoom via PanResponder ──────────────────────────
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_, gs) => gs.numberActiveTouches === 2,
    onMoveShouldSetPanResponder:  (_, gs) => gs.numberActiveTouches === 2,
    onPanResponderGrant: (evt) => {
      const t = evt.nativeEvent.touches;
      if (t.length === 2) {
        pinchRef.current = { dist: touchDist(Array.from(t)), range: [...zoomRange] as [number, number] };
      }
    },
    onPanResponderMove: (evt) => {
      const t = evt.nativeEvent.touches;
      if (t.length !== 2 || !pinchRef.current) return;
      const newDist  = touchDist(Array.from(t));
      const scale    = pinchRef.current.dist / Math.max(1, newDist);
      const [is, ie] = pinchRef.current.range;
      const center   = (is + ie) / 2;
      const halfSpan = Math.max(6, Math.min(24, ((ie - is) * scale) / 2));
      const newS = Math.max(0,  Math.round(center - halfSpan));
      const newE = Math.min(48, Math.round(center + halfSpan));
      setZoomRange([newS, newE]);
    },
    onPanResponderRelease: () => { pinchRef.current = null; },
  })).current;

  const sorted = useMemo(
    () => [...entries].sort((a) => (a.substanceId === selectedId ? 1 : -1)),
    [entries, selectedId],
  );

  // X-Achse: Ticks basierend auf Zoom-Level
  const rawTicks = visibleSpan <= 12
    ? [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48].filter(t => t >= zS && t <= zE)
    : [0, 12, 24, 36, 48].filter(t => t >= zS && t <= zE);
  const xTicks = rawTicks;

  const nowIdx  = Math.min(nowHour * 2, 48);
  const nowX    = nowIdx >= zS && nowIdx <= zE ? xOf(nowIdx) : null;
  const nowLabel = `${String(Math.floor(nowHour)).padStart(2, '0')}:${nowHour % 1 >= 0.5 ? '30' : '00'}`;
  const baseline = yOf(0);

  const yTicks = [25, 50, 75, 100];

  return (
    <View {...panResponder.panHandlers}>
      <Svg width={svgW} height={height}>
        <Defs>
          {sorted.map(e => (
            <LinearGradient key={e.substanceId} id={`g${e.substanceId}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={e.color} stopOpacity={e.substanceId === selectedId ? 0.55 : 0.18} />
              <Stop offset="100%" stopColor={e.color} stopOpacity={0} />
            </LinearGradient>
          ))}
        </Defs>

        {/* Horizontale Grid-Linien */}
        {yTicks.map(v => (
          <G key={v}>
            <Line x1={PAD.left} y1={yOf(v)} x2={svgW - PAD.right} y2={yOf(v)} stroke="#182840" strokeWidth={1} />
            <SvgText x={PAD.left - 5} y={yOf(v) + 3.5} fontSize={9} fill="#3a5570" textAnchor="end">{v}%</SvgText>
          </G>
        ))}

        {/* X-Achse */}
        {xTicks.map(idx => {
          const h = idx / 2;
          const label = `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;
          return (
            <SvgText key={idx} x={xOf(idx)} y={height - 6} fontSize={9} fill="#3a5570" textAnchor="middle">{label}</SvgText>
          );
        })}

        {/* Ghost-Kurve wenn keine Daten */}
        {entries.length === 0 && (() => {
          const gPts = buildGhostPts(plotW, plotH, PAD.left, PAD.top);
          return (
            <>
              <Path d={smoothAreaPath(gPts, baseline)} fill="#38bdf806" />
              <Path d={smoothLinePath(gPts)} fill="none" stroke="#38bdf818" strokeWidth={1.5} strokeDasharray="6,4" />
              <SvgText x={PAD.left + plotW / 2} y={PAD.top + plotH / 2} fontSize={12} fill="#3a5570" textAnchor="middle">
                Noch keine Einnahmen
              </SvgText>
            </>
          );
        })()}

        {/* Flächen (glatt) */}
        {sorted.map(e => {
          const pts = visiblePts(e.substanceId);
          return <Path key={`a${e.substanceId}`} d={smoothAreaPath(pts, baseline)} fill={`url(#g${e.substanceId})`} />;
        })}

        {/* Gesamtwirkung (gestrichelt) */}
        <Path d={smoothLinePath(visiblePts('total'))} fill="none" stroke="#ffffff20" strokeWidth={1.5} strokeDasharray="5,3" />

        {/* Substanz-Linien (glatt) */}
        {sorted.map(e => {
          const pts = visiblePts(e.substanceId);
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

        {/* Peak-Marker */}
        {peakMarks.map((pm) => {
          if (pm.peakIndex < zS || pm.peakIndex > zE) return null;
          const v = typeof data[pm.peakIndex]?.[pm.substanceId] === 'number'
            ? data[pm.peakIndex][pm.substanceId] as number : 0;
          if (v < 5) return null;
          const px = xOf(pm.peakIndex);
          const py = yOf(v);
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

        {/* NOW-Linie */}
        {nowX !== null && (
          <>
            <Line x1={nowX} y1={PAD.top} x2={nowX} y2={height - PAD.bottom} stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.75} />
            <SvgText x={nowX} y={PAD.top - 6} fontSize={9} fill="#38bdf8" textAnchor="middle" fontWeight="700">JETZT</SvgText>
            <SvgText x={nowX + 4} y={PAD.top + 13} fontSize={8} fill="#38bdf8" opacity={0.7}>{nowLabel}</SvgText>
          </>
        )}

        {/* Zoom-Indikator (wenn nicht voller Bereich) */}
        {(zS > 0 || zE < 48) && (
          <SvgText x={svgW - PAD.right} y={PAD.top - 6} fontSize={9} fill="#38bdf860" textAnchor="end">
            {`${String(Math.floor(zS/2)).padStart(2,'0')}:${zS%2?'30':'00'}–${String(Math.floor(zE/2)).padStart(2,'0')}:${zE%2?'30':'00'}`}
          </SvgText>
        )}

      </Svg>
    </View>
  );
}
