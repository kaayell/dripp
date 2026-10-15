import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pipette } from 'lucide-react-native';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import type {
  Category,
  ReminderInputValues,
  Task,
  TaskInputValues,
  TaskWithReminder,
} from '../../../db/queries';
import { loadCategories } from '../../../db/queries';
import { Colors, FontSize, FontWeight, Radius, Spacing, TaskSwatchColors } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { CloseButton } from '@/components/ui/CloseButton';
import { ActionButton } from '@/components/ui/ActionButton';
import { TextField } from '@/components/ui/TextField';
import { TaskReminder } from '@/components/task/TaskReminder';
import { ColorPickerModal } from '@/components/task/ColorPickerModal';
import { ensureNotificationPermission, saveTaskReminder } from '@/notifications/reminders';

export type TaskFormValues = TaskInputValues;

type TaskScreenProps = {
  title: string;
  task?: TaskWithReminder;
  onSubmit: (values: TaskFormValues) => Promise<Task>;
  newCategoryReturnTo: { pathname: '/task/add' | '/task/edit'; taskId?: number };
};

export default function TaskFormScreen({
  title,
  task,
  onSubmit,
  newCategoryReturnTo,
}: TaskScreenProps) {
  const { categoryId: newCategoryIdParam } = useLocalSearchParams<{ categoryId?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(task?.name ?? '');
  const [color, setColor] = useState(task?.color ?? TaskSwatchColors[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
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
  const isCustomColor = !TaskSwatchColors.includes(color);

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
      <SafeAreaScreen scroll>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.section}>
          <TextField
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            placeholder="Task name"
            error={error}
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.swatchRow}>
            {TaskSwatchColors.map((swatch) => (
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
            <Pressable
              testID="custom-color-button"
              onPress={() => setPickerOpen(true)}
              style={[
                styles.swatch,
                styles.swatchCustom,
                isCustomColor && { backgroundColor: color },
                isCustomColor && styles.swatchActive,
              ]}
            >
              {!isCustomColor && <Pipette color={Colors.icon} size={16} strokeWidth={2.25} />}
            </Pressable>
          </View>
          <ColorPickerModal
            visible={pickerOpen}
            color={color}
            onSelect={setColor}
            onClose={() => setPickerOpen(false)}
          />
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
                  pathname: '/category/add',
                  params: { ...newCategoryReturnTo },
                })
              }
            >
              <Text style={styles.categoryChipText}>+ new category</Text>
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

        <ActionButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
      </SafeAreaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.base,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.label,
    textTransform: 'uppercase',
    letterSpacing: 0.75,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
    marginBottom: Spacing.xxl,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: Colors.text,
  },
  swatchCustom: {
    ...CommonStyles.surface,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    ...CommonStyles.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  categoryChipActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.label,
    textTransform: 'lowercase',
  },
  categoryChipTextActive: {
    color: Colors.background,
    fontWeight: FontWeight.bold,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.base,
  },
});
