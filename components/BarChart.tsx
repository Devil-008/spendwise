import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { formatRupeeShort } from '@/lib/types';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
}

function AnimatedBar({ item, maxVal, height, index }: { item: BarData; maxVal: number; height: number; index: number }) {
  const { colors, fontSize } = useTheme();
  const barHeight = useSharedValue(0);

  useEffect(() => {
    const targetH = maxVal > 0 ? (item.value / maxVal) * (height - 30) : 0;
    barHeight.value = withDelay(index * 80, withTiming(targetH, { duration: 500 }));
  }, [item.value, maxVal]);

  const barStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return (
    <View style={styles.barColumn}>
      <Text style={[styles.barValue, { color: colors.textSecondary, fontSize: fontSize - 5, fontFamily: 'Inter_500Medium' }]}>
        {item.value > 0 ? formatRupeeShort(item.value) : ''}
      </Text>
      <Animated.View style={[styles.bar, { backgroundColor: item.color, borderRadius: 6 }, barStyle]} />
      <Text style={[styles.barLabel, { color: colors.textTertiary, fontSize: fontSize - 5, fontFamily: 'Inter_500Medium' }]}>
        {item.label}
      </Text>
    </View>
  );
}

export default function BarChart({ data, height = 180 }: BarChartProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={[styles.container, { height }]}>
      {data.map((item, i) => (
        <AnimatedBar key={item.label} item={item} maxVal={maxVal} height={height} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    marginBottom: 4,
    textAlign: 'center',
  },
  bar: {
    width: '60%',
    minHeight: 2,
  },
  barLabel: {
    marginTop: 6,
    textAlign: 'center',
  },
});
