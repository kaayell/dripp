import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { parseISO } from 'date-fns';
import { TaskNote } from '../../../db/queries';
import { Colors, dimmed } from '@/constants/theme';
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
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    paddingBottom: 8,
    paddingLeft: 6,
  },
  empty: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.label,
    paddingVertical: 8,
    paddingLeft: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: Colors.cellBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.label,
    textTransform: 'uppercase',
  },
  note: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 21,
  },
});
