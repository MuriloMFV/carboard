import { Card } from '../../../components/ui';
import { formatMileage } from '../../../utils/formatters';
import type { NextMaintenanceResult } from '../domain/calculateNextMaintenance';
import type { VehicleComponent } from '../types';
import { componentStatusLabels } from '../status';
import { VehicleIcon } from './VehicleIcon';

interface MaintenanceForecastProps {
  component: VehicleComponent;
  forecast: NextMaintenanceResult;
  currentMileage: number;
}

export const MaintenanceForecast = ({ component, forecast, currentMileage }: MaintenanceForecastProps) => {
  const maintenance = component.maintenance;
  const progress = maintenance?.lastServiceMileage && forecast.nextMileage
    ? Math.min(100, Math.max(0, ((currentMileage - maintenance.lastServiceMileage) / (forecast.nextMileage - maintenance.lastServiceMileage)) * 100))
    : 0;
  const remainingKm = forecast.remainingKm;

  return (
    <Card className="cb-maintenance-forecast">
      <div className="cb-maintenance-forecast__heading">
        <span className="cb-round-icon"><VehicleIcon name={component.icon} /></span>
        <span className="cb-section-eyebrow">{component.name}</span>
        <strong className={`cb-status-pill cb-status-pill--${component.status}`}>{componentStatusLabels[component.status]}</strong>
      </div>
      <h1>{remainingKm !== undefined && remainingKm > 0
        ? `Manutenção recomendada em aproximadamente ${formatMileage(remainingKm)} km`
        : 'Manutenção recomendada'}</h1>
      {forecast.nextMileage && <p>Próxima troca aos {formatMileage(forecast.nextMileage)} km</p>}
      {maintenance?.lastServiceMileage && forecast.nextMileage && (
        <>
          <div className="cb-maintenance-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
          <div className="cb-maintenance-track-labels">
            <span>{formatMileage(maintenance.lastServiceMileage)} km</span>
            <strong>{formatMileage(currentMileage)} km</strong>
            <span>{formatMileage(forecast.nextMileage)} km</span>
          </div>
          {maintenance.intervalKm && <small>Intervalo: {formatMileage(maintenance.intervalKm)} km</small>}
        </>
      )}
    </Card>
  );
};
