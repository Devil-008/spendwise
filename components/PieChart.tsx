import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface PieSlice {
  value: number;
  color: string;
  label: string;
}

interface PieChartProps {
  data: PieSlice[];
  size?: number;
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function SliceItem({ cx, cy, r, startAngle, endAngle, color }: { cx: number; cy: number; r: number; startAngle: number; endAngle: number; color: string }) {
  const clampedEnd = Math.min(endAngle, startAngle + 359.99);
  const d = describeArc(cx, cy, r, startAngle, clampedEnd);

  return <Path d={d} fill={color} />;
}

export default function PieChart({ data, size = 180 }: PieChartProps) {
  const { colors, fontSize } = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  let currentAngle = 0;
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 360;
    const start = currentAngle;
    currentAngle += sliceAngle;
    return { ...d, startAngle: start, endAngle: currentAngle };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {slices.map((s, i) => (
            <SliceItem
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              startAngle={s.startAngle}
              endAngle={s.endAngle}
              color={s.color}
            />
          ))}
        </G>
        <Path
          d={`M ${cx} ${cy} m -${r * 0.55} 0 a ${r * 0.55} ${r * 0.55} 0 1 0 ${r * 1.1} 0 a ${r * 0.55} ${r * 0.55} 0 1 0 -${r * 1.1} 0`}
          fill={colors.surface}
        />
      </Svg>

      <View style={styles.legend}>
        {slices.slice(0, 6).map((s, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary, fontSize: fontSize - 3, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
              {s.label}
            </Text>
            <Text style={[styles.legendValue, { color: colors.text, fontSize: fontSize - 3, fontFamily: 'Inter_600SemiBold' }]}>
              {((s.value / total) * 100).toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    width: '100%',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
  },
  legendValue: {},
});
