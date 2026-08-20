import { Plus, TriangleAlert } from 'lucide-react';
import { useAppShell } from '../../components/layout/AppShellContext';
import { Card } from '../../components/ui';
import { AttentionItemRow } from '../../features/vehicles/components/AttentionItemRow';
import { SystemSummaryRow } from '../../features/vehicles/components/SystemSummaryRow';
import { VehicleDataState } from '../../features/vehicles/components/VehicleDataState';
import { VehicleHealthCard } from '../../features/vehicles/components/VehicleHealthCard';
import { VehicleMainShell } from '../../features/vehicles/components/VehicleMainShell';
import { buildAttentionItems, buildVehicleHealth } from '../../features/vehicles/domain/buildVehicleOverview';
import { useVehicle } from '../../features/vehicles/VehicleContext';

export const VehicleOverviewPage = () => {
  const { openAddComponent } = useAppShell();
  const {
    vehicleComponents,
    vehicleSystems,
    isVehicleDataLoading,
    vehicleDataError,
    refreshVehicleData,
  } = useVehicle();

  if (isVehicleDataLoading || vehicleDataError) {
    return <VehicleMainShell><VehicleDataState error={vehicleDataError} onRetry={() => void refreshVehicleData()} /></VehicleMainShell>;
  }

  const health = buildVehicleHealth(vehicleComponents);
  const attentionItems = buildAttentionItems(vehicleComponents);

  return (
    <VehicleMainShell>
      <div className="cb-vehicle-screen cb-vehicle-overview">
        <VehicleHealthCard summary={health} />

        <Card className="cb-list-card cb-attention-card">
          <header className="cb-list-card__header cb-list-card__header--attention">
            <TriangleAlert size={17} aria-hidden="true" />
            Precisam de atenção
          </header>
          {attentionItems.length > 0
            ? attentionItems.map((item) => <AttentionItemRow key={item.id} item={item} />)
            : <p className="cb-empty-filter-result">Nenhum componente precisa de atenção.</p>}
        </Card>

        <Card className="cb-list-card cb-systems-card">
          <header className="cb-list-card__header">Sistemas do veículo</header>
          {vehicleSystems.map((system) => <SystemSummaryRow key={system.id} system={system} />)}
          <button className="cb-add-component-link" type="button" onClick={() => openAddComponent()}>
            <Plus size={18} aria-hidden="true" /> Adicionar componente
          </button>
        </Card>
      </div>
    </VehicleMainShell>
  );
};
