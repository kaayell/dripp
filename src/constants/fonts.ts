import { StyleSheet, type TextStyle, type StyleProp } from 'react-native';
import { fontFamilyFor } from '@/constants/theme';

export function withFontFamily<S extends StyleProp<TextStyle>>(style: S) {
  const fontFamily = fontFamilyFor(StyleSheet.flatten(style)?.fontWeight);
  return fontFamily ? [{ fontFamily }, style] : style;
}
