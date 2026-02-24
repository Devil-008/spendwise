import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from "react-native-reanimated";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { loadBiometricEnabled } from "@/lib/storage";

SplashScreen.preventAutoHideAsync();

function SplashAnimation({ onFinish }: { onFinish: () => void }) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 400 }),
      withTiming(1, { duration: 200 }),
    );
    opacity.value = withTiming(1, { duration: 500 });

    const timer = setTimeout(onFinish, 1500);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[splashStyles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          style={splashStyles.logoBg}
        >
          <Ionicons name="wallet" size={56} color="#fff" />
        </LinearGradient>
      </Animated.View>
      <Animated.Text style={[splashStyles.appName, { color: colors.text, fontFamily: 'Inter_700Bold' }, animStyle]}>
        SpendWise
      </Animated.Text>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  logoBg: { width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 28 },
});

function AuthRouter() {
  const { isAuthenticated, isLoading: profileLoading } = useProfile();
  const { isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const segments = useSegments();
  const appStateRef = useRef(AppState.currentState);
  const hasCheckedBiometric = useRef(false);

  // Check biometric on initial authenticated load
  useEffect(() => {
    if (profileLoading || showSplash || hasCheckedBiometric.current) return;

    if (isAuthenticated) {
      hasCheckedBiometric.current = true;
      loadBiometricEnabled().then((enabled) => {
        if (enabled) {
          router.replace('/lock');
        } else {
          const inLoginGroup = segments[0] === 'login';
          if (inLoginGroup) {
            router.replace('/(tabs)');
          }
        }
      });
    } else {
      const inLoginGroup = segments[0] === 'login';
      if (!inLoginGroup) {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, profileLoading, showSplash, segments]);

  // Listen for app state changes to re-lock when returning from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isAuthenticated
      ) {
        loadBiometricEnabled().then((enabled) => {
          if (enabled) {
            router.replace('/lock');
          }
        });
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isAuthenticated]);

  if (showSplash) {
    return <SplashAnimation onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, headerBackTitle: "Back" }}>
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="lock" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <ThemeProvider>
              <ProfileProvider>
                <ExpenseProvider>
                  <AuthRouter />
                </ExpenseProvider>
              </ProfileProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
