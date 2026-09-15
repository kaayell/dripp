import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Task, toggleTaskLog } from '../../../db/queries';
import { Colors, dimmed } from '@/constants/theme';
import Drop from '@/components/ui/Drop';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  tasks: Task[];
  onToggle?: () => void;
};

export default function CalendarLegend({ tasks, onToggle }: Props) {
  const toggleTask = useCallback(
    (taskId: number) => {
      const today = new Date().toLocaleDateString('sv');

      toggleTaskLog(taskId, today)
        .then(() => onToggle?.())
        .catch(() => {});
    },
    [onToggle],
  );

  if (tasks.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.legendRow}
      contentContainerStyle={styles.legendRowContent}
    >
      {tasks.map((task) => (
        <AnimatedLabel key={task.id} task={task} onToggle={toggleTask} />
      ))}
    </ScrollView>
  );
}

function AnimatedLabel({ task, onToggle }: { task: Task; onToggle: (taskId: number) => void }) {
  const pressAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressAnim.value }],
    opacity: pressAnim.value ** 4,
  }));

  const onPressIn = () => {
    pressAnim.value = withSpring(0.9);
  };

  const onPressOut = () => {
    pressAnim.value = withSpring(1);
  };

  const onLongPress = () => {
    pressAnim.value = withSequence(
      withTiming(1.15, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );
    onToggle(task.id);
  };

  return (
    <Pressable
      key={task.id}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => router.push({ pathname: '/task-detail', params: { taskId: String(task.id) } })}
      onLongPress={onLongPress}
    >
      <Animated.View
        style={[styles.legendItem, { borderColor: dimmed(task.color, 40) }, animatedStyle]}
      >
        <Drop color={task.color} size={10} />
        <Text style={styles.legendLabel}>{task.name}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexGrow: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendRowContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.label,
  },
});
