import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { colors, fontSize } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name={icon as any} size={40} color={colors.textTertiary} />
      </View>
      <Text style={[styles.title, { color: colors.textSecondary, fontSize: fontSize + 2, fontFamily: 'Inter_600SemiBold' }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textTertiary, fontSize: fontSize - 2, fontFamily: 'Inter_400Regular' }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
