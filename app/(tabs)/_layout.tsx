import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

const TAB_ITEMS = [
  { name: "index", title: "Home", icon: "home-outline" as const, iconFocused: "home" as const },
  { name: "analytics", title: "Analytics", icon: "stats-chart-outline" as const, iconFocused: "stats-chart" as const },
  { name: "add", title: "Add", icon: "add" as const, iconFocused: "add" as const },
  { name: "profile", title: "Profile", icon: "person-outline" as const, iconFocused: "person" as const },
];

// ─── Individual Tab Item ────────────────────────────────────────────
function TabItem({
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
  isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const iconOpacity = useSharedValue(focused ? 1 : 0.5);
  const labelTranslateY = useSharedValue(focused ? 0 : 6);
  const labelOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.85, SPRING_CONFIG);
    iconOpacity.value = withTiming(focused ? 1 : 0.5, { duration: 200 });
    labelTranslateY.value = withSpring(focused ? 0 : 6, SPRING_CONFIG);
    labelOpacity.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: iconOpacity.value,
  }));

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslateY.value }],
  }));

  // ── Add button (special FAB) ──
  if (route.name === "add") {
    const addScale = useSharedValue(1);
    const addRotation = useSharedValue(0);

    const addAnimStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: addScale.value },
        { rotate: `${addRotation.value}deg` },
      ],
    }));

    const handleAddPress = () => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      addScale.value = withSpring(0.82, { damping: 10, stiffness: 300 });
      addRotation.value = withSpring(90, { damping: 12, stiffness: 180 });
      setTimeout(() => {
        addScale.value = withSpring(1, SPRING_CONFIG);
        addRotation.value = withSpring(0, SPRING_CONFIG);
      }, 150);
      onPress();
    };

    return (
      <View style={s.addWrapper}>
        <AnimatedPressable onPress={handleAddPress} style={[s.addOuter, addAnimStyle]}>
          <LinearGradient
            colors={[colors.cardGradientStart, colors.cardGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.addButton}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </LinearGradient>
        </AnimatedPressable>
      </View>
    );
  }

  // ── Regular tab ──
  const tintColor = focused ? colors.tint : colors.tabIconDefault;

  return (
    <Pressable
      onPress={() => {
        if (!focused && Platform.OS !== "web") Haptics.selectionAsync();
        onPress();
      }}
      onLongPress={onLongPress}
      style={s.tabItem}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={route.title}
    >
      <Animated.View style={[s.iconWrap, iconAnimStyle]}>
        <Ionicons
          name={focused ? route.iconFocused : route.icon}
          size={23}
          color={tintColor}
        />
      </Animated.View>
      <Animated.Text
        style={[
          s.tabLabel,
          { color: tintColor, fontFamily: "Inter_600SemiBold" },
          labelAnimStyle,
        ]}
        numberOfLines={1}
      >
        {route.title}
      </Animated.Text>
    </Pressable>
  );
}

// ─── Custom Tab Bar ─────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  // Sliding indicator
  const tabCount = state.routes.length;
  const screenWidth = Dimensions.get("window").width;
  const barPadH = 12;
  const outerPad = 16; // barOuter horizontal padding (8 * 2)
  const barInner = screenWidth - outerPad - barPadH * 2;
  const tabW = barInner / tabCount;
  const indicatorX = useSharedValue(state.index * tabW);

  useEffect(() => {
    if (state.index !== 2) {
      indicatorX.value = withSpring(state.index * tabW, SPRING_CONFIG);
    }
  }, [state.index, tabW]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabW,
  }));

  return (
    <View
      style={[
        s.barOuter,
        { paddingBottom: isWeb ? 12 : Math.max(insets.bottom, 6) },
      ]}
    >
      <View
        style={[
          s.barContainer,
          {
            backgroundColor: isIOS
              ? "transparent"
              : isDark
                ? "rgba(26,29,40,0.94)"
                : "rgba(255,255,255,0.94)",
          },
        ]}
      >
        {/* Glass blur on iOS */}
        {isIOS && (
          <BlurView
            intensity={80}
            tint={isDark ? "systemChromeMaterialDark" : "systemChromeMaterial"}
            style={[StyleSheet.absoluteFill, { borderRadius: 32 }]}
          />
        )}

        {/* Sliding pill indicator */}
        {state.index !== 2 && (
          <Animated.View style={[s.indicator, indicatorStyle]}>
            <View
              style={[
                s.indicatorPill,
                { backgroundColor: colors.tint + "1A" },
              ]}
            />
          </Animated.View>
        )}

        {/* Tabs */}
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
            <TabItem
              key={route.key}
              route={meta}
              focused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              colors={colors}
              isDark={isDark}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Layouts ────────────────────────────────────────────────────────
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
    paddingHorizontal: 8,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 16 },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
    }),
  },
  indicator: {
    position: "absolute",
    top: 6,
    left: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  indicatorPill: {
    width: "72%",
    height: 42,
    borderRadius: 21,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    zIndex: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  addWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  addOuter: {
    marginTop: -30,
    ...Platform.select({
      ios: {
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
      },
      android: { elevation: 14 },
      default: {},
    }),
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
