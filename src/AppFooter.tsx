import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER } from './theme';

export default function AppFooter() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        height: 56 + insets.bottom,
        paddingBottom: insets.bottom,
        borderTopWidth: 1,
        borderTopColor: BORDER,
      }}
    />
  );
}
