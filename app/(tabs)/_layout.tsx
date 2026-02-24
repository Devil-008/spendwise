import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const SPRING = { damping: 15, stiffness: 180, mass: 0.7 };

const TAB_ITEMS = [
  { name: "index", icon: "home-outline" as const, iconFocused: "home" as const },
  { name: "analytics", icon: "stats-chart-outline" as const, iconFocused: "stats-chart" as const },
  { name: "add", icon: "add" as const, iconFocused: "add" as const },
  { name: "profile", icon: "person-outline" as const, iconFocused: "person" as const },
];

// ─── Tab Icon ───────────────────────────────────────────────────────
function TabIcon({
  route,
  focused,
  onPress,
  onLongPress,
  colors,
}: {
  route: (typeof TAB_ITEMS)[number];
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colors: any;
}) {
  // Active circle animation
  const circleScale = useSharedValue(focused ? 1 : 0);
  const circleTranslateY = useSharedValue(focused ? -18 : 0);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    circleScale.value = withSpring(focused ? 1 : 0, SPRING);
    circleTranslateY.value = withSpring(focused ? -18 : 0, SPRING);
    iconScale.value = withSpring(focused ? 1.1 : 1, SPRING);
  }, [focused]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: circleScale.value },
      { translateY: circleTranslateY.value },
    ],
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { translateY: circleTranslateY.value },
    ],
  }));

  const handlePress = () => {
    if (!focused && Platform.OS !== "web") Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={s.tabSlot}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      {/* Elevated circle behind the active icon */}
      <Animated.View style={[s.activeCircle, { backgroundColor: colors.tintLight }, circleStyle]} />

      {/* Icon */}
      <Animated.View style={[s.iconContainer, iconAnimStyle]}>
        <Ionicons
          name={focused ? route.iconFocused : route.icon}
          size={route.name === "add" ? 26 : 22}
          color={focused ? colors.tint : "rgba(255,255,255,0.5)"}
        />
      </Animated.View>
    </Pressable>
  );
}

// ─── Custom Tab Bar ─────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <View
      style={[
        s.barOuter,
        { paddingBottom: isWeb ? 14 : Math.max(insets.bottom, 8) },
      ]}
    >
      <View style={s.barPill}>
        {state.routes.map((route, index) => {
          const meta = TAB_ITEMS[index];
          if (!meta) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabIcon
              key={route.key}
              route={meta}
              focused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Native Tab Layout (iOS 26+ liquid glass) ───────────────────────
function NativeTabLayout() {
  return (
    <NativeTabs screenOptions={{ headerShown: false }}>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="analytics">
        <Icon sf={{ default: "chart.pie", selected: "chart.pie.fill" }} />
        <Label>Analytics</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add">
        <Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} />
        <Label>Add</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const s = StyleSheet.create({
  barOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  barPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1D28",
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: { elevation: 20 },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
    }),
  },
  tabSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
  },
  activeCircle: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconContainer: {
    zIndex: 1,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  addCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
});

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
