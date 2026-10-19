import { useCallback, useState } from 'react';
import { Stack, useFocusEffect } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Category, loadCategories } from '../../db/queries.ts';
import CategoryFilter from '@/components/category/CategoryFilter.tsx';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import CalendarScreen from '@/components/calendar/CalendarScreen.tsx';
import LastDoneTasksScreen from '@/components/task/LastDoneTasksScreen.tsx';
import { Colors, Radius, Spacing } from '@/constants/theme.ts';

const PAGE_COUNT = 2;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const page = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    page.value = e.contentOffset.x / width;
  });

  useFocusEffect(
    useCallback(() => {
      loadCategories()
        .then(setCategories)
        .catch((e) => console.error('[HomeScreen] load failed', e));
    }, []),
  );

  return (
    <SafeAreaScreen padded={false}>
      <Stack.Screen options={{ headerLeft: () => <PageIndicator page={page} /> }} />
      <Animated.ScrollView
        horizontal
        pagingEnabled
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        <View style={{ width }}>
          <CalendarScreen selectedCategoryId={selectedCategoryId} />
        </View>
        <View style={{ width }}>
          <LastDoneTasksScreen selectedCategoryId={selectedCategoryId} />
        </View>
      </Animated.ScrollView>
      <View style={styles.categoryContainer}>
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </View>
    </SafeAreaScreen>
  );
}

function PageIndicator({ page }: { page: SharedValue<number> }) {
  return (
    <View style={styles.indicator} pointerEvents="none">
      {Array.from({ length: PAGE_COUNT }, (_, i) => (
        <PageDot key={i} index={i} page={page} />
      ))}
    </View>
  );
}

function PageDot({ index, page }: { index: number; page: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const active = interpolate(page.value, [index - 1, index, index + 1], [0, 1, 0], 'clamp');
    return {
      width: interpolate(active, [0, 1], [6, 16]),
      opacity: interpolate(active, [0, 1], [0.35, 1]),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  categoryContainer: {
    paddingTop: Spacing.base,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.text,
  },
});
