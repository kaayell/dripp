import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { loadTaskLog, loadTaskNote, saveTaskNote, toggleTaskLog } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import { formatShortDate } from '@/constants/dates';
import { FormSheet } from '@/components/ui/FormSheet';
import { ActionButton } from '@/components/ui/ActionButton';

export default function TaskNoteScreen() {
  const params = useLocalSearchParams<{ taskId: string; date: string; color: string }>();
  const taskId = Number(params.taskId);
  const date = params.date;
  const color = params.color ?? Colors.teal;
  const [done, setDone] = useState(true);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([loadTaskLog(taskId, date), loadTaskNote(taskId, date)])
      .then(([log, taskNote]) => {
        setDone(!!log);
        if (taskNote) {
          setNote(taskNote.note);
        }
      })
      .catch(() => {});
  }, [taskId, date]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveTaskNote(taskId, date, note.trim());
      router.back();
    } catch {
      setSaving(false);
    }
  }, [done, taskId, date, note]);

  const toggleTask = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    toggleTaskLog(taskId, date)
      .then((created) => {
        setDone(!!created);
      })
      .catch(() => {});
  }, [taskId, date]);

  return (
    <FormSheet>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{formatShortDate(parseISO(date))}</Text>
        <Pressable
          onPress={toggleTask}
          hitSlop={12}
          style={[styles.checkbox, { borderColor: color }, done && { backgroundColor: color }]}
        >
          {done && <Check color={Colors.background} size={20} strokeWidth={3} />}
        </Pressable>
      </View>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="gotta note..."
        placeholderTextColor={Colors.label}
        style={styles.input}
        multiline
      />
      <ActionButton label="Save" onPress={handleSave} disabled={saving} />
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
});
