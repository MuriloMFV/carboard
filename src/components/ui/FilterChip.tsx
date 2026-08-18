import type { ButtonHTMLAttributes } from 'react';
import './ui.css';

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const FilterChip = ({ selected = false, children, ...props }: FilterChipProps) => (
  <button className="cb-filter-chip" type="button" aria-pressed={selected} {...props}>{children}</button>
);
