import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export function AddTaskButton() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/add-task')} hitSlop={8}>
      <Plus color={Colors.coral} size={24} strokeWidth={2.25} />
    </Pressable>
  );
}
