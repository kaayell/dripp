import { StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

const surface = {
  backgroundColor: Colors.cellBg,
  borderRadius: Radius.lg,
  borderWidth: 1,
  borderColor: Colors.border,
} as const;

export const CommonStyles = StyleSheet.create({
  surface,
  circle: {
    borderRadius: Radius.full,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    ...surface,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
    marginTop: -Spacing.lg,
    marginBottom: Spacing.xl,
  },
  backdrop: {
    backgroundColor: Colors.overlay,
  },
});
