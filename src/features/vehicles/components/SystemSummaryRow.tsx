import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { VehicleSystem } from '../types';
import { VehicleIcon } from './VehicleIcon';

const SystemSummary = ({ system }: { system: VehicleSystem }) => {
  if (system.criticalCount > 0) {
    return <>{system.goodCount} OK <i aria-hidden="true" /> <b>{system.criticalCount} crítico</b></>;
  }
  if (system.attentionCount > 0) {
    return <>{system.goodCount} OK <i aria-hidden="true" /> <em>{system.attentionCount} em atenção</em></>;
  }
  if (system.componentCount === 0 || system.noDataCount === system.componentCount) {
    return <>{system.componentCount} componentes <i aria-hidden="true" /> <span>Sem dados</span></>;
  }
  return <>{system.componentCount} componentes <i aria-hidden="true" /> <span>Bom</span></>;
};

export const SystemSummaryRow = ({ system }: { system: VehicleSystem }) => (
  <Link className="cb-system-row" to={`/vehicle/system/${system.id}`}>
    <span className="cb-system-row__icon"><VehicleIcon name={system.icon} /></span>
    <span className="cb-system-row__copy">
      <strong>{system.name}</strong>
      <small><SystemSummary system={system} /></small>
    </span>
    <ChevronRight size={19} aria-hidden="true" />
  </Link>
);
