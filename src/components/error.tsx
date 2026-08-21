import { Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

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
        padding: 20,
      }}
    >
      <Text style={{ color: Colors.coral, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
