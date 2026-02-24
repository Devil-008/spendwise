import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Profile, Settings } from './types';

const KEYS = {
  EXPENSES: '@spendwise_expenses',
  PROFILE: '@spendwise_profile',
  SETTINGS: '@spendwise_settings',
  AUTH: '@spendwise_auth',
  BIOMETRIC_ENABLED: '@spendwise_biometric_enabled',
};

export async function loadBiometricEnabled(): Promise<boolean> {
  const data = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
  return data === 'true';
}

export async function saveBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, enabled.toString());
}

export async function loadExpenses(): Promise<Expense[]> {
  const data = await AsyncStorage.getItem(KEYS.EXPENSES);
  return data ? JSON.parse(data) : [];
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
}

export async function loadProfile(): Promise<Profile> {
  const data = await AsyncStorage.getItem(KEYS.PROFILE);
  return data ? JSON.parse(data) : { name: '', avatar: null };
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export async function loadSettings(): Promise<Settings> {
  const data = await AsyncStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : { darkMode: false, fontSize: 16 };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function loadAuth(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.AUTH);
}

export async function saveAuth(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH, name);
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.AUTH);
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.EXPENSES, KEYS.PROFILE, KEYS.SETTINGS, KEYS.AUTH, KEYS.BIOMETRIC_ENABLED]);
}
