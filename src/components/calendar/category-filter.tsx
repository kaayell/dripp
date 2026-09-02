import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Category } from '../../../db/queries';
import { Colors } from '@/constants/theme';

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
  return (
    <View style={styles.row}>
      {categories.map((category) => {
        const active = category.id === selectedCategoryId;
        return (
          <Pressable
            key={category.id}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onSelectCategory(active ? null : category.id)}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{category.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textDim,
    textTransform: 'lowercase',
  },
  tabTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
});
