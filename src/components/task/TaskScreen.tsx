import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Category, Task } from '../../../db/queries';
import { loadCategories } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import { CloseButton } from '@/components/ui/CloseButton';
import { SaveButton } from '@/components/ui/SaveButton';

const SWATCHES = [
  '#ec5b57',
  '#e18b60',
  '#daa932',
  '#e1d660',
  '#bce160',
  '#8be160',
  '#60e165',
  '#5ec386',
  '#50bfbe',
  '#00b7c1',
  '#64a1ee',
  '#606be1',
  '#b386e4',
  '#e160e1',
  '#da85b6',
  '#dc7492',
];

export type TaskFormValues = { name: string; color: string; categoryId: number | null };

type TaskScreenProps = {
  title: string;
  task?: Task;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  newCategoryReturnTo: { pathname: '/add-task' | '/edit-task'; taskId?: number };
};

export default function TaskScreen({
  title,
  task,
  onSubmit,
  newCategoryReturnTo,
}: TaskScreenProps) {
  const insets = useSafeAreaInsets();
  const { categoryId: newCategoryIdParam } = useLocalSearchParams<{ categoryId?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(task?.name ?? '');
  const [color, setColor] = useState(task?.color ?? SWATCHES[0]);
  const [categoryId, setCategoryId] = useState<number | null>(task?.categoryId ?? null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (newCategoryIdParam) {
      setCategoryId(Number(newCategoryIdParam));
    }
    loadCategories()
      .then(setCategories)
      .catch((e) => console.error('[TaskScreen] load categories failed', e));
  }, [newCategoryIdParam]);

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), color, categoryId });
      router.back();
    } catch (e) {
      console.error('[TaskScreen] save task failed', e);
      setSubmitting(false);
    }
  }, [canSubmit, onSubmit, name, color, categoryId]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <CloseButton />,
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
      >
        <Text style={styles.title}>{title}</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Task name"
          placeholderTextColor={Colors.textDim}
          style={styles.input}
          autoFocus
        />

        <Text style={styles.sectionLabel}>Color</Text>
        <View style={styles.swatchRow}>
          {SWATCHES.map((swatch) => (
            <Pressable
              key={swatch}
              onPress={() => setColor(swatch)}
              style={[
                styles.swatch,
                { backgroundColor: swatch },
                swatch === color && styles.swatchActive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {categories.map((category) => {
            const active = category.id === categoryId;
            return (
              <Pressable
                key={category.id}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setCategoryId(active ? null : category.id)}
              >
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            style={styles.categoryChip}
            onPress={() =>
              router.push({
                pathname: '/add-category',
                params: { ...newCategoryReturnTo },
              })
            }
          >
            <Text style={[styles.categoryChipText]}>+ new category</Text>
          </Pressable>
        </View>

        <SaveButton onPress={handleSubmit} disabled={!canSubmit} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.cellBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDim,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 2,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: Colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textDim,
    textTransform: 'lowercase',
  },
  categoryChipTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
});
