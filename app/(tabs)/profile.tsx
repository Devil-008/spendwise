import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Switch, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useExpenses } from '@/contexts/ExpenseContext';
import { loadBiometricEnabled, saveBiometricEnabled } from '@/lib/storage';

export default function ProfileScreen() {
  const { colors, fontSize, isDark, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { profile, logout, resetAllData } = useProfile();
  const { clearAll } = useExpenses();
  const insets = useSafeAreaInsets();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadBiometricEnabled().then(setBiometricEnabled);
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Check hardware support
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Not Available', 'Your device does not support biometric authentication.');
        return;
      }

      // Check enrollment
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          'Not Set Up',
          'No fingerprint or face is registered on this device. Please set up biometrics in your device settings first.',
        );
        return;
      }

      // Authenticate to confirm
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm your identity',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (!result.success) return;

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await saveBiometricEnabled(true);
      setBiometricEnabled(true);
    } else {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
      await saveBiometricEnabled(false);
      setBiometricEnabled(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your transactions, profile data, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            clearAll();
            await resetAllData();
            setBiometricEnabled(false);
            router.replace('/login');
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'web' ? 84 + 34 : 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerArea, { paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16 }]}>
        <Text style={[styles.pageTitle, { color: colors.text, fontFamily: 'Inter_700Bold', fontSize: fontSize + 6 }]}>Profile</Text>
      </View>

      <View style={styles.avatarSection}>
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          style={styles.avatarLarge}
        >
          <Text style={[styles.avatarLargeText, { fontFamily: 'Inter_700Bold' }]}>
            {(profile.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
        <Text style={[styles.profileName, { color: colors.text, fontFamily: 'Inter_700Bold', fontSize: fontSize + 4 }]}>
          {profile.name || 'User'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary, fontFamily: 'Inter_600SemiBold', fontSize: fontSize - 3 }]}>
          APPEARANCE
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={isDark ? '#A78BFA' : '#6366F1'} />
            </View>
            <Text style={[styles.settingText, { color: colors.text, fontFamily: 'Inter_500Medium', fontSize }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={() => {
              if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
              }
              toggleTheme();
            }}
            trackColor={{ false: colors.border, true: colors.tint }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE' }]}>
              <Ionicons name="text" size={18} color="#3B82F6" />
            </View>
            <Text style={[styles.settingText, { color: colors.text, fontFamily: 'Inter_500Medium', fontSize }]}>
              Font Size
            </Text>
          </View>
          <View style={styles.fontControls}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                decreaseFontSize();
              }}
              style={[styles.fontButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>
            <Text style={[styles.fontSizeLabel, { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: fontSize - 2 }]}>
              {fontSize}
            </Text>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                increaseFontSize();
              }}
              style={[styles.fontButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Ionicons name="add" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* SECURITY SECTION */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary, fontFamily: 'Inter_600SemiBold', fontSize: fontSize - 3 }]}>
          SECURITY
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: isDark ? '#1E3A3A' : '#D1FAE5' }]}>
              <Ionicons name="finger-print" size={18} color={isDark ? '#34D399' : '#059669'} />
            </View>
            <Text style={[styles.settingText, { color: colors.text, fontFamily: 'Inter_500Medium', fontSize }]}>
              Fingerprint Lock
            </Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: colors.border, true: colors.tint }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary, fontFamily: 'Inter_600SemiBold', fontSize: fontSize - 3 }]}>
          DATA
        </Text>

        <Pressable onPress={handleResetData} style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}>
              <Ionicons name="trash" size={18} color={colors.expense} />
            </View>
            <Text style={[styles.settingText, { color: colors.expense, fontFamily: 'Inter_500Medium', fontSize }]}>
              Reset All Data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary, fontFamily: 'Inter_600SemiBold', fontSize: fontSize - 3 }]}>
          ACCOUNT
        </Text>

        <Pressable onPress={handleLogout} style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: isDark ? '#78350F' : '#FEF3C7' }]}>
              <Ionicons name="log-out" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.settingText, { color: colors.text, fontFamily: 'Inter_500Medium', fontSize }]}>
              Logout
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>
      </View>

      <Text style={[styles.version, { color: colors.textTertiary, fontFamily: 'Inter_400Regular', fontSize: fontSize - 3 }]}>
        SpendWise v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {},
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  pageTitle: {},
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontSize: 32,
    color: '#fff',
  },
  profileName: {},
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
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
  sectionLabel: {
    marginBottom: 12,
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {},
  divider: {
    height: 1,
    marginVertical: 8,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeLabel: {},
  version: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
});
