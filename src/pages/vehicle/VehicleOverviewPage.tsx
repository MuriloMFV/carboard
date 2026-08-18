import { Plus, TriangleAlert } from 'lucide-react';
import { Card } from '../../components/ui';
import { AttentionItemRow } from '../../features/vehicles/components/AttentionItemRow';
import { SystemSummaryRow } from '../../features/vehicles/components/SystemSummaryRow';
import { VehicleHealthCard } from '../../features/vehicles/components/VehicleHealthCard';
import { VehicleMainShell } from '../../features/vehicles/components/VehicleMainShell';
import { mockAttentionItems, mockVehicleHealth, mockVehicleSystems } from '../../features/vehicles/mocks';

export const VehicleOverviewPage = () => (
  <VehicleMainShell>
    <div className="cb-vehicle-screen cb-vehicle-overview">
      <VehicleHealthCard summary={mockVehicleHealth} />

      <Card className="cb-list-card cb-attention-card">
        <header className="cb-list-card__header cb-list-card__header--attention">
          <TriangleAlert size={17} aria-hidden="true" />
          Precisam de atenção
        </header>
        {mockAttentionItems.map((item) => <AttentionItemRow key={item.id} item={item} />)}
      </Card>

      <Card className="cb-list-card cb-systems-card">
        <header className="cb-list-card__header">Sistemas do veículo</header>
        {mockVehicleSystems.map((system) => <SystemSummaryRow key={system.id} system={system} />)}
        <button className="cb-add-component-link" type="button" aria-disabled="true">
          <Plus size={18} aria-hidden="true" /> Adicionar componente
        </button>
      </Card>
    </div>
  </VehicleMainShell>
);
