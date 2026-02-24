import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useProfile } from '@/contexts/ProfileContext';
import BalanceCard from '@/components/BalanceCard';
import TransactionItem from '@/components/TransactionItem';
import EmptyState from '@/components/EmptyState';

export default function HomeScreen() {
  const { colors, fontSize } = useTheme();
  const { expenses, balance, totalIncome, totalExpense, deleteExpense, reload, isLoading } = useExpenses();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();

  const recentExpenses = expenses.slice(0, 20);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            deleteExpense(id);
          },
        },
      ],
    );
  }, [deleteExpense]);

  const renderHeader = () => (
    <View>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary, fontSize: fontSize - 2, fontFamily: 'Inter_400Regular' }]}>
            Welcome back,
          </Text>
          <Text style={[styles.name, { color: colors.text, fontSize: fontSize + 6, fontFamily: 'Inter_700Bold' }]}>
            {profile.name || 'User'}
          </Text>
        </View>
        <View style={[styles.avatarContainer, { backgroundColor: colors.tintLight }]}>
          <Text style={[styles.avatarText, { color: colors.tint, fontFamily: 'Inter_700Bold' }]}>
            {(profile.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <BalanceCard balance={balance} income={totalIncome} expense={totalExpense} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize + 1, fontFamily: 'Inter_600SemiBold' }]}>
          Recent Transactions
        </Text>
        {expenses.length > 0 && (
          <Text style={[styles.sectionCount, { color: colors.textTertiary, fontSize: fontSize - 3, fontFamily: 'Inter_500Medium' }]}>
            {expenses.length} total
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="receipt-outline"
      title="No transactions yet"
      subtitle="Tap the + tab below to add your first income or expense"
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={recentExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem item={item} onDelete={handleDelete} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === 'web' ? 84 + 34 : 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            tintColor={colors.tint}
          />
        }
        scrollEnabled={!!recentExpenses.length || true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {},
  name: {},
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 8,
  },
  sectionTitle: {},
  sectionCount: {},
  listContent: {
    flexGrow: 1,
  },
});
