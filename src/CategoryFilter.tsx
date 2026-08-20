import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Category } from '../db/queries';
import { APP_HEADER_HEIGHT } from './AppHeader';
import { BORDER, CELL_BG, CELL_BORDER, CORAL, TEXT, TEXT_DIM } from './theme';

type Props = {
  categories: Category[];
  selectedCategoryId: number | null;
  selectedCategoryLabel: string | undefined;
  filterVisible: boolean;
  onToggleFilter: () => void;
  onCloseFilter: () => void;
  onSelectCategory: (categoryId: number | null) => void;
};

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  selectedCategoryLabel,
  filterVisible,
  onToggleFilter,
  onCloseFilter,
  onSelectCategory,
}: Props) {
  return (
    <>
      <View style={styles.filterButtonSlot}>
        <Pressable
          style={styles.filterButton}
          onPress={onToggleFilter}
          hitSlop={8}
          accessibilityLabel="Filter by category"
        >
          <Text style={styles.filterButtonText}>{selectedCategoryLabel ?? 'all'}</Text>
          <Text style={styles.filterButtonChevron}>▾</Text>
        </Pressable>
      </View>

      {filterVisible && (
        <>
          <Pressable style={styles.filterBackdrop} onPress={onCloseFilter} />
          <View style={styles.filterDropdownCard}>
            <Pressable style={styles.filterDropdownRow} onPress={() => onSelectCategory(null)}>
              <Text
                style={[
                  styles.filterDropdownRowText,
                  selectedCategoryId == null && styles.filterDropdownRowTextActive,
                ]}
              >
                all
              </Text>
              {selectedCategoryId == null && <Text style={styles.filterDropdownCheck}>✓</Text>}
            </Pressable>
            {categories.map((category) => {
              const active = category.id === selectedCategoryId;
              return (
                <Pressable
                  key={category.id}
                  style={styles.filterDropdownRow}
                  onPress={() => onSelectCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.filterDropdownRowText,
                      active && styles.filterDropdownRowTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {active && <Text style={styles.filterDropdownCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  filterButtonSlot: {
    position: 'absolute',
    top: -APP_HEADER_HEIGHT,
    right: 20,
    height: APP_HEADER_HEIGHT,
    justifyContent: 'center',
    zIndex: 22,
    elevation: 22,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 17,
    justifyContent: 'center',
    backgroundColor: CELL_BG,
    borderWidth: 1,
    borderColor: CELL_BORDER,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    textTransform: 'lowercase',
  },
  filterButtonChevron: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_DIM,
  },
  filterBackdrop: {
    position: 'absolute',
    top: -APP_HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
  },
  filterDropdownCard: {
    position: 'absolute',
    top: 8,
    right: 20,
    minWidth: 170,
    borderRadius: 14,
    paddingVertical: 6,
    backgroundColor: '#26252b',
    borderWidth: 1,
    borderColor: BORDER,
    zIndex: 21,
    elevation: 21,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  filterDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterDropdownRowText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DIM,
    textTransform: 'lowercase',
  },
  filterDropdownRowTextActive: {
    color: TEXT,
    fontWeight: '700',
  },
  filterDropdownCheck: {
    fontSize: 14,
    fontWeight: '700',
    color: CORAL,
    marginLeft: 12,
  },
});
