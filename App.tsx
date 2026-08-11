import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CalendarScreen from './src/CalendarScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <CalendarScreen />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
