export const Colors = {
  background: '#18171b',
  text: '#f2efe9',
  textDim: '#f2efe966',
  textDimmer: '#f2efe940',
  border: '#ffffff14',
  cellBg: '#1e1d21',
  coral: '#ec5b57',
  teal: '#00b7c1',
  tealTint: '#00b7c114',
} as const;

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
