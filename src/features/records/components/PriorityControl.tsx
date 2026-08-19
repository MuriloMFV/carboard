import { SegmentedControl } from '../../../components/ui';
import type { RecordPriority } from '../types';

interface PriorityControlProps {
  value: RecordPriority;
  onChange: (priority: RecordPriority) => void;
}

export const PriorityControl = ({ value, onChange }: PriorityControlProps) => (
  <div className="cb-labeled-control">
    <span>Prioridade</span>
    <SegmentedControl
      label="Prioridade"
      options={[
        { label: 'Baixa', value: 'low' },
        { label: 'Média', value: 'medium' },
        { label: 'Alta', value: 'high' },
      ]}
      value={value}
      onChange={(next) => onChange(next as RecordPriority)}
    />
    <small>Indica o quanto isso é importante para você resolver.</small>
  </div>
);
