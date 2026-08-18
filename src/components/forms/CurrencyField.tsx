import type { InputHTMLAttributes } from 'react';
import { FormField } from './FormField';

type CurrencyFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'> & { label: string };

export const CurrencyField = (props: CurrencyFieldProps) => (
  <FormField type="number" inputMode="decimal" min="0" step="0.01" {...props} />
);
