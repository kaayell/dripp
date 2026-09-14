import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { IconButton } from '@/components/ui/IconButton';

export function AddTaskButton() {
  const router = useRouter();

  return (
    <IconButton onPress={() => router.push('/add-task')}>
      <Plus color={Colors.icon} size={22} strokeWidth={2.25} />
    </IconButton>
  );
}
