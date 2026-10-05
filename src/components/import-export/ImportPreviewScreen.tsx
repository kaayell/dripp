import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { format, parseISO } from 'date-fns';
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
import { Colors, dimmed } from '@/constants/theme.ts';
import { DateFrequency, formatDisplayTime, parseTime } from '@/constants/dates.ts';
import { errorMessage } from '@/constants/error.ts';
import { File } from 'expo-file-system';
import { ImportedData } from '@/import-export/importParser.ts';

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
      label={fileErrors.length > 0 ? 'Choose another file' : 'Choose file'}
      onPress={chooseFile}
    />
  ) : status.kind === 'done' ? (
    <>
      <Text style={styles.subtitle}>{status.message}</Text>
      <ActionButton label="Done" onPress={() => router.dismissTo('/')} />
    </>
  ) : (
    <>
      {status.kind === 'error' && <Text style={styles.error}>{status.message}</Text>}
      <ActionButton
        label="Merge with current data"
        onPress={() => doImport('merge')}
        disabled={status.kind === 'importing'}
      />
      <Text style={styles.hint}>
        Adds new tasks, categories and logs. Tasks already in dripp keep their settings.
      </Text>
      <ActionButton
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
          <Text style={styles.title}>Import data</Text>
          {data ? (
            <>
              <Text style={styles.subtitle}>{describeCounts(data)}</Text>
              {existing && (
                <Text style={styles.hint}>
                  {pluralize(newTaskCount, 'new task')}, {data.tasks.length - newTaskCount} already
                  in dripp
                </Text>
              )}

              {data.categories.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Categories</Text>
                  <View style={styles.chips}>
                    {data.categories.map((category) => (
                      <View key={category.name} style={styles.chip}>
                        <Text style={styles.chipText}>{category.name}</Text>
                        {isNewCategory(category.name) && <Text style={styles.newBadge}>New</Text>}
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.sectionLabel}>Tasks</Text>
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
                    <Text style={styles.taskName}>{task.name}</Text>
                    {existing &&
                      (isNewTask(task.name) ? (
                        <Text style={styles.newBadge}>New</Text>
                      ) : (
                        <Text style={styles.existingBadge}>In dripp</Text>
                      ))}
                  </View>
                  <Text style={styles.taskDetail}>
                    {[
                      task.category,
                      pluralize(task.logs.length, 'log'),
                      task.lastLog && `last ${format(parseISO(task.lastLog), 'MMM d, yyyy')}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                  {task.reminder && (
                    <View style={styles.reminder}>
                      <Bell size={14} color={Colors.label} />
                      <Text style={styles.taskDetail}>
                        {summarizeReminder(
                          task.reminder.type as DateFrequency,
                          task.reminder.interval,
                          formatDisplayTime(parseTime(task.reminder.time)),
                          task.reminder.dayOfWeek ?? 0,
                          task.reminder.dayOfMonth ?? 1,
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </>
          ) : fileErrors.length > 0 ? (
            <>
              <Text style={styles.subtitle}>
                This file can't be imported. {pluralize(fileErrors.length, 'problem')} found:
              </Text>
              {fileErrors.map((error, i) => (
                <Text key={i} style={styles.error}>
                  • {error}
                </Text>
              ))}
            </>
          ) : (
            <Text style={styles.subtitle}>
              Choose a dripp export file to see what it contains before importing.
            </Text>
          )}
        </ScrollView>
        <View style={styles.footer}>{footerContent}</View>
      </SafeAreaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.icon,
  },
  hint: {
    fontSize: 14,
    color: Colors.label,
  },
  error: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.error,
  },
  sectionLabel: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.label,
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cellBg,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  task: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  taskDetail: {
    fontSize: 13,
    color: Colors.icon,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.teal,
  },
  existingBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.label,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
