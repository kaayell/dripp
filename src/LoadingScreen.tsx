import { Text, View } from 'react-native';
import { BACKGROUND, TEXT } from './theme';

export default function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BACKGROUND,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: TEXT }}>Loading…</Text>
    </View>
  );
}
