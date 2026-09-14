import { useRouter } from 'expo-router';
import { ClockAlert } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { IconButton } from '@/components/ui/IconButton';

export function OverdueTaskButton() {
  const router = useRouter();

  return (
    <IconButton onPress={() => router.push('/overdue-tasks')}>
      <ClockAlert color={Colors.icon} size={20} strokeWidth={2.25} />
    </IconButton>
  );
}
