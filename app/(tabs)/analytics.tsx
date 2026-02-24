import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useExpenses } from '@/contexts/ExpenseContext';
import { CATEGORY_COLORS, getCategoryLabel } from '@/lib/types';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';
import EmptyState from '@/components/EmptyState';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function AnalyticsScreen() {
  const { colors, fontSize } = useTheme();
  const { expenses } = useExpenses();
  const insets = useSafeAreaInsets();

  const expenseOnly = useMemo(() => expenses.filter(e => e.type === 'expense'), [expenses]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenseOnly.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([cat, val]) => ({
        label: getCategoryLabel(cat),
        value: val,
        color: CATEGORY_COLORS[cat] || '#6B7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenseOnly]);

  const monthlyData = useMemo(() => {
    const months: { label: string; value: number; color: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const total = expenseOnly
        .filter(e => isWithinInterval(new Date(e.date), { start, end }))
        .reduce((s, e) => s + e.amount, 0);
      months.push({
        label: format(date, 'MMM'),
        value: total,
        color: colors.tint,
      });
    }
    return months;
  }, [expenseOnly, colors.tint]);

  const trendData = useMemo(() => {
    const incomeByMonth: { label: string; value: number; color: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const incTotal = expenses
        .filter(e => e.type === 'income' && isWithinInterval(new Date(e.date), { start, end }))
        .reduce((s, e) => s + e.amount, 0);
      const expTotal = expenses
        .filter(e => e.type === 'expense' && isWithinInterval(new Date(e.date), { start, end }))
        .reduce((s, e) => s + e.amount, 0);
      incomeByMonth.push({
        label: format(date, 'MMM'),
        value: incTotal - expTotal,
        color: incTotal >= expTotal ? colors.income : colors.expense,
      });
    }
    return incomeByMonth;
  }, [expenses, colors.income, colors.expense]);

  if (expenses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerArea, { paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16 }]}>
          <Text style={[styles.pageTitle, { color: colors.text, fontFamily: 'Inter_700Bold', fontSize: fontSize + 6 }]}>Analytics</Text>
        </View>
        <EmptyState
          icon="analytics-outline"
          title="No data yet"
          subtitle="Add some transactions to see charts and insights"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'web' ? 84 + 34 : 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerArea, { paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16 }]}>
        <Text style={[styles.pageTitle, { color: colors.text, fontFamily: 'Inter_700Bold', fontSize: fontSize + 6 }]}>Analytics</Text>
      </View>

      {categoryData.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize + 1, fontFamily: 'Inter_600SemiBold' }]}>
            Spending by Category
          </Text>
          <PieChart data={categoryData} />
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize + 1, fontFamily: 'Inter_600SemiBold' }]}>
          Monthly Expenses
        </Text>
        <BarChart data={monthlyData} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize + 1, fontFamily: 'Inter_600SemiBold' }]}>
          Net Savings Trend
        </Text>
        <BarChart data={trendData} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 28,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  cardTitle: {
    marginBottom: 16,
  },
});
