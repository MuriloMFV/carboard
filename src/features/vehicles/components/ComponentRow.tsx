import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusText } from '../../../components/ui';
import type { VehicleComponent } from '../types';
import { VehicleIcon } from './VehicleIcon';

interface ComponentRowProps {
  component: VehicleComponent;
  compact?: boolean;
}

export const ComponentRow = ({ component, compact = false }: ComponentRowProps) => (
  <Link className={`cb-component-row${compact ? ' cb-component-row--compact' : ''}`} to={`/vehicle/component/${component.id}`}>
    <span className="cb-round-icon"><VehicleIcon name={component.icon} /></span>
    <span className="cb-component-row__copy">
      <strong>{component.name}</strong>
      <small>{component.summary}{' '}<i aria-hidden="true" />{' '}<StatusText status={component.status} /></small>
    </span>
    <ChevronRight size={19} aria-hidden="true" />
  </Link>
);
