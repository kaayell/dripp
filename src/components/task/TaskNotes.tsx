import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { parseISO } from 'date-fns';
import { TaskNote } from '../../../db/queries';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { formatForDisplay } from '@/constants/dates';

type TaskNotesProps = {
  taskId: number;
  color: string;
  taskNotes: TaskNote[];
};

export function TaskNotes({ taskId, color, taskNotes }: TaskNotesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      {taskNotes.length === 0 ? (
        <Text style={styles.empty}>Long-press a day to add a note</Text>
      ) : (
        taskNotes.map(({ date, note }) => (
          <Pressable
            key={date}
            onPress={() => router.push({ pathname: '/task/note', params: { taskId, date, color } })}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: dimmed(color, 5) }]}
          >
            <View style={styles.content}>
              <Text style={styles.date}>{formatForDisplay(parseISO(date), 'MM/dd/yy')}</Text>
              <Text style={styles.note}>{note}</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingBottom: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  empty: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.label,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  row: {
    ...CommonStyles.surface,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  date: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.label,
    textTransform: 'uppercase',
  },
  note: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    lineHeight: 21,
  },
});
