import { useIonRouter } from '@ionic/react';
import { Pencil, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Card, PrimaryButton, StatusText } from '../../components/ui';
import { MaintenanceForecast } from '../../features/vehicles/components/MaintenanceForecast';
import { VehicleDataState } from '../../features/vehicles/components/VehicleDataState';
import { VehicleDetailShell } from '../../features/vehicles/components/VehicleDetailShell';
import { VehicleIcon } from '../../features/vehicles/components/VehicleIcon';
import { calculateNextMaintenance } from '../../features/vehicles/domain/calculateNextMaintenance';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { formatDate, formatMileage, formatMonthYear } from '../../utils/formatters';

interface ComponentRouteParams {
  componentId: string;
}

const buildIntervalLabel = (intervalKm?: number, intervalMonths?: number): string => {
  const values = [
    intervalKm ? `${formatMileage(intervalKm)} km` : null,
    intervalMonths ? `${intervalMonths} meses` : null,
  ].filter(Boolean);
  return values.length > 0 ? values.join(' ou ') : 'Sem dados';
};

export const VehicleComponentPage = () => {
  const router = useIonRouter();
  const { componentId } = useParams<ComponentRouteParams>();
  const {
    selectedVehicle,
    vehicleComponents,
    vehicleSystems,
    isVehicleDataLoading,
    vehicleDataError,
    refreshVehicleData,
  } = useVehicle();
  const component = vehicleComponents.find((item) => item.id === componentId);
  const system = component
    ? vehicleSystems.find((item) => item.catalogId === component.systemCatalogId)
    : undefined;

  if (isVehicleDataLoading || vehicleDataError) {
    return (
      <VehicleDetailShell title="Componente" fallbackPath="/vehicle/components">
        <VehicleDataState error={vehicleDataError} onRetry={() => void refreshVehicleData()} />
      </VehicleDetailShell>
    );
  }

  if (!component || !selectedVehicle) {
    return (
      <VehicleDetailShell title="Componente" fallbackPath="/vehicle/components">
        <Card className="cb-not-found-card"><h1>Componente não encontrado</h1><p>Volte para a lista e escolha um componente disponível.</p></Card>
      </VehicleDetailShell>
    );
  }

  const maintenance = component.maintenance;
  const forecast = calculateNextMaintenance({
    currentMileage: selectedVehicle.currentMileage,
    ...maintenance,
  });
  const hasMileageForecast = forecast.remainingKm !== undefined;
  const hasForecast = forecast.nextMileage !== undefined || forecast.nextDate !== undefined;
  const hasLastService = maintenance?.lastServiceDate !== undefined
    || maintenance?.lastServiceMileage !== undefined;

  return (
    <VehicleDetailShell title={component.name} fallbackPath={system ? `/vehicle/system/${system.id}` : '/vehicle/components'}>
      <div className="cb-vehicle-screen cb-component-detail-screen">
        {hasMileageForecast ? (
          <MaintenanceForecast component={component} forecast={forecast} currentMileage={selectedVehicle.currentMileage} />
        ) : (
          <Card className="cb-generic-component-card">
            <span className="cb-round-icon"><VehicleIcon name={component.icon} /></span>
            <div><span className="cb-section-eyebrow">{component.name}</span><p>{component.summary}</p><StatusText status={component.status} /></div>
          </Card>
        )}

        <PrimaryButton
          className="cb-vehicle-primary-action"
          onClick={() => router.push(`/register/maintenance?system=${component.systemId}&component=${component.id}`, 'forward')}
        >
          <Plus size={20} aria-hidden="true" /> Registrar manutenção
        </PrimaryButton>

        <Card className="cb-detail-info-card">
          <span className="cb-section-eyebrow">Próxima manutenção</span>
          <strong>
            {hasForecast
              ? [
                forecast.nextMileage ? `${formatMileage(forecast.nextMileage)} km` : null,
                forecast.nextDate ? formatMonthYear(forecast.nextDate) : null,
              ].filter(Boolean).join(' ou ')
              : 'Sem dados'}
          </strong>
          {hasForecast && <p>O que ocorrer primeiro.</p>}
        </Card>

        <Card className="cb-detail-info-card cb-editable-card">
          <div>
            <span className="cb-section-eyebrow">Intervalo de manutenção</span>
            <strong>{buildIntervalLabel(maintenance?.intervalKm, maintenance?.intervalMonths)}</strong>
            <p>O CarBoard usa este intervalo para calcular seus próximos lembretes.</p>
          </div>
          <Pencil size={18} aria-hidden="true" />
        </Card>

        <section className="cb-detail-section">
          <h2>Última manutenção</h2>
          {hasLastService ? (
            <Card className="cb-list-card">
              <div className="cb-info-row">
                <span>Data</span>
                <strong>{maintenance?.lastServiceDate ? formatDate(maintenance.lastServiceDate) : 'Não informado'}</strong>
              </div>
              <div className="cb-info-row">
                <span>Quilometragem</span>
                <strong>{maintenance?.lastServiceMileage !== undefined ? `${formatMileage(maintenance.lastServiceMileage)} km` : 'Não informado'}</strong>
              </div>
            </Card>
          ) : (
            <Card className="cb-empty-filter-result">Sem dados.</Card>
          )}
        </section>

        <section className="cb-detail-section">
          <h2>Produto atual</h2>
          <Card className="cb-empty-filter-result">Sem dados.</Card>
        </section>

        <section className="cb-detail-section">
          <h2>Histórico recente</h2>
          <Card className="cb-empty-filter-result">Sem dados de manutenção.</Card>
        </section>

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
