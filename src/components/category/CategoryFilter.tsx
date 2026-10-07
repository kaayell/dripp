import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.rowContent}
    >
      <View style={styles.capsule}>
        {categories.map((category) => {
          const active = category.id === selectedCategoryId;
          return (
            <Pressable
              key={category.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onSelectCategory(active ? null : category.id)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{category.name}</Text>
              {active && <X color={Colors.background} size={11} strokeWidth={2} />}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
  },
  rowContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  capsule: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: 999,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 50,
    borderRadius: 999,
  },
  tabActive: {
    paddingRight: 6,
    backgroundColor: Colors.text,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.label,
    textTransform: 'lowercase',
  },
  tabTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
});
