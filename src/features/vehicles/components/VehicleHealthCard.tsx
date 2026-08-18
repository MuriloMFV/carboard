import { Info } from 'lucide-react';
import { Card } from '../../../components/ui';
import type { VehicleHealthSummary } from '../types';

export const VehicleHealthCard = ({ summary }: { summary: VehicleHealthSummary }) => (
  <Card className="cb-health-card">
    <div className="cb-section-eyebrow">Saúde do veículo <Info size={14} aria-hidden="true" /></div>
    <div className="cb-health-card__summary">
      <div><strong>{summary.percentage}<small>%</small></strong> <span>{summary.label}</span></div>
      <p><span>{summary.goodCount} itens OK</span><i aria-hidden="true" /> <em>{summary.attentionCount} em atenção</em></p>
    </div>
    <div className="cb-health-progress" role="progressbar" aria-label={`Saúde geral: ${summary.percentage}%`} aria-valuenow={summary.percentage} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${summary.percentage}%` }} />
    </div>
  </Card>
);
