import { createTask } from '../../../db/queries';
import TaskFormScreen, { TaskFormValues } from '@/components/task/TaskFormScreen';

export default function AddTaskScreen() {
  const handleSubmit = async (values: TaskFormValues) => {
    await createTask(values);
  };

  return (
    <TaskFormScreen
      title="New Task"
      onSubmit={handleSubmit}
      newCategoryReturnTo={{ pathname: '/add-task' }}
    />
  );
}
