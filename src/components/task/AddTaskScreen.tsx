import { createTask } from '../../../db/queries';
import TaskFormScreen, { TaskFormValues } from '@/components/task/TaskFormScreen';

export default function AddTaskScreen() {
  const handleSubmit = async (values: TaskFormValues) => {
    return await createTask(values);
  };

  return (
    <TaskFormScreen
      title="New Task"
      onSubmit={handleSubmit}
      newCategoryReturnTo={{ pathname: '/task/add' }}
    />
  );
}
