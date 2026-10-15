import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Bell, ChevronDown, Clock, Minus, Plus } from 'lucide-react-native';
import type { ReminderInputValues } from '../../../db/queries';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { IconButton } from '@/components/ui/IconButton';
import {
  DateFrequency,
  DAYS_OF_MONTH,
  formatDisplayTime,
  formatForDisplay,
  formatShortDate,
  formatTime,
  parseTime,
  WEEKDAY_NAMES,
} from '@/constants/dates';
import { computeNextReminder } from '@/notifications/reminderDates';

function ordinal(dayOfMonth: number): string {
  return formatForDisplay(new Date(2000, 0, dayOfMonth), 'do');
}

function formatWeekdayName(name: string): string {
  return `${name.charAt(0)}${name.slice(1).toLowerCase()}`;
}

function frequencyUnit(mode: DateFrequency): string {
  return mode === DateFrequency.DAILY ? 'day' : mode === DateFrequency.WEEKLY ? 'week' : 'month';
}

export function summarizeReminder(
  mode: DateFrequency,
  interval: number,
  time: string,
  dayOfWeek: number,
  dayOfMonth: number,
): string {
  const unit = frequencyUnit(mode);
  const every = interval === 1 ? `Every ${unit}` : `Every ${interval} ${unit}s`;
  if (mode === DateFrequency.DAILY) return `${every} at ${time}`;
  if (mode === DateFrequency.WEEKLY)
    return `${every} on ${formatWeekdayName(WEEKDAY_NAMES[dayOfWeek])} at ${time}`;
  return `${every} on the ${ordinal(dayOfMonth)} at ${time}`;
}

type ReminderFieldProps = {
  value: ReminderInputValues | null;
  onChange: (value: ReminderInputValues | null) => void;
};

export function TaskReminder({ value, onChange }: ReminderFieldProps) {
  const now = new Date();
  const [reminderTime, setReminderTime] = useState(parseTime(value?.time ?? '09:00'));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDayOfMonthPicker, setShowDayOfMonthPicker] = useState(false);
  const [frequencyMode, setFrequencyMode] = useState<DateFrequency>(
    (value?.type as DateFrequency) ?? DateFrequency.DAILY,
  );
  const [interval, setInterval] = useState(value?.interval ?? 1);
  const [dayOfWeek, setDayOfWeek] = useState(value?.dayOfWeek ?? now.getDay());
  const [dayOfMonth, setDayOfMonth] = useState(value?.dayOfMonth ?? now.getDate());

  useEffect(() => {
    onChange({
      time: formatTime(reminderTime),
      type: frequencyMode,
      interval,
      dayOfWeek: frequencyMode === DateFrequency.WEEKLY ? dayOfWeek : null,
      dayOfMonth: frequencyMode === DateFrequency.MONTHLY ? dayOfMonth : null,
    });
  }, [reminderTime, frequencyMode, interval, dayOfWeek, dayOfMonth, onChange]);

  return (
    <>
      <View style={styles.segmentedControl}>
        {Object.values(DateFrequency).map((mode) => (
          <Pressable
            key={mode}
            style={[styles.segment, frequencyMode === mode && styles.segmentActive]}
            onPress={() => setFrequencyMode(mode)}
          >
            <Text style={[styles.segmentText, frequencyMode === mode && styles.segmentTextActive]}>
              {mode[0].toUpperCase() + mode.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.reminderFieldsRow}>
        <Pressable style={styles.reminderTimeButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.reminderTimeText}>{formatDisplayTime(reminderTime)}</Text>
          <Clock size={16} color={Colors.label} />
        </Pressable>

        <View style={styles.stepper}>
          <IconButton
            onPress={() => {
              setInterval((i) => Math.max(1, i - 1));
            }}
            icon={<Minus size={16} color={Colors.text} />}
          />

          <Text style={styles.stepperValue}>
            {interval === 1
              ? `every ${frequencyUnit(frequencyMode)}`
              : `every ${interval} ${frequencyUnit(frequencyMode)}s`}
          </Text>
          <IconButton
            onPress={() => {
              setInterval((i) => i + 1);
            }}
            icon={<Plus size={16} color={Colors.text} />}
          />
        </View>
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="spinner"
            onValueChange={(_, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) setReminderTime(selectedDate);
            }}
            onDismiss={() => {
              setShowTimePicker(false);
            }}
            onNeutralButtonPress={() => {
              setShowTimePicker(false);
            }}
          />
        )}
      </View>

      {frequencyMode === DateFrequency.WEEKLY && (
        <>
          <Text style={styles.sectionLabel}>Repeat on</Text>
          <View style={styles.weekdayRow}>
            {WEEKDAY_NAMES.map((value, index) => {
              const active = dayOfWeek === index;
              return (
                <Pressable
                  key={index}
                  style={[styles.weekdayCircle, active && styles.weekdayCircleActive]}
                  onPress={() => setDayOfWeek(index)}
                >
                  <Text style={[styles.weekdayText, active && styles.weekdayTextActive]}>
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {frequencyMode === DateFrequency.MONTHLY && (
        <>
          <Text style={styles.sectionLabel}>Repeat on</Text>
          <Pressable
            style={styles.reminderTimeButton}
            onPress={() => setShowDayOfMonthPicker(true)}
          >
            <Text style={styles.reminderTimeText}>the {ordinal(dayOfMonth)}</Text>
            <ChevronDown size={16} color={Colors.label} />
          </Pressable>
          <Modal
            visible={showDayOfMonthPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDayOfMonthPicker(false)}
          >
            <Pressable style={styles.modalBackdrop} onPress={() => setShowDayOfMonthPicker(false)}>
              <Pressable style={styles.dayOfMonthDropdown} onPress={() => {}}>
                <ScrollView>
                  {DAYS_OF_MONTH.map((day) => {
                    const active = dayOfMonth === day;
                    return (
                      <Pressable
                        key={day}
                        style={[styles.dayOfMonthOption, active && styles.dayOfMonthOptionActive]}
                        onPress={() => {
                          setDayOfMonth(day);
                          setShowDayOfMonthPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dayOfMonthOptionText,
                            active && styles.dayOfMonthOptionTextActive,
                          ]}
                        >
                          {ordinal(day)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}

      <View style={styles.summaryCard}>
        <Bell size={18} color={Colors.teal} />
        <View style={styles.summaryTextGroup}>
          <Text style={styles.summaryTitle}>
            {summarizeReminder(
              frequencyMode,
              interval,
              formatDisplayTime(reminderTime),
              dayOfWeek,
              dayOfMonth,
            )}
          </Text>
          <Text style={styles.summarySubtitle}>
            Next:{' '}
            {formatShortDate(
              computeNextReminder(reminderTime, {
                type: frequencyMode,
                interval,
                dayOfWeek,
                dayOfMonth,
              }),
            )}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.label,
    textTransform: 'uppercase',
    marginBottom: Spacing.base,
    marginLeft: Spacing.xs,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  reminderFieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  reminderTimeButton: {
    ...CommonStyles.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xxl,
  },
  reminderTimeText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  stepperValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  segmentedControl: {
    ...CommonStyles.surface,
    flexDirection: 'row',
    padding: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.text,
  },
  segmentText: {
    fontWeight: FontWeight.semibold,
    color: Colors.label,
    fontSize: FontSize.base,
  },
  segmentTextActive: {
    color: Colors.background,
    fontWeight: FontWeight.bold,
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: Spacing.xxl,
  },
  weekdayCircle: {
    ...CommonStyles.circle,
    width: 50,
    height: 50,
  },
  weekdayCircleActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  weekdayText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.label,
  },
  weekdayTextActive: {
    color: Colors.background,
  },
  modalBackdrop: {
    ...CommonStyles.backdrop,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOfMonthDropdown: {
    ...CommonStyles.surface,
    width: 220,
    maxHeight: 320,
    overflow: 'hidden',
  },
  dayOfMonthOption: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
  dayOfMonthOptionActive: {
    backgroundColor: Colors.tealTint,
  },
  dayOfMonthOptionText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  dayOfMonthOptionTextActive: {
    color: Colors.teal,
  },
  summaryCard: {
    ...CommonStyles.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  summarySubtitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.label,
    marginTop: Spacing.xs,
  },
});
