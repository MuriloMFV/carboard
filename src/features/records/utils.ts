export const parseDecimal = (value: string): number | undefined => {
  const normalized = value.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export const parseMileage = (value: string): number | undefined => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return undefined;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const formatDecimalInput = (value: number | undefined, digits = 2): string =>
  value === undefined
    ? ''
    : new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
