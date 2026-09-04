import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Category, Task } from '../../../db/queries';
import { loadCategories, loadTasks } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import Loading from '@/components/ui/Loading';
import Drop from '@/components/ui/Drop';
import { router, useFocusEffect } from 'expo-router';

export default function TaskManagementScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [loadedCategories, loadedTasks] = await Promise.all([loadCategories(), loadTasks()]);
    setCategories(loadedCategories);
    setTasks(loadedTasks);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh()
        .catch((e) => console.error('[TaskManagementScreen] load failed', e))
        .finally(() => setLoaded(true));
    }, [refresh]),
  );

  const categoryName = useCallback(
    (categoryId: number | null) => categories.find((c) => c.id === categoryId)?.name ?? 'none',
    [categories],
  );

  if (!loaded) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              style={styles.row}
              onPress={() =>
                router.push({ pathname: '/edit-task', params: { taskId: String(task.id) } })
              }
            >
              <View style={styles.taskLabelRow}>
                <Drop size={10} color={task.color} />
                <Text style={styles.rowLabel}>{task.name}</Text>
                <Text style={styles.rowSubLabel}>{categoryName(task.categoryId)}</Text>
              </View>
            </Pressable>
          ))}
        </>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cellBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  taskLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rowSubLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDim,
    marginTop: 2,
  },
});
