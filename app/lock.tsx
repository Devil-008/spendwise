import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
} from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

export default function LockScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const logoScale = useSharedValue(0.6);
    const logoOpacity = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(30);
    const buttonScale = useSharedValue(1);

    useEffect(() => {
        logoScale.value = withSpring(1, { damping: 12 });
        logoOpacity.value = withTiming(1, { duration: 500 });
        contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
        contentTranslateY.value = withDelay(200, withTiming(0, { duration: 400 }));

        // Auto-trigger biometric on mount
        const timer = setTimeout(() => authenticate(), 600);
        return () => clearTimeout(timer);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }));

    const buttonAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const authenticate = useCallback(async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                // No biometric hardware — just unlock
                router.replace('/(tabs)');
                return;
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                // No biometrics enrolled — just unlock
                router.replace('/(tabs)');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock SpendWise',
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                router.replace('/(tabs)');
            } else {
                // Animate the button to draw attention for retry
                buttonScale.value = withSequence(
                    withTiming(0.9, { duration: 100 }),
                    withSpring(1, { damping: 8 }),
                );
            }
        } catch {
            // If biometric fails, still allow retry
        }
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
                {/* Logo */}
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <LinearGradient
                        colors={[colors.cardGradientStart, colors.cardGradientEnd]}
                        style={styles.logoBg}
                    >
                        <Ionicons name="wallet" size={48} color="#fff" />
                    </LinearGradient>
                    <Text
                        style={[
                            styles.appName,
                            { color: colors.text, fontFamily: 'Inter_700Bold' },
                        ]}
                    >
                        SpendWise
                    </Text>
                </Animated.View>

                {/* Lock info */}
                <Animated.View style={[styles.lockSection, contentStyle]}>
                    <View
                        style={[
                            styles.lockIconBg,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <Ionicons name="lock-closed" size={32} color={colors.tint} />
                    </View>
                    <Text
                        style={[
                            styles.lockTitle,
                            { color: colors.text, fontFamily: 'Inter_600SemiBold' },
                        ]}
                    >
                        App Locked
                    </Text>
                    <Text
                        style={[
                            styles.lockSubtitle,
                            { color: colors.textSecondary, fontFamily: 'Inter_400Regular' },
                        ]}
                    >
                        Use your fingerprint or face to unlock
                    </Text>
                </Animated.View>

                {/* Unlock button */}
                <Animated.View style={[styles.buttonContainer, contentStyle, buttonAnimStyle]}>
                    <Pressable
                        onPress={authenticate}
                        style={({ pressed }) => [
                            styles.unlockButton,
                            {
                                opacity: pressed ? 0.9 : 1,
                                transform: [{ scale: pressed ? 0.97 : 1 }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={[colors.cardGradientStart, colors.cardGradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="finger-print" size={22} color="#fff" />
                            <Text style={[styles.buttonText, { fontFamily: 'Inter_600SemiBold' }]}>
                                Unlock with Biometrics
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoBg: {
        width: 88,
        height: 88,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 28,
    },
    lockSection: {
        alignItems: 'center',
        marginBottom: 48,
        gap: 12,
    },
    lockIconBg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    lockTitle: {
        fontSize: 22,
    },
    lockSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
    },
    unlockButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
    },
});
