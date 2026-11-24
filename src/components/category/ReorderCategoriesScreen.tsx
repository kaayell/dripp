import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { GripVertical } from 'lucide-react-native';
import { type Category, loadCategories, reorderCategories } from '../../../db/queries';
import { Colors, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { CloseButton } from '@/components/ui/CloseButton';
import { Hint, ItemTitle, Title } from '@/components/ui/Typography';

export default function ReorderCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCategories()
      .then(setCategories)
      .catch((e) => console.error('[ReorderCategoriesScreen] load failed', e))
      .finally(() => setLoaded(true));
  }, []);

  const handleDragEnd = useCallback(
    ({ data, from, to }: { data: Category[]; from: number; to: number }) => {
      setCategories(data);
      if (from === to) return;
      reorderCategories(data.map((c) => c.id)).catch((e) =>
        console.error('[ReorderCategoriesScreen] save failed', e),
      );
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Category>) => (
      <Pressable
        testID={`reorder-category-${item.name}`}
        onLongPress={drag}
        delayLongPress={200}
        disabled={isActive}
        style={[styles.row, isActive && styles.rowActive]}
      >
        <ItemTitle style={styles.name} numberOfLines={1}>
          {item.name}
        </ItemTitle>
        <Pressable onPressIn={drag} hitSlop={8} style={styles.handle} disabled={isActive}>
          <GripVertical color={Colors.icon} size={20} />
        </Pressable>
      </Pressable>
    ),
    [],
  );

  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <CloseButton /> }} />
      <SafeAreaScreen>
        <Title style={styles.title}>Reorder Categories</Title>
        {loaded && categories.length === 0 ? (
          <Hint>No categories yet</Hint>
        ) : (
          <DraggableFlatList
            data={categories}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            containerStyle={styles.list}
          />
        )}
      </SafeAreaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingBottom: Spacing.xxl,
  },
  list: {
    flex: 1,
  },
  row: {
    ...CommonStyles.surface,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.xl,
    marginBottom: Spacing.base,
  },
  rowActive: {
    borderColor: Colors.label,
  },
  name: {
    flex: 1,
  },
  handle: {
    height: '100%',
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
});
