import type { InputHTMLAttributes } from 'react';
import { FormField } from './FormField';

type MileageFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'> & { label?: string };

export const MileageField = ({ label = 'Quilometragem', ...props }: MileageFieldProps) => (
  <FormField label={label} type="text" inputMode="numeric" pattern="[0-9.]*" {...props} />
);
