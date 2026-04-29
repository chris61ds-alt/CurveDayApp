import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ChartRow } from '../utils/pkHelpers';

const PAD = { left: 28, right: 12, top: 16, bottom: 24 };

interface ChartEntry {
  substanceId: string;
  color: string;
}

interface PeakMark {
  substanceId: string;
  peakIndex: number;   // index in data array (0–48)
  color: string;
  label: string;       // e.g. "10:30"
}

interface Props {
  data: ChartRow[];
  entries: ChartEntry[];
  selectedId: string;
  nowHour: number;
  peakMarks?: PeakMark[];
  height?: number;
}

export function CurveChart({ data, entries, selectedId, nowHour, peakMarks = [], height = 210 }: Props) {
  const { width } = useWindowDimensions();
  const svgW  = width - 32;
  const plotW = svgW - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const xOf = (i: number) => PAD.left + (i / 48) * plotW;
  const yOf = (v: number) => PAD.top + plotH - Math.max(0, Math.min(1, v / 100)) * plotH;

  function areaPath(id: string): string {
    const baseline = yOf(0);
    const pts = data.map((d, i) => {
      const v = typeof d[id] === 'number' ? (d[id] as number) : 0;
      return `${xOf(i)},${yOf(v)}`;
    });
    return `M${xOf(0)},${baseline} L${pts.join(' L')} L${xOf(48)},${baseline} Z`;
  }

  function linePath(id: string): string {
    const pts = data.map((d, i) => {
      const v = typeof d[id] === 'number' ? (d[id] as number) : 0;
      return `${xOf(i)},${yOf(v)}`;
    });
    return `M${pts.join(' L')}`;
  }

  const sorted = useMemo(
    () => [...entries].sort((a) => (a.substanceId === selectedId ? 1 : -1)),
    [entries, selectedId],
  );

  const nowX    = xOf(Math.min(nowHour * 2, 48));
  const nowLabel = `${String(Math.floor(nowHour)).padStart(2, '0')}:${nowHour % 1 >= 0.5 ? '30' : '00'}`;

  // Nur alle 6h Ticks (0, 6, 12, 18, 24) damit es nicht zu voll ist
  const xTicks  = [0, 12, 24, 36, 48];
  const xLabels = ['0:00', '6:00', '12:00', '18:00', '24:00'];
  const yTicks  = [25, 50, 75, 100];

  return (
    <View>
      <Svg width={svgW} height={height}>
        <Defs>
          {sorted.map(e => (
            <LinearGradient key={e.substanceId} id={`g${e.substanceId}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={e.color} stopOpacity={e.substanceId === selectedId ? 0.5 : 0.15} />
              <Stop offset="100%" stopColor={e.color} stopOpacity={0} />
            </LinearGradient>
          ))}
          {/* NOW glow gradient */}
          <LinearGradient id="nowGlow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#38bdf8" stopOpacity={0.1} />
          </LinearGradient>
        </Defs>

        {/* Horizontale Grid-Linien */}
        {yTicks.map(v => (
          <G key={v}>
            <Line
              x1={PAD.left} y1={yOf(v)} x2={svgW - PAD.right} y2={yOf(v)}
              stroke="#182840" strokeWidth={1}
            />
            <SvgText x={PAD.left - 4} y={yOf(v) + 3.5} fontSize={9} fill="#3a5570" textAnchor="end">
              {v}%
            </SvgText>
          </G>
        ))}

        {/* X-Achsen-Labels */}
        {xTicks.map((idx, i) => (
          <SvgText key={idx} x={xOf(idx)} y={height - 5} fontSize={9} fill="#3a5570" textAnchor="middle">
            {xLabels[i]}
          </SvgText>
        ))}

        {/* Flächen */}
        {sorted.map(e => (
          <Path key={`a${e.substanceId}`} d={areaPath(e.substanceId)} fill={`url(#g${e.substanceId})`} />
        ))}

        {/* Gesamtwirkung (gestrichelt, dezent) */}
        <Path d={linePath('total')} fill="none" stroke="#ffffff25" strokeWidth={1.5} strokeDasharray="5,3" />

        {/* Substanz-Linien */}
        {sorted.map(e => (
          <Path
            key={`l${e.substanceId}`}
            d={linePath(e.substanceId)}
            fill="none"
            stroke={e.color}
            strokeWidth={e.substanceId === selectedId ? 2.5 : 1.5}
            opacity={e.substanceId === selectedId ? 1 : 0.5}
          />
        ))}

        {/* Peak-Marker */}
        {peakMarks.map((pm) => {
          const v = typeof data[pm.peakIndex]?.[pm.substanceId] === 'number'
            ? data[pm.peakIndex][pm.substanceId] as number : 0;
          if (v < 5) return null;
          const px = xOf(pm.peakIndex);
          const py = yOf(v);
          const isSel = pm.substanceId === selectedId;
          return (
            <G key={`peak-${pm.substanceId}`}>
              {/* Glow circle */}
              <Circle cx={px} cy={py} r={isSel ? 7 : 5} fill={pm.color} opacity={0.2} />
              {/* Dot */}
              <Circle cx={px} cy={py} r={isSel ? 4 : 3} fill={pm.color} opacity={isSel ? 1 : 0.7} />
              {/* Peak-Zeit Label */}
              {isSel && (
                <SvgText x={px} y={py - 10} fontSize={9} fill={pm.color} textAnchor="middle" fontWeight="700">
                  {pm.label}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* NOW-Linie — prominent */}
        <Line
          x1={nowX} y1={PAD.top}
          x2={nowX} y2={height - PAD.bottom}
          stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.7}
        />
        {/* NOW-Raute oben */}
        <SvgText x={nowX} y={PAD.top - 4} fontSize={9} fill="#38bdf8" textAnchor="middle" fontWeight="700">
          JETZT
        </SvgText>
        {/* NOW-Zeitstempel */}
        <SvgText x={nowX + 4} y={PAD.top + 12} fontSize={8} fill="#38bdf8" opacity={0.8}>
          {nowLabel}
        </SvgText>

      </Svg>
    </View>
  );
}
