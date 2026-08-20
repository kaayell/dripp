import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Category } from '../../db/queries';
import { BACKGROUND, CELL_BG, CELL_BORDER, TEXT, TEXT_DIM } from '../theme';

type Props = {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
};

export default function CategoryFilter({ categories, selectedCategoryId, onSelectCategory }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.tab, selectedCategoryId == null && styles.tabActive]}
        onPress={() => onSelectCategory(null)}
      >
        <Text style={[styles.tabText, selectedCategoryId == null && styles.tabTextActive]}>
          all
        </Text>
      </Pressable>
      {categories.map((category) => {
        const active = category.id === selectedCategoryId;
        return (
          <Pressable
            key={category.id}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onSelectCategory(category.id)}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: CELL_BG,
    borderWidth: 1,
    borderColor: CELL_BORDER,
  },
  tabActive: {
    backgroundColor: TEXT,
    borderColor: TEXT,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: TEXT_DIM,
    textTransform: 'lowercase',
  },
  tabTextActive: {
    color: BACKGROUND,
    fontWeight: '700',
  },
});
