import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SquarePen } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export function EditTaskButton({ taskId }: { taskId: number }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/edit-task', params: { taskId: String(taskId) } })}
      hitSlop={8}
    >
      <SquarePen color={Colors.coral} size={20} strokeWidth={2.25} />
    </Pressable>
  );
}
