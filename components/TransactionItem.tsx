import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Expense, getCategoryLabel, getCategoryIcon, CATEGORY_COLORS, formatRupee } from '@/lib/types';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideOutRight } from 'react-native-reanimated';

interface TransactionItemProps {
  item: Expense;
  onDelete: (id: string) => void;
}

export default function TransactionItem({ item, onDelete }: TransactionItemProps) {
  const { colors, fontSize } = useTheme();
  const catColor = CATEGORY_COLORS[item.category] || '#6B7280';
  const isIncome = item.type === 'income';

  const handleLongPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete(item.id);
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={SlideOutRight.duration(200)}>
      <Pressable
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: colors.surface,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: catColor + '18' }]}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={catColor} />
        </View>

        <View style={styles.details}>
          <Text style={[styles.title, { color: colors.text, fontSize, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.category, { color: colors.textSecondary, fontSize: fontSize - 3, fontFamily: 'Inter_400Regular' }]}>
            {getCategoryLabel(item.category)} {'\u00B7'} {format(new Date(item.date), 'MMM d')}
          </Text>
        </View>

        <Text
          style={[
            styles.amount,
            {
              color: isIncome ? colors.income : colors.expense,
              fontSize: fontSize + 1,
              fontFamily: 'Inter_700Bold',
            },
          ]}
        >
          {isIncome ? '+' : '-'}{formatRupee(item.amount)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    marginBottom: 2,
  },
  category: {},
  amount: {},
});
