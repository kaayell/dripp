import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { IconButton } from '@/components/ui/IconButton';

export function CloseButton() {
  return (
    <IconButton
      testID="close-button"
      onPress={() => router.back()}
      icon={<X color={Colors.icon} size={20} strokeWidth={2.25} />}
    />
  );
}
