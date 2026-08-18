import type { InputHTMLAttributes, ReactNode } from 'react';
import './forms.css';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  endAdornment?: ReactNode;
}

export const FormField = ({ label, hint, endAdornment, id, ...props }: FormFieldProps) => {
  const fieldId = id ?? `field-${props.name}`;
  return (
    <div className="cb-field">
      <label htmlFor={fieldId}>{label}</label>
      <div className="cb-field-control">
        <input id={fieldId} {...props} />
        {endAdornment && <span className="cb-field-adornment">{endAdornment}</span>}
      </div>
      {hint && <p className="cb-field-hint">{hint}</p>}
    </div>
  );
};
