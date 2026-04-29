import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ChartRow } from '../utils/pkHelpers';

const PAD = { left: 32, right: 8, top: 8, bottom: 22 };

interface ChartEntry {
  substanceId: string;
  color: string;
}

interface Props {
  data: ChartRow[];
  entries: ChartEntry[];
  selectedId: string;
  nowHour: number;
  height?: number;
}

export function CurveChart({ data, entries, selectedId, nowHour, height = 200 }: Props) {
  const { width } = useWindowDimensions();
  const svgW = width - 32; // 16px Rand je Seite
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

  const nowX = xOf(Math.min(nowHour * 2, 48));
  const nowLabel = `${String(Math.floor(nowHour)).padStart(2, '0')}:${nowHour % 1 >= 0.5 ? '30' : Math.round((nowHour % 1) * 60).toString().padStart(2,'0')}`;

  const xTicks = [0, 8, 16, 24, 32, 40, 48];
  const xLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <View>
      <Svg width={svgW} height={height}>
        <Defs>
          {sorted.map(e => (
            <LinearGradient key={e.substanceId} id={`g${e.substanceId}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={e.color} stopOpacity={e.substanceId === selectedId ? 0.55 : 0.2} />
              <Stop offset="100%" stopColor={e.color} stopOpacity={0} />
            </LinearGradient>
          ))}
        </Defs>

        {/* Grid */}
        {yTicks.map(v => (
          <G key={v}>
            <Line
              x1={PAD.left} y1={yOf(v)} x2={svgW - PAD.right} y2={yOf(v)}
              stroke="#142030" strokeWidth={1}
            />
            <SvgText x={PAD.left - 4} y={yOf(v) + 3.5} fontSize={8} fill="#2d3f5a" textAnchor="end">
              {v}%
            </SvgText>
          </G>
        ))}

        {/* X-Achse */}
        {xTicks.map((idx, i) => (
          <SvgText key={idx} x={xOf(idx)} y={height - 4} fontSize={8} fill="#2d3f5a" textAnchor="middle">
            {xLabels[i]}
          </SvgText>
        ))}

        {/* Flächen */}
        {sorted.map(e => (
          <Path
            key={`a${e.substanceId}`}
            d={areaPath(e.substanceId)}
            fill={`url(#g${e.substanceId})`}
          />
        ))}

        {/* Linien */}
        {sorted.map(e => (
          <Path
            key={`l${e.substanceId}`}
            d={linePath(e.substanceId)}
            fill="none"
            stroke={e.color}
            strokeWidth={e.substanceId === selectedId ? 2.5 : 1.5}
            opacity={e.substanceId === selectedId ? 1 : 0.65}
          />
        ))}

        {/* Gesamtwirkung (weiß, gestrichelt) */}
        <Path d={linePath('total')} fill="none" stroke="#fff" strokeWidth={1.8} opacity={0.4} />

        {/* Aktuelle Zeit */}
        <Line
          x1={nowX} y1={PAD.top} x2={nowX} y2={height - PAD.bottom}
          stroke="#ffffff35" strokeWidth={1} strokeDasharray="4,3"
        />
        <SvgText x={nowX + 3} y={PAD.top + 9} fontSize={8} fill="#e2e8f0">
          {nowLabel}
        </SvgText>
      </Svg>
    </View>
  );
}
