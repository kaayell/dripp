import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export function CloseButton() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()} hitSlop={8}>
      <X color={Colors.coral} size={22} strokeWidth={2.25} />
    </Pressable>
  );
}
