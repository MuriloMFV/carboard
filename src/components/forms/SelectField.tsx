import type { ReactNode, SelectHTMLAttributes } from 'react';
import './forms.css';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  labelAction?: ReactNode;
}

export const SelectField = ({ label, options, labelAction, id, ...props }: SelectFieldProps) => {
  const fieldId = id ?? `field-${props.name}`;
  return (
    <div className="cb-field">
      <div className="cb-field-label-row">
        <label htmlFor={fieldId}>{label}</label>
        {labelAction}
      </div>
      <select id={fieldId} {...props}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
};
