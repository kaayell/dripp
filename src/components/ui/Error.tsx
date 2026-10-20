import { View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Hint } from '@/components/ui/Typography';

export default function Error({ message }: { message: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xxl,
      }}
    >
      <Hint style={{ textAlign: 'center' }}>{message}</Hint>
    </View>
  );
}
