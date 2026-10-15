export const Colors = {
  background: '#18171b',
  text: '#f2efe9',
  icon: '#f2efe9B3',
  label: '#f2efe966',
  disabled: '#f2efe940',
  border: '#ffffff14',
  cellBg: '#1e1d21',
  teal: '#00b7c1',
  tealTint: '#00b7c114',
  error: '#e05c5c',
  overlay: '#00000099',
} as const;

export const TaskSwatchColors: readonly string[] = [
  '#d9435a',
  '#ec5b57',
  '#e18b60',
  '#daa932',
  '#e1d660',
  '#bce160',
  '#8be160',
  '#60e165',
  '#5ec386',
  '#50bfbe',
  '#00b7c1',
  '#64a1ee',
  '#606be1',
  '#b386e4',
  '#e160e1',
  '#da85b6',
  '#dc7492',
];

export const ColorOpacityAlphas = {
  // X% opacity -> alpha code
  5: '0D',
  10: '1A',
  15: '26',
  20: '33',
  25: '40',
  30: '4D',
  40: '66',
  50: '80',
  60: '99',
  70: 'B3',
  75: 'BF',
  80: 'CC',
  90: 'E6',
  95: 'F2',
} as const;

export type OpacityPercent = keyof typeof ColorOpacityAlphas;

export function dimmed(color: string, opacity: OpacityPercent = 50): string {
  return `${color}${ColorOpacityAlphas[opacity]}`;
}

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 8,
  base: 10,
  lg: 12,
  xl: 14,
  xxl: 18,
} as const;

export const Radius = {
  sm: 2,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const FontSize = {
  xs: 9,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  xxl: 20,
  title: 24,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;
