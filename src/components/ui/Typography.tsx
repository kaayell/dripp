import {
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { withFontFamily } from '@/constants/fonts';

function StyledText({ base, style, ...props }: TextProps & { base: StyleProp<TextStyle> }) {
  return <Text {...props} style={withFontFamily([base, style])} />;
}

export function Title(props: TextProps) {
  return <StyledText base={styles.title} {...props} />;
}

export function Heading(props: TextProps) {
  return <StyledText base={styles.heading} {...props} />;
}

export function Label(props: TextProps) {
  return <StyledText base={styles.label} {...props} />;
}

export function Subtitle(props: TextProps) {
  return <StyledText base={styles.subtitle} {...props} />;
}

export function Value(props: TextProps) {
  return <StyledText base={styles.value} {...props} />;
}

export function ItemTitle(props: TextProps) {
  return <StyledText base={styles.itemTitle} {...props} />;
}

export function Caption(props: TextProps) {
  return <StyledText base={styles.caption} {...props} />;
}

export function ChipText(props: TextProps) {
  return <StyledText base={styles.chipText} {...props} />;
}

export function Hint(props: TextProps) {
  return <StyledText base={styles.hint} {...props} />;
}

export function ErrorText(props: TextProps) {
  return <StyledText base={styles.errorText} {...props} />;
}

export function ButtonText(props: TextProps) {
  return <StyledText base={styles.buttonText} {...props} />;
}

export function Body(props: TextProps) {
  return <StyledText base={styles.body} {...props} />;
}

export function Input({ style, ...props }: TextInputProps) {
  return <TextInput {...props} style={withFontFamily(style)} />;
}

const styles = StyleSheet.create({
  title: { fontSize: FontSize.title, fontWeight: FontWeight.bold, color: Colors.text },
  heading: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.label,
    textTransform: 'uppercase',
    letterSpacing: 0.75,
  },
  subtitle: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.icon },
  value: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  itemTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.text },
  caption: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.label },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.label,
    textTransform: 'lowercase',
  },
  hint: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.label },
  errorText: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.error },
  buttonText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  body: { fontSize: FontSize.base, color: Colors.text },
});
