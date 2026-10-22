import {
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, type Typeface } from '@/constants/theme';

function StyledText({
  base,
  typeface = 'sans',
  style,
  ...props
}: TextProps & { base: StyleProp<TextStyle>; typeface?: Typeface }) {
  return <Text {...props} style={[{ fontFamily: FontFamily[typeface] }, base, style]} />;
}

export function Title(props: TextProps) {
  return <StyledText base={styles.title} {...props} />;
}

export function Heading(props: TextProps) {
  return <StyledText base={styles.heading} {...props} />;
}

export function Label(props: TextProps) {
  return <StyledText base={styles.label} typeface="mono" {...props} />;
}

export function Subtitle(props: TextProps) {
  return <StyledText base={styles.subtitle} {...props} />;
}

export function Value(props: TextProps) {
  return <StyledText base={styles.value} typeface="mono" {...props} />;
}

export function ItemTitle(props: TextProps) {
  return <StyledText base={styles.itemTitle} {...props} />;
}

export function SectionTitle(props: TextProps) {
  return <StyledText base={styles.sectionTitle} typeface="mono" {...props} />;
}

export function Caption(props: TextProps) {
  return <StyledText base={styles.caption} typeface="mono" {...props} />;
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

export function DayNumber(props: TextProps) {
  return <StyledText base={styles.dayNumber} typeface="mono" {...props} />;
}

export function Body(props: TextProps) {
  return <StyledText base={styles.body} {...props} />;
}

export function Input({ style, ...props }: TextInputProps) {
  return <TextInput {...props} style={[{ fontFamily: FontFamily.sans }, style]} />;
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
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textTransform: 'uppercase',
  },
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
  dayNumber: { fontSize: FontSize.md, color: Colors.text },
  body: { fontSize: FontSize.base, color: Colors.text },
});
