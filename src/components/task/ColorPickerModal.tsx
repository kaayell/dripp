import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';
import { Radius, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { ActionButton } from '@/components/ui/ActionButton';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { Heading } from '@/components/ui/Typography';

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
          <Heading>Custom Color</Heading>
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
    ...CommonStyles.backdrop,
  },
  sheet: {
    flex: 0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  preview: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
  },
  picker: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  panel: {
    height: 200,
    borderRadius: Radius.lg,
  },
  slider: {
    borderRadius: Radius.md,
  },
});
