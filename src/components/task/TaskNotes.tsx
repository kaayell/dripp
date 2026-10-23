import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { parseISO } from 'date-fns';
import { TaskNote } from '../../../db/queries';
import { Colors, dimmed, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { formatForDisplay } from '@/constants/dates';
import { Body, Caption, Hint, SectionTitle } from '@/components/ui/Typography';

type TaskNotesProps = {
  taskId: number;
  color: string;
  taskNotes: TaskNote[];
};

export function TaskNotes({ taskId, color, taskNotes }: TaskNotesProps) {
  const [expanded, setExpanded] = useState(false);
  const hasNotes = taskNotes.length > 0;
  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <View style={styles.container}>
      <Pressable
        disabled={!hasNotes}
        hitSlop={8}
        onPress={() => setExpanded((v) => !v)}
        style={styles.titleRow}
      >
        <SectionTitle>Notes</SectionTitle>
        <View style={styles.titleMeta}>
          <Caption style={styles.count}>{taskNotes.length}</Caption>
          {hasNotes && <Chevron color={Colors.label} size={16} strokeWidth={2.25} />}
        </View>
      </Pressable>
      {!hasNotes ? (
        <Hint style={styles.empty}>Long-press a day to add a note</Hint>
      ) : (
        expanded &&
        taskNotes.map(({ date, note }) => (
          <Pressable
            key={date}
            onPress={() => router.push({ pathname: '/task/note', params: { taskId, date, color } })}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: dimmed(color, 5) }]}
          >
            <View style={styles.content}>
              <View style={styles.dateContainer}>
                {formatForDisplay(parseISO(date), 'EEE,MM.dd')
                  .split(',')
                  .map((section) => {
                    return (
                      <Caption key={section} style={styles.date}>
                        {section}
                      </Caption>
                    );
                  })}
              </View>
              <Body style={styles.note}>{note}</Body>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  count: {
    fontSize: FontSize.md,
  },
  empty: {
    paddingTop: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  date: {
    fontSize: FontSize.md,
    textTransform: 'uppercase',
    paddingRight: Spacing.lg,
  },
  note: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    lineHeight: 21,
  },
  dateContainer: {
    flexDirection: 'column',
  },
});
