import { View } from 'react-native';
import { Colors } from '@/constants/theme';
import { Body } from '@/components/ui/Typography';

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
      <Body style={{ color: Colors.text }}>Loading…</Body>
    </View>
  );
}
