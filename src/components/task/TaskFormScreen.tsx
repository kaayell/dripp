import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  Category,
  ReminderInputValues,
  Task,
  TaskInputValues,
  TaskWithReminder,
} from '../../../db/queries';
import { loadCategories } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import { CloseButton } from '@/components/ui/CloseButton';
import { SaveButton } from '@/components/ui/SaveButton';
import { TaskReminder } from '@/components/task/TaskReminder';
import { ensureNotificationPermission, saveTaskReminder } from '@/notifications/reminders';

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

export type TaskFormValues = TaskInputValues;

type TaskScreenProps = {
  title: string;
  task?: TaskWithReminder;
  onSubmit: (values: TaskFormValues) => Promise<Task>;
  newCategoryReturnTo: { pathname: '/add-task' | '/edit-task'; taskId?: number };
};

export default function TaskFormScreen({
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
  const [reminder, setReminder] = useState<ReminderInputValues | null>(
    task?.reminder
      ? {
          time: task.reminder.time,
          type: task.reminder.type,
          interval: task.reminder.interval,
          dayOfWeek: task.reminder.dayOfWeek,
          dayOfMonth: task.reminder.dayOfMonth,
        }
      : null,
  );
  const [reminderEnabled, setReminderEnabled] = useState(task?.reminder != null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (newCategoryIdParam) {
      setCategoryId(Number(newCategoryIdParam));
    }
    loadCategories()
      .then(setCategories)
      .catch((e) => console.error('[TaskFormScreen] load categories failed', e));
  }, [newCategoryIdParam]);

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleToggleReminder = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const granted = await ensureNotificationPermission();
      if (!granted) return;
    }
    setReminderEnabled(enabled);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const savedTask = await onSubmit({
        name: name.trim(),
        color,
        categoryId,
      });
      await saveTaskReminder(savedTask.id, reminderEnabled ? reminder : null);
      router.back();
    } catch (e) {
      setSubmitting(false);
      setError('Task already exists');
    }
  }, [canSubmit, onSubmit, name, color, categoryId, reminder, reminderEnabled]);

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

        <View style={styles.section}>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            placeholder="Task name"
            placeholderTextColor={Colors.label}
            style={[styles.input, error && styles.inputError]}
            autoFocus
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.section}>
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
        </View>

        <View style={styles.section}>
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
        </View>

        <View style={styles.section}>
          <View style={styles.reminderRow}>
            <Text style={styles.sectionLabel}>Reminder</Text>
            <Switch
              style={{ transform: [{ scale: 1.25 }] }}
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ true: Colors.teal }}
            />
          </View>
          {reminderEnabled && <TaskReminder value={reminder} onChange={setReminder} />}
        </View>

        <SaveButton onPress={handleSubmit} disabled={!canSubmit} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    paddingBottom: 20,
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    marginTop: -12,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.label,
    textTransform: 'uppercase',
    letterSpacing: 0.75,
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
    color: Colors.label,
    textTransform: 'lowercase',
  },
  categoryChipTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
});
