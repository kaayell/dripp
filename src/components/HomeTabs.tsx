import { useLayoutEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import TopTabs, { type MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import { Colors, Radius } from '@/constants/theme.ts';

const DOT_WIDTH = 16;
const DOT_HEIGHT = 6;

export default function HomeTabs() {
  return (
    <SafeAreaScreen padded={false}>
      <TopTabs
        tabBar={(props: MaterialTopTabBarProps) => <HeaderPageIndicator {...props} />}
        screenOptions={{ sceneStyle: { backgroundColor: Colors.background } }}
      >
        <TopTabs.Screen name="index" />
        <TopTabs.Screen name="tasks" />
      </TopTabs>
    </SafeAreaScreen>
  );
}

function HeaderPageIndicator({ state, navigation, position }: MaterialTopTabBarProps) {
  const pageCount = state.routes.length;

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      headerLeft: () => <PageIndicator pageCount={pageCount} position={position} />,
    });
  }, [navigation, pageCount, position]);

  return null;
}

function PageIndicator({
  pageCount,
  position,
}: {
  pageCount: number;
  position: Animated.AnimatedInterpolation<number>;
}) {
  return (
    <View style={styles.indicator} pointerEvents="none">
      {Array.from({ length: pageCount }, (_, i) => (
        <PageDot key={i} index={i} position={position} />
      ))}
    </View>
  );
}

function PageDot({
  index,
  position,
}: {
  index: number;
  position: Animated.AnimatedInterpolation<number>;
}) {
  const active = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });
  const scaleX = active.interpolate({
    inputRange: [0, 1],
    outputRange: [DOT_HEIGHT / DOT_WIDTH, 1],
  });
  const opacity = active.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  return <Animated.View style={[styles.dot, { opacity, transform: [{ scaleX }] }]} />;
}

const styles = StyleSheet.create({
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: DOT_WIDTH,
    height: DOT_HEIGHT,
    borderRadius: Radius.full,
    backgroundColor: Colors.text,
  },
});
