import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { parseISO } from 'date-fns';
import { Bell } from 'lucide-react-native';
import { importAppData, ImportMode, ImportResult } from '../../../db/importData.ts';
import { AppData, loadCategories, loadTasks } from '../../../db/queries.ts';
import { describeCounts } from '@/import-export/describeCounts.ts';
import { rescheduleAllReminders } from '@/notifications/reminders.ts';
import { summarizeReminder } from '@/components/task/TaskReminder.tsx';
import { ActionButton } from '@/components/ui/ActionButton.tsx';
import { CloseButton } from '@/components/ui/CloseButton.tsx';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import Drop from '@/components/ui/Drop.tsx';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import {
  DateFrequency,
  formatDisplayTime,
  formatForDisplay,
  parseTime,
} from '@/constants/dates.ts';
import { errorMessage } from '@/constants/error.ts';
import { File } from 'expo-file-system';
import { ImportedData } from '@/import-export/importParser.ts';
import {
  Body,
  Caption,
  ErrorText,
  Hint,
  ItemTitle,
  Label,
  Subtitle,
  Title,
} from '@/components/ui/Typography';

type Status = { kind: 'ready' | 'importing' } | { kind: 'done' | 'error'; message: string };

type ExistingNames = { tasks: Set<string>; categories: Set<string> };

export default function ImportPreviewScreen() {
  const [data, setData] = useState<AppData | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [existing, setExisting] = useState<ExistingNames | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'ready' });

  function pluralize(count: number, noun: string, plural = `${noun}s`) {
    return `${count} ${count === 1 ? noun : plural}`;
  }

  function describeResult(result: ImportResult) {
    return [
      pluralize(result.tasks, 'task'),
      pluralize(result.categories, 'category', 'categories'),
      pluralize(result.logs, 'log'),
      pluralize(result.notes, 'note'),
      pluralize(result.reminders, 'reminder'),
    ].join(', ');
  }

  async function pickImportFile(): Promise<string | null> {
    const picked = await File.pickFileAsync();
    if (picked.canceled) return null;
    return picked.result.text();
  }

  const chooseFile = async () => {
    try {
      const json = await pickImportFile();
      if (json == null) return;
      const imported = ImportedData.fromJson(json);
      setData(imported.isValid ? imported.toAppData() : null);
      setFileErrors(imported.errors);
      setStatus({ kind: 'ready' });
    } catch (e) {
      console.error('[ImportPreviewScreen] reading file failed', e);
      setData(null);
      setFileErrors([errorMessage(e)]);
    }
  };

  useEffect(() => {
    Promise.all([loadTasks(), loadCategories()])
      .then(([tasks, categories]) =>
        setExisting({
          tasks: new Set(tasks.map((t) => t.name.toLowerCase())),
          categories: new Set(categories.map((c) => c.name.toLowerCase())),
        }),
      )
      .catch((e) => console.error('[ImportPreviewScreen] load failed', e));
  }, []);

  const tasks = useMemo(
    () =>
      (data?.tasks ?? []).map((task) => ({
        ...task,
        lastLog: task.logs
          .map((log) => log.date)
          .sort()
          .at(-1),
      })),
    [data],
  );

  const isNewTask = (name: string) => existing != null && !existing.tasks.has(name.toLowerCase());
  const isNewCategory = (name: string) =>
    existing != null && !existing.categories.has(name.toLowerCase());
  const newTaskCount = tasks.filter((t) => isNewTask(t.name)).length;

  const doImport = async (mode: ImportMode) => {
    if (!data) return;
    setStatus({ kind: 'importing' });
    try {
      const result = await importAppData(data, mode);
      await rescheduleAllReminders().catch((e) =>
        console.error('[ImportPreviewScreen] reminder reschedule failed', e),
      );
      setStatus({ kind: 'done', message: `Added ${describeResult(result)}` });
    } catch (e) {
      console.error('[ImportPreviewScreen] import failed', e);
      setStatus({ kind: 'error', message: errorMessage(e) });
    }
  };

  const onReplace = () =>
    Alert.alert('Replace all data?', 'Everything currently in dripp will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Replace', style: 'destructive', onPress: () => doImport('replace') },
    ]);

  const footerContent = !data ? (
    <ActionButton
      testID="choose-file-button"
      label={fileErrors.length > 0 ? 'Choose another file' : 'Choose file'}
      onPress={chooseFile}
    />
  ) : status.kind === 'done' ? (
    <>
      <Subtitle>{status.message}</Subtitle>
      <ActionButton testID="done-button" label="Done" onPress={() => router.dismissTo('/')} />
    </>
  ) : (
    <>
      {status.kind === 'error' && <ErrorText>{status.message}</ErrorText>}
      <ActionButton
        testID="merge-button"
        label="Merge with current data"
        onPress={() => doImport('merge')}
        disabled={status.kind === 'importing'}
      />
      <Hint>Adds new tasks, categories and logs. Tasks already in dripp keep their settings.</Hint>
      <ActionButton
        testID="replace-button"
        label="Replace all data"
        onPress={onReplace}
        disabled={status.kind === 'importing'}
        destructive
      />
    </>
  );

  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <CloseButton /> }} />
      <SafeAreaScreen padded={false}>
        <ScrollView contentContainerStyle={styles.content}>
          <Title>Import data</Title>
          {data ? (
            <>
              <Subtitle>{describeCounts(data)}</Subtitle>
              {existing && (
                <Hint>
                  {pluralize(newTaskCount, 'new task')}, {data.tasks.length - newTaskCount} already
                  in dripp
                </Hint>
              )}

              {data.categories.length > 0 && (
                <>
                  <Label style={styles.sectionLabel}>Categories</Label>
                  <View style={styles.chips}>
                    {data.categories.map((category) => (
                      <View key={category.name} style={styles.chip}>
                        <Body style={styles.chipText}>{category.name}</Body>
                        {isNewCategory(category.name) && <Body style={styles.newBadge}>New</Body>}
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Label style={styles.sectionLabel}>Tasks</Label>
              {tasks.map((task) => (
                <View
                  key={task.name}
                  style={[
                    styles.task,
                    { borderColor: dimmed(task.color, 30), backgroundColor: dimmed(task.color, 5) },
                  ]}
                >
                  <View style={styles.taskHeader}>
                    <Drop size={14} color={dimmed(task.color, 70)} />
                    <ItemTitle style={styles.taskName}>{task.name}</ItemTitle>
                    {existing &&
                      (isNewTask(task.name) ? (
                        <Body style={styles.newBadge}>New</Body>
                      ) : (
                        <Caption>In dripp</Caption>
                      ))}
                  </View>
                  <Body style={styles.taskDetail}>
                    {[
                      task.category,
                      pluralize(task.logs.length, 'log'),
                      task.notes?.length && pluralize(task.notes.length, 'note'),
                      task.lastLog &&
                        `last ${formatForDisplay(parseISO(task.lastLog), 'MMM d, yyyy')}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Body>
                  {task.reminder && (
                    <View style={styles.reminder}>
                      <Bell size={14} color={Colors.label} />
                      <Body style={styles.taskDetail}>
                        {summarizeReminder(
                          task.reminder.type as DateFrequency,
                          task.reminder.interval,
                          formatDisplayTime(parseTime(task.reminder.time)),
                          task.reminder.dayOfWeek ?? 0,
                          task.reminder.dayOfMonth ?? 1,
                        )}
                      </Body>
                    </View>
                  )}
                </View>
              ))}
            </>
          ) : fileErrors.length > 0 ? (
            <>
              <Subtitle>
                This file can't be imported. {pluralize(fileErrors.length, 'problem')} found:
              </Subtitle>
              {fileErrors.map((error, i) => (
                <ErrorText key={i}>• {error}</ErrorText>
              ))}
            </>
          ) : (
            <Subtitle>
              Choose a dripp export file to see what it contains before importing.
            </Subtitle>
          )}
        </ScrollView>
        <View style={styles.footer}>{footerContent}</View>
      </SafeAreaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  sectionLabel: {
    marginTop: Spacing.xl,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  chip: {
    ...CommonStyles.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  chipText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  task: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  taskName: {
    flex: 1,
  },
  taskDetail: {
    fontSize: FontSize.md,
    color: Colors.icon,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  newBadge: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.teal,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
