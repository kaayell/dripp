import { useRouter } from 'expo-router';
import { SquarePen } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { IconButton } from '@/components/ui/IconButton';

export function EditTaskButton({ taskId }: { taskId: number }) {
  const router = useRouter();

  return (
    <IconButton
      onPress={() => router.push({ pathname: '/edit-task', params: { taskId: String(taskId) } })}
    >
      <SquarePen color={Colors.textDim} size={18} strokeWidth={2.25} />
    </IconButton>
  );
}
