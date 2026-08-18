import type { InputHTMLAttributes } from 'react';
import { FormField } from './FormField';

type DateFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string };

export const DateField = (props: DateFieldProps) => <FormField type="date" {...props} />;
