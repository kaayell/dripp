import { Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

export default function Loading() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: Colors.text }}>Loading…</Text>
    </View>
  );
}
