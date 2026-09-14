import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { IconButton } from '@/components/ui/IconButton';

export function CloseButton() {
  const router = useRouter();

  return (
    <IconButton onPress={() => router.back()}>
      <X color={Colors.icon} size={20} strokeWidth={2.25} />
    </IconButton>
  );
}
