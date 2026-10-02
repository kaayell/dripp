import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Bell, ChevronDown, Clock, Minus, Plus } from 'lucide-react-native';
import { format } from 'date-fns';
import type { ReminderInputValues } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import { IconButton } from '@/components/ui/IconButton';
import {
  DateFrequency,
  DAYS_OF_MONTH,
  formatDisplayTime,
  formatShortDate,
  formatTime,
  parseTime,
  WEEKDAY_NAMES,
} from '@/constants/dates';
import { computeNextReminder } from '@/notifications/reminderDates';

function ordinal(dayOfMonth: number): string {
  return format(new Date(2000, 0, dayOfMonth), 'do');
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
    fontSize: 12,
    fontWeight: '700',
    color: Colors.label,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 2,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reminderFieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  reminderTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.cellBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  reminderTimeText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.cellBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.text,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.label,
  },
  segmentTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 20,
  },
  weekdayCircle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayCircleActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.label,
  },
  weekdayTextActive: {
    color: Colors.background,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOfMonthDropdown: {
    width: 220,
    maxHeight: 320,
    backgroundColor: Colors.cellBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dayOfMonthOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dayOfMonthOptionActive: {
    backgroundColor: Colors.tealTint,
  },
  dayOfMonthOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  dayOfMonthOptionTextActive: {
    color: Colors.teal,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cellBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 20,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  summarySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.label,
    marginTop: 2,
  },
});
