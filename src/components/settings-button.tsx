import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export function SettingsButton() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
      <Settings color={Colors.coral} size={24} strokeWidth={2.25} />
    </Pressable>
  );
}
