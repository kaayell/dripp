import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Task, TrackedDates } from '../db/queries';
import { BACKGROUND, BORDER, CELL_BG, CELL_BORDER, TEXT } from './theme';

type Props = {
  pickerDate: string | null;
  tasks: Task[];
  trackedDates: TrackedDates;
  bottomInset: number;
  onToggleTask: (taskId: number, dateStr: string) => void;
  onClose: () => void;
};

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
          {pickerDate != null &&
            tasks.map((task) => {
              const checked = trackedDates[task.id]?.has(pickerDate) ?? false;
              return (
                <Pressable
                  key={task.id}
                  onPress={() => onToggleTask(task.id, pickerDate)}
                  style={styles.modalTaskRow}
                >
                  <View
                    style={[
                      styles.modalCheckbox,
                      { borderColor: task.color },
                      checked && { backgroundColor: task.color },
                    ]}
                  >
                    {checked && <Text style={styles.modalCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.modalTaskLabel}>{task.name}</Text>
                </Pressable>
              );
            })}
          <Pressable style={styles.modalDoneButton} onPress={onClose}>
            <Text style={styles.modalDoneText}>Done</Text>
          </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: CELL_BORDER,
    marginBottom: 12,
  },
  modalTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  modalCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCheckmark: {
    fontSize: 13,
    fontWeight: '700',
    color: BACKGROUND,
  },
  modalTaskLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
  },
  modalDoneButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: CELL_BG,
    borderWidth: 1,
    borderColor: CELL_BORDER,
  },
  modalDoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT,
  },
});
