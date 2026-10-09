import { useCallback, useEffect, useRef } from 'react';
import { type LayoutRectangle, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { Category } from '../../../db/queries';
import { Colors } from '@/constants/theme';

const FADE_DURATION = 150;
const SPRING = { damping: 18, stiffness: 180, mass: 0.8 };

type Props = {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
};

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: Props) {
  const layouts = useRef<Record<number, LayoutRectangle>>({});
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const pillOpacity = useSharedValue(0);

  const movePill = useCallback(
    (layout: LayoutRectangle | undefined) => {
      if (!layout) {
        pillOpacity.value = withTiming(0, { duration: FADE_DURATION });
        return;
      }
      if (pillOpacity.value === 0) {
        pillX.value = layout.x;
        pillWidth.value = layout.width;
      } else {
        pillX.value = withSpring(layout.x, SPRING);
        pillWidth.value = withSpring(layout.width, SPRING);
      }
      pillOpacity.value = withTiming(1, { duration: FADE_DURATION });
    },
    [pillX, pillWidth, pillOpacity],
  );

  useEffect(() => {
    movePill(selectedCategoryId != null ? layouts.current[selectedCategoryId] : undefined);
  }, [selectedCategoryId, movePill]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    width: pillWidth.value,
    transform: [{ translateX: pillX.value }],
  }));

  return (
    <View style={styles.row}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.capsule}
        contentContainerStyle={styles.capsuleContent}
      >
        <Animated.View style={[styles.pill, pillStyle]} />
        {categories.map((item) => {
          const active = item.id === selectedCategoryId;
          return (
            <CategoryTab
              key={item.id}
              name={item.name}
              active={active}
              pillX={pillX}
              pillWidth={pillWidth}
              pillOpacity={pillOpacity}
              onPress={() => onSelectCategory(active ? null : item.id)}
              onLayout={(layout) => {
                layouts.current[item.id] = layout;
                if (active) movePill(layout);
              }}
            />
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

type CategoryTabProps = {
  name: string;
  active: boolean;
  pillX: SharedValue<number>;
  pillWidth: SharedValue<number>;
  pillOpacity: SharedValue<number>;
  onPress: () => void;
  onLayout: (layout: LayoutRectangle) => void;
};

function CategoryTab({
  name,
  active,
  pillX,
  pillWidth,
  pillOpacity,
  onPress,
  onLayout,
}: CategoryTabProps) {
  const tabX = useSharedValue(0);
  const tabWidth = useSharedValue(0);

  const coverage = useDerivedValue(() => {
    if (tabWidth.value === 0) return 0;
    const overlap =
      Math.min(pillX.value + pillWidth.value, tabX.value + tabWidth.value) -
      Math.max(pillX.value, tabX.value);
    return Math.max(0, Math.min(1, overlap / tabWidth.value)) * pillOpacity.value;
  });

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(coverage.value, [0, 1], [Colors.label, Colors.background]),
  }));

  return (
    <View
      style={styles.tab}
      onLayout={(e) => {
        const layout = e.nativeEvent.layout;
        tabX.value = layout.x;
        tabWidth.value = layout.width;
        onLayout(layout);
      }}
    >
      <Pressable style={[styles.tabPressable]} onPress={onPress}>
        <Animated.Text style={[styles.tabText, active && styles.tabTextActive, textStyle]}>
          {name}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
  },
  capsule: {
    flexGrow: 0,
    maxWidth: '100%',
    borderRadius: 999,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  capsuleContent: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 0,
    borderRadius: 999,
    backgroundColor: Colors.text,
  },
  tab: {
    minWidth: 50,
    borderRadius: 999,
  },
  tabPressable: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.label,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    fontWeight: '700',
  },
});
