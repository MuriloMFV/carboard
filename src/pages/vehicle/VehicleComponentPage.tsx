import { Pencil, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Card, PrimaryButton, StatusText } from '../../components/ui';
import { MaintenanceForecast } from '../../features/vehicles/components/MaintenanceForecast';
import { MaintenanceHistoryRow } from '../../features/vehicles/components/MaintenanceHistoryRow';
import { VehicleDetailShell } from '../../features/vehicles/components/VehicleDetailShell';
import { VehicleIcon } from '../../features/vehicles/components/VehicleIcon';
import { calculateNextMaintenance } from '../../features/vehicles/domain/calculateNextMaintenance';
import { mockVehicle, mockVehicleComponents, mockVehicleSystems } from '../../features/vehicles/mocks';
import { formatDate, formatMileage, formatMonthYear } from '../../utils/formatters';

interface ComponentRouteParams {
  componentId: string;
}

export const VehicleComponentPage = () => {
  const { componentId } = useParams<ComponentRouteParams>();
  const component = mockVehicleComponents.find((item) => item.id === componentId);
  const system = component ? mockVehicleSystems.find((item) => item.id === component.systemId) : undefined;

  if (!component) {
    return (
      <VehicleDetailShell title="Componente" fallbackPath="/vehicle/components">
        <Card className="cb-not-found-card"><h1>Componente não encontrado</h1><p>Volte para a lista e escolha um componente disponível.</p></Card>
      </VehicleDetailShell>
    );
  }

  const forecast = calculateNextMaintenance({
    currentMileage: mockVehicle.currentMileage,
    ...component.maintenance,
  });

  return (
    <VehicleDetailShell title={component.name} fallbackPath={system ? `/vehicle/system/${system.id}` : '/vehicle/components'}>
      <div className="cb-vehicle-screen cb-component-detail-screen">
        {component.maintenance ? (
          <MaintenanceForecast component={component} forecast={forecast} currentMileage={mockVehicle.currentMileage} />
        ) : (
          <Card className="cb-generic-component-card">
            <span className="cb-round-icon"><VehicleIcon name={component.icon} /></span>
            <div><span className="cb-section-eyebrow">{component.name}</span><p>{component.summary}</p><StatusText status={component.status} /></div>
          </Card>
        )}

        <PrimaryButton className="cb-vehicle-primary-action" disabled>
          <Plus size={20} aria-hidden="true" /> Registrar manutenção
        </PrimaryButton>

        {component.maintenance && (
          <>
            <Card className="cb-detail-info-card">
              <span className="cb-section-eyebrow">Próxima manutenção</span>
              <strong>
                {forecast.nextMileage ? `${formatMileage(forecast.nextMileage)} km` : 'Sem previsão por KM'}
                {component.maintenance.intervalMonths ? ` ou ${component.maintenance.intervalMonths} meses após a última troca` : ''}
              </strong>
              {forecast.nextDate && <p>Próxima por data: {formatMonthYear(forecast.nextDate)}. O que ocorrer primeiro.</p>}
            </Card>

            <Card className="cb-detail-info-card cb-editable-card">
              <div>
                <span className="cb-section-eyebrow">Intervalo de manutenção</span>
                <strong>
                  {component.maintenance.intervalKm ? `${formatMileage(component.maintenance.intervalKm)} km` : ''}
                  {component.maintenance.intervalKm && component.maintenance.intervalMonths ? ' ou ' : ''}
                  {component.maintenance.intervalMonths ? `${component.maintenance.intervalMonths} meses` : ''}
                </strong>
                <p>O CarBoard usa este intervalo para calcular seus próximos lembretes.</p>
              </div>
              <Pencil size={18} aria-hidden="true" />
            </Card>
          </>
        )}

        {component.product && (
          <section className="cb-detail-section">
            <h2>Óleo atual</h2>
            <Card className="cb-detail-info-card cb-editable-card">
              <div>
                <strong>{component.product.viscosity} <small>· {component.product.type}</small></strong>
                <p>{component.product.name}</p>
                <p>{component.product.quantity}{component.maintenance?.lastServiceDate ? ` · colocado em ${formatDate(component.maintenance.lastServiceDate)}` : ''}</p>
              </div>
              <Pencil size={18} aria-hidden="true" />
            </Card>
          </section>
        )}

        {component.history && component.history.length > 0 && (
          <section className="cb-detail-section">
            <h2>Histórico recente</h2>
            <Card className="cb-list-card cb-component-history-card">
              {component.history.map((record) => <MaintenanceHistoryRow key={record.id} record={record} detailed />)}
              <span className="cb-card-action" aria-disabled="true">Ver histórico completo ›</span>
            </Card>
          </section>
        )}

        {component.notes && (
          <Card className="cb-detail-info-card cb-editable-card cb-notes-card">
            <div><span className="cb-section-eyebrow">Observações</span><p>{component.notes}</p></div>
            <Pencil size={18} aria-hidden="true" />
          </Card>
        )}
      </div>
    </VehicleDetailShell>
  );
};
