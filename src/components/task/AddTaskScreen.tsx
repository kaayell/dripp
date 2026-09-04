import { createTask } from '../../../db/queries';
import TaskScreen, { TaskFormValues } from '@/components/task/TaskScreen';

export default function AddTaskScreen() {
  const handleSubmit = async (values: TaskFormValues) => {
    await createTask(values);
  };

  return (
    <TaskScreen
      title="New Task"
      onSubmit={handleSubmit}
      newCategoryReturnTo={{ pathname: '/add-task' }}
    />
  );
}
