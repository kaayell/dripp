import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';
import { Colors } from '@/constants/theme';
import { ActionButton } from '@/components/ui/ActionButton';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';

type ColorPickerModalProps = {
  visible: boolean;
  color: string;
  onSelect: (color: string) => void;
  onClose: () => void;
};

export function ColorPickerModal({ visible, color, onSelect, onClose }: ColorPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <ColorPickerSheet color={color} onSelect={onSelect} onClose={onClose} />
    </Modal>
  );
}

function ColorPickerSheet({ color, onSelect, onClose }: Omit<ColorPickerModalProps, 'visible'>) {
  const [draft, setDraft] = useState(color);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Pressable testID="color-picker-backdrop" style={styles.backdrop} onPress={onClose} />
      <SafeAreaScreen sheet contentStyle={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Custom Color</Text>
          <View style={[styles.preview, { backgroundColor: draft }]} />
        </View>
        <ColorPicker
          value={color}
          onCompleteJS={({ hex }) => setDraft(hex)}
          style={styles.picker}
          thumbSize={24}
          sliderThickness={20}
        >
          <Panel1 style={styles.panel} />
          <HueSlider style={styles.slider} />
        </ColorPicker>
        <ActionButton
          testID="color-picker-done"
          label="Done"
          onPress={() => {
            onSelect(draft);
            onClose();
          }}
        />
      </SafeAreaScreen>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#00000099',
  },
  sheet: {
    flex: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  preview: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  picker: {
    gap: 14,
    marginBottom: 20,
  },
  panel: {
    height: 200,
    borderRadius: 14,
  },
  slider: {
    borderRadius: 10,
  },
});
