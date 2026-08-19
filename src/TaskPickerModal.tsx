import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Task, TrackedDates } from '../db/queries';
import { BACKGROUND, BORDER, CORAL, TEXT, TEXT_DIM } from './theme';

type Props = {
  pickerDate: string | null;
  tasks: Task[];
  trackedDates: TrackedDates;
  bottomInset: number;
  onToggleTask: (taskId: number, dateStr: string) => void;
  onClose: () => void;
};

function formatPickerDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function TaskPickerModal({
  pickerDate,
  tasks,
  trackedDates,
  bottomInset,
  onToggleTask,
  onClose,
}: Props) {
  return (
    <Modal visible={pickerDate != null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={[styles.modalPanel, { paddingBottom: bottomInset + 18 }]}>
          <View style={styles.modalHandle} />

          {pickerDate != null && (
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{formatPickerDate(pickerDate)}</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={styles.modalDoneText}>Done</Text>
              </Pressable>
            </View>
          )}

          {pickerDate != null &&
            tasks.map((task) => {
              const checked = trackedDates[task.id]?.has(pickerDate) ?? false;
              return (
                <Pressable
                  key={task.id}
                  onPress={() => onToggleTask(task.id, pickerDate)}
                  style={[styles.modalTaskRow, checked && { backgroundColor: BORDER }]}
                >
                  <View style={styles.modalTaskLabelRow}>
                    <View style={[styles.modalDot, { backgroundColor: task.color }]} />
                    <Text style={[styles.modalTaskLabel, checked && styles.modalTaskLabelActive]}>
                      {task.name}
                    </Text>
                  </View>
                  {checked && <Text style={[styles.modalCheckmark, { color: task.color }]}>✓</Text>}
                </Pressable>
              );
            })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  modalDoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: CORAL,
  },
  modalTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BACKGROUND,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  modalTaskLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalTaskLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_DIM,
  },
  modalTaskLabelActive: {
    fontWeight: '700',
    color: TEXT,
  },
  modalCheckmark: {
    fontSize: 15,
    fontWeight: '700',
  },
});
