import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { formatRupee } from '@/lib/types';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export default function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  const { colors, fontSize } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <LinearGradient
        colors={[colors.cardGradientStart, colors.cardGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={[styles.label, { fontSize: fontSize - 2 }]}>Total Balance</Text>
        <Text style={[styles.balance, { fontSize: Math.min(fontSize + 16, 36) }]}>{formatRupee(balance)}</Text>

        <View style={styles.row}>
          <View style={styles.statItem}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="arrow-down" size={14} color="#fff" />
              </View>
              <Text style={[styles.statLabel, { fontSize: fontSize - 3 }]}>Income</Text>
            </View>
            <Text style={[styles.statAmount, { fontSize: fontSize + 2 }]}>{formatRupee(income)}</Text>
          </View>

          <View style={[styles.divider]} />

          <View style={styles.statItem}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="arrow-up" size={14} color="#fff" />
              </View>
              <Text style={[styles.statLabel, { fontSize: fontSize - 3 }]}>Expense</Text>
            </View>
            <Text style={[styles.statAmount, { fontSize: fontSize + 2 }]}>{formatRupee(expense)}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  balance: {
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_500Medium',
  },
  statAmount: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
});
