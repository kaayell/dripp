import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ClockAlert } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export function OverdueTaskButton() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/overdue-tasks')} hitSlop={8}>
      <ClockAlert color={Colors.coral} size={24} strokeWidth={2.25} />
    </Pressable>
  );
}
