import { CheckCircle2, CircleHelp, CircleSlash2, Circle, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface SelectionCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  icon?: 'good' | 'mid' | 'danger' | 'unknown';
  stacked?: boolean;
}

const optionIcons: Record<NonNullable<SelectionCardProps['icon']>, ReactNode> = {
  good: <CheckCircle2 size={20} aria-hidden="true" />,
  mid: <CircleSlash2 size={20} aria-hidden="true" />,
  danger: <TriangleAlert size={20} aria-hidden="true" />,
  unknown: <CircleHelp size={20} aria-hidden="true" />,
};

export const SelectionCard = ({ label, selected, onSelect, icon, stacked = false }: SelectionCardProps) => (
  <button
    className={`cb-selection-card${selected ? ' is-selected' : ''}${stacked ? ' is-stacked' : ''}${icon === 'danger' ? ' is-danger' : ''}`}
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
  >
    {icon && <span className="cb-selection-card__icon">{optionIcons[icon]}</span>}
    <span className="cb-selection-card__label">{label}</span>
    <span className="cb-selection-card__radio" aria-hidden="true">
      {selected ? <CheckCircle2 size={21} /> : <Circle size={21} />}
    </span>
  </button>
);
