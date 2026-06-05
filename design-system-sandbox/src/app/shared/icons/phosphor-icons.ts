export type PhIconWeight = 'regular' | 'light' | 'thin' | 'bold' | 'fill' | 'duotone';

export const ph = (name: string): string => `ph ph-${name}`;

export const phDuotone = (name: string): string => `ph-duotone ph-${name}`;

const WEIGHT_SUFFIX: Partial<Record<PhIconWeight, string>> = {
  light: '-light',
  thin: '-thin',
  bold: '-bold',
  fill: '-fill',
  duotone: '-duotone'
};

export const phIconAssetPath = (name: string, weight: PhIconWeight = 'regular'): string => {
  const suffix = WEIGHT_SUFFIX[weight] || '';
  return `/assets/phosphor/${weight}/${name}${suffix}.svg`;
};
