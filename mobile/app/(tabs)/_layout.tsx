import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors } from '../../src/constants/theme';

type IconName = 'home' | 'fridge' | 'book' | 'profile';

function TabIcon({ name, color }: { name: IconName; color: string }) {
  switch (name) {
    case 'home':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M3 12l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" fill={color} />
        </Svg>
      );
    case 'fridge':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Rect x={5} y={3} width={14} height={18} rx={3} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5 11h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M8.5 7v1.5M8.5 14.5v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'book':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M6 3h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M19 18H6a2 2 0 0 0-2 2" stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M12 7v5l2-1.3L16 12V7" stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'profile':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        </Svg>
      );
  }
}

function ActiveIndicator() {
  return <View style={styles.indicator} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <ActiveIndicator />}
              <TabIcon name="home" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="fridge"
        options={{
          title: '냉장고',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <ActiveIndicator />}
              <TabIcon name="fridge" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cookbook"
        options={{
          title: '요리북',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <ActiveIndicator />}
              <TabIcon name="book" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <ActiveIndicator />}
              <TabIcon name="profile" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    height: Platform.select({ ios: 84, android: 68 }),
    paddingTop: 12,
  },
  tabItem: {
    paddingTop: Platform.select({ ios: 4, android: 0 }),
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 30,
  },
  indicator: {
    position: 'absolute',
    top: -12,
    width: 24,
    height: 3,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
