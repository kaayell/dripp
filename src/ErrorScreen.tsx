import { Text, View } from 'react-native';
import { BACKGROUND, CORAL } from './theme';

type Props = {
  message: string;
};

export default function ErrorScreen({ message }: Props) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BACKGROUND,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Text style={{ color: CORAL, textAlign: 'center' }}>
        Database migration failed: {message}
      </Text>
    </View>
  );
}
