import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { loadTaskLog, loadTaskNote, saveTaskNote, toggleTaskLog } from '../../../db/queries';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { formatShortDate } from '@/constants/dates';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { ActionButton } from '@/components/ui/ActionButton';
import { TextField } from '@/components/ui/TextField';

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
    <SafeAreaScreen sheet>
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
      <TextField
        value={note}
        onChangeText={setNote}
        placeholder="gotta note..."
        style={styles.input}
        multiline
      />
      <ActionButton label="Save" onPress={handleSave} disabled={saving} />
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
