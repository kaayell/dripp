import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { parseISO } from 'date-fns';
import { formatForDisplay, todayString } from '@/constants/dates';
import { TaskLog, TaskNote } from '../../../db/queries';
import { StickyNote } from 'lucide-react-native';
import { TaskCalendarHeatmap } from '@/components/calendar/TaskCalendarHeatmap';
import { Body, Caption, Label, SectionTitle, Value } from '@/components/ui/Typography';
import { computeTaskStats } from '@/components/task/taskStats';
import Drop from '@/components/ui/Drop.tsx';

const COLLAPSED_GAP_COUNT = 5;

type TaskActivityProps = {
  color: string;
  taskLogs: TaskLog[];
  taskNotes: TaskNote[];
};

export function TaskActivity({ color, taskLogs, taskNotes }: TaskActivityProps) {
  const [showAllLogs, setShowAllLogs] = useState(false);
  const stats = useMemo(
    () =>
      computeTaskStats(
        taskLogs.map((log) => log.date),
        todayString(),
      ),
    [taskLogs],
  );

  const noteDates = useMemo(() => new Set(taskNotes.map((note) => note.date)), [taskNotes]);

  const visibleLogs = showAllLogs ? stats.logs : stats.logs.slice(0, COLLAPSED_GAP_COUNT);
  const hasMoreLogs = stats.logs.length > COLLAPSED_GAP_COUNT;

  const items = [
    {
      label: 'Avg Gap',
      value: stats.averageGapDays === null ? '—' : String(Math.floor(stats.averageGapDays)),
      unit: stats.averageGapDays === null ? undefined : 'D',
    },
    { label: '30 days', value: String(stats.last30Days) },
    { label: 'Past Year', value: String(stats.lastYear) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <SectionTitle>Activity</SectionTitle>
        <Caption>{stats.total}</Caption>
      </View>
      <TaskCalendarHeatmap color={color} taskLogs={taskLogs} />
      <View style={styles.statsRow}>
        {items.map(({ label, value, unit }, index) => (
          <View
            key={label}
            style={[styles.stat, index === items.length - 1 && { borderRightWidth: 0 }]}
          >
            <View style={styles.statValue}>
              <Value style={styles.statNumber}>{value}</Value>
              {unit && <Value style={styles.statUnit}>{unit}</Value>}
            </View>
            <Label>{label}</Label>
          </View>
        ))}
      </View>
      {stats.logs.length > 0 && (
        <View style={styles.taskLogList}>
          {visibleLogs.map((gap) => (
            <View key={gap.date} style={styles.taskLogRow}>
              <View style={styles.taskLogDate}>
                <Drop size={10} color={color} />
                <Body style={{ fontFamily: FontFamily.mono, textTransform: 'uppercase' }}>
                  {formatForDisplay(parseISO(gap.date), 'EEE MM.dd.yy')}
                </Body>
                {noteDates.has(gap.date) && (
                  <StickyNote color={Colors.label} size={14} strokeWidth={2.25} />
                )}
              </View>
              <Label style={{ color }}>{`+${gap.gap}d`}</Label>
            </View>
          ))}
          {hasMoreLogs && (
            <Pressable
              hitSlop={8}
              onPress={() => setShowAllLogs((v) => !v)}
              style={styles.taskLogsToggle}
            >
              <Label style={{ color }}>
                {showAllLogs ? 'Show less' : `Show all (${stats.logs.length})`}
              </Label>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
  },
  stat: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xxs,
    paddingLeft: Spacing.xl,
    borderWidth: 2,
    borderLeftWidth: 0,
    borderColor: Colors.border,
    paddingVertical: Spacing.xl,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xxs,
  },
  statNumber: {
    fontSize: FontSize.title,
    lineHeight: FontSize.title,
  },
  statUnit: {
    fontSize: FontSize.md,
  },
  taskLogList: {
    paddingHorizontal: Spacing.xs,
  },
  taskLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  taskLogDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  taskLogsToggle: {
    alignSelf: 'center',
    paddingTop: Spacing.lg,
  },
});
