import { Text, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  message: string;
};

export default function Error({ message }: Props) {
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
      <Text style={{ color: Colors.label, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
