import { ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, formatMileage } from '../../../utils/formatters';
import type { MaintenanceHistoryRecord } from '../types';

interface MaintenanceHistoryRowProps {
  record: MaintenanceHistoryRecord;
  detailed?: boolean;
}

export const MaintenanceHistoryRow = ({ record, detailed = false }: MaintenanceHistoryRowProps) => (
  <div className={`cb-maintenance-history-row${detailed ? ' is-detailed' : ''}`}>
    {detailed ? (
      <>
        <div>
          <strong>{record.title}</strong>
          <p>{formatDate(record.date)} · {formatMileage(record.mileage)} km · {formatCurrency(record.cost)}</p>
          {record.productSummary && <p>{record.productSummary}</p>}
          {record.workshop && <p>{record.workshop}</p>}
        </div>
        <ChevronRight size={19} aria-hidden="true" />
      </>
    ) : (
      <>
        <div>
          <small>{formatDate(record.date)}</small>
          <strong>{record.title}</strong>
        </div>
        <div className="cb-maintenance-history-row__values">
          <strong>{formatMileage(record.mileage)} km</strong>
          <span>{formatCurrency(record.cost)}</span>
        </div>
      </>
    )}
  </div>
);
