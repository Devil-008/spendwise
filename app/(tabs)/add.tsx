import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Platform, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolateColor, useAnimatedProps } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useExpenses } from '@/contexts/ExpenseContext';
import { CATEGORIES, ExpenseType } from '@/lib/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';

function MiniCalendar({ selected, onSelect, colors, fontSize }: { selected: Date; onSelect: (d: Date) => void; colors: any; fontSize: number }) {
  const [viewMonth, setViewMonth] = useState(new Date(selected));
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const blanks = Array(startDay).fill(null);
  const allCells = [...blanks, ...days];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <View style={calStyles.container}>
      <View style={calStyles.header}>
        <Pressable onPress={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[calStyles.monthLabel, { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize }]}>
          {format(viewMonth, 'MMMM yyyy')}
        </Text>
        <Pressable onPress={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
      </View>
      <View style={calStyles.weekRow}>
        {weekDays.map(wd => (
          <Text key={wd} style={[calStyles.weekDay, { color: colors.textTertiary, fontFamily: 'Inter_500Medium', fontSize: fontSize - 4 }]}>
            {wd}
          </Text>
        ))}
      </View>
      <View style={calStyles.grid}>
        {allCells.map((day, i) => {
          if (!day) return <View key={`b-${i}`} style={calStyles.cell} />;
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());
          const isFuture = day > new Date();
          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => !isFuture && onSelect(day)}
              style={[
                calStyles.cell,
                isSelected && { backgroundColor: colors.tint, borderRadius: 10 },
              ]}
              disabled={isFuture}
            >
              <Text style={[
                calStyles.dayText,
                { color: isFuture ? colors.textTertiary : isSelected ? '#fff' : isToday ? colors.tint : colors.text, fontFamily: 'Inter_500Medium', fontSize: fontSize - 2 },
              ]}>
                {format(day, 'd')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const calStyles = StyleSheet.create({
  container: { paddingVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 12 },
  monthLabel: {},
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { width: `${100 / 7}%` as any, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayText: {},
});

export default function AddExpenseScreen() {
  const { colors, fontSize } = useTheme();
  const { addExpense } = useExpenses();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<ExpenseType>('expense');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const toggleProgress = useSharedValue(0);
  const toggleContainerWidth = screenWidth - 40 - 8;
  const halfWidth = toggleContainerWidth / 2;

  useEffect(() => {
    toggleProgress.value = withSpring(type === 'expense' ? 0 : 1, { damping: 18, stiffness: 150 });
  }, [type]);

  const toggleIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: toggleProgress.value * halfWidth }],
    width: halfWidth,
  }));

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this transaction.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!category) {
      Alert.alert('Select Category', 'Please select a category.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    addExpense({
      title: title.trim(),
      amount: parsedAmount,
      category,
      type,
      date: date.toISOString(),
    });

    setTitle('');
    setAmount('');
    setCategory('');
    setType('expense');
    setDate(new Date());

    Alert.alert('Added', `${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
  };

  const selectedCategory = CATEGORIES.find(c => c.value === category);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'web' ? 84 + 34 : 100 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.headerArea, { paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16 }]}>
        <Text style={[styles.pageTitle, { color: colors.text, fontFamily: 'Inter_700Bold', fontSize: fontSize + 6 }]}>
          Add Transaction
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Animated.View style={[styles.toggleIndicator, toggleIndicatorStyle]}>
            <LinearGradient
              colors={type === 'expense' ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.toggleGradient}
            />
          </Animated.View>
          <Pressable
            style={styles.toggleButton}
            onPress={() => {
              setType('expense');
              if (Platform.OS !== 'web') Haptics.selectionAsync();
            }}
          >
            <Ionicons
              name="trending-down-outline"
              size={18}
              color={type === 'expense' ? '#fff' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.toggleText, {
              color: type === 'expense' ? '#fff' : colors.textSecondary,
              fontFamily: 'Inter_600SemiBold',
              fontSize: fontSize - 1,
            }]}>Expense</Text>
          </Pressable>
          <Pressable
            style={styles.toggleButton}
            onPress={() => {
              setType('income');
              if (Platform.OS !== 'web') Haptics.selectionAsync();
            }}
          >
            <Ionicons
              name="trending-up-outline"
              size={18}
              color={type === 'income' ? '#fff' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.toggleText, {
              color: type === 'income' ? '#fff' : colors.textSecondary,
              fontFamily: 'Inter_600SemiBold',
              fontSize: fontSize - 1,
            }]}>Income</Text>
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium', fontSize: fontSize - 2 }]}>Title</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="create-outline" size={20} color={colors.textTertiary} />
            <TextInput
              style={[styles.textInput, { color: colors.text, fontFamily: 'Inter_400Regular', fontSize }]}
              placeholder="e.g. Groceries, Salary..."
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium', fontSize: fontSize - 2 }]}>Amount</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.currencySign, { color: colors.tint, fontFamily: 'Inter_700Bold', fontSize: fontSize + 4 }]}>{'\u20B9'}</Text>
            <TextInput
              style={[styles.textInput, styles.amountInput, { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: fontSize + 4 }]}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium', fontSize: fontSize - 2 }]}>Category</Text>
          <Pressable
            onPress={() => setShowCategories(!showCategories)}
            style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {selectedCategory ? (
              <>
                <Ionicons name={selectedCategory.icon as any} size={20} color={colors.tint} />
                <Text style={[styles.selectedText, { color: colors.text, fontFamily: 'Inter_400Regular', fontSize }]}>
                  {selectedCategory.label}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="grid-outline" size={20} color={colors.textTertiary} />
                <Text style={[styles.selectedText, { color: colors.textTertiary, fontFamily: 'Inter_400Regular', fontSize }]}>
                  Select category
                </Text>
              </>
            )}
            <Ionicons name={showCategories ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textTertiary} />
          </Pressable>

          {showCategories && (
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat.value}
                  onPress={() => {
                    setCategory(cat.value);
                    setShowCategories(false);
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                  }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat.value ? colors.tintLight : colors.surface,
                      borderColor: category === cat.value ? colors.tint : colors.border,
                    },
                  ]}
                >
                  <Ionicons name={cat.icon as any} size={18} color={category === cat.value ? colors.tint : colors.textSecondary} />
                  <Text style={[styles.categoryChipText, {
                    color: category === cat.value ? colors.tint : colors.textSecondary,
                    fontFamily: 'Inter_500Medium',
                    fontSize: fontSize - 3,
                  }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium', fontSize: fontSize - 2 }]}>Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(!showDatePicker)}
            style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textTertiary} />
            <Text style={[styles.selectedText, { color: colors.text, fontFamily: 'Inter_400Regular', fontSize }]}>
              {format(date, 'MMMM d, yyyy')}
            </Text>
            <Ionicons name={showDatePicker ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textTertiary} />
          </Pressable>
          {showDatePicker && (
            <View style={[styles.calendarContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MiniCalendar
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setShowDatePicker(false);
                }}
                colors={colors}
                fontSize={fontSize}
              />
            </View>
          )}
        </View>

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={[colors.cardGradientStart, colors.cardGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={[styles.submitText, { fontFamily: 'Inter_600SemiBold', fontSize: fontSize + 1 }]}>
              Add {type === 'income' ? 'Income' : 'Expense'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {},
  headerArea: { paddingHorizontal: 20, paddingBottom: 12 },
  pageTitle: {},
  formContainer: { paddingHorizontal: 20, gap: 20 },
  toggleContainer: { flexDirection: 'row', borderRadius: 16, padding: 4, position: 'relative', overflow: 'hidden' },
  toggleIndicator: { position: 'absolute', top: 4, left: 4, height: 48, borderRadius: 13, overflow: 'hidden' },
  toggleGradient: { flex: 1, borderRadius: 13 },
  toggleButton: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  toggleText: {},
  fieldGroup: { gap: 8 },
  fieldLabel: { marginLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, height: 54, gap: 10 },
  textInput: { flex: 1, height: '100%' },
  amountInput: {},
  currencySign: {},
  selectedText: { flex: 1 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  categoryChipText: {},
  calendarContainer: { borderRadius: 14, borderWidth: 1, padding: 12, marginTop: 4 },
  submitButton: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: 8 },
  submitText: { color: '#fff' },
});
