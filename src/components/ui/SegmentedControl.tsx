import './ui.css';

interface SegmentOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedControl = ({ label, options, value, onChange }: SegmentedControlProps) => (
  <div className="cb-segmented-control" role="group" aria-label={label}>
    {options.map((option) => (
      <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
        {option.label}
      </button>
    ))}
  </div>
);
