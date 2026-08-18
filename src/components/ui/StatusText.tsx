import type { ComponentStatus } from '../../types';
import { componentStatusLabels } from '../../features/vehicles/status';
import './ui.css';

export const StatusText = ({ status }: { status: ComponentStatus }) => (
  <span className={`cb-status cb-status--${status}`}>{componentStatusLabels[status]}</span>
);
