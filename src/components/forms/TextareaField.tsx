import type { TextareaHTMLAttributes } from 'react';
import './forms.css';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextareaField = ({ label, id, ...props }: TextareaFieldProps) => {
  const fieldId = id ?? `field-${props.name}`;
  return (
    <div className="cb-field">
      <label htmlFor={fieldId}>{label}</label>
      <textarea id={fieldId} {...props} />
    </div>
  );
};
