import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import type { Task } from '../../../db/queries';
import { loadTask, updateTask } from '../../../db/queries';
import Loading from '@/components/ui/Loading';
import TaskFormScreen, { TaskFormValues } from '@/components/task/TaskFormScreen';

export default function EditTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTask(Number(taskId))
      .then((loadedTask) => {
        if (!loadedTask) {
          router.back();
          return;
        }
        setTask(loadedTask);
      })
      .catch((e) => console.error('[EditTaskScreen] load task failed', e))
      .finally(() => setLoaded(true));
  }, [taskId]);

  if (!loaded || !task) {
    return <Loading />;
  }

  const handleSubmit = async (values: TaskFormValues) => {
    await updateTask(task.id, values);
  };

  return (
    <TaskFormScreen
      title="Edit Task"
      task={task}
      onSubmit={handleSubmit}
      newCategoryReturnTo={{ pathname: '/edit-task', taskId: task.id }}
    />
  );
}
