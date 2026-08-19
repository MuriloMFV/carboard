import type { Vehicle } from '../../types';
import { formatMileage } from '../../utils/formatters';
import vehicleReference from '../../../docs/features/vehicle/CarBoard Dashboard - Final Polish.png';
import '../layout/layout.css';

interface VehicleHeaderProps {
  vehicle: Vehicle;
  showImage?: boolean;
}

export const VehicleHeader = ({ vehicle, showImage = false }: VehicleHeaderProps) => {
  const name = vehicle.nickname ?? `${vehicle.brand} ${vehicle.model}`;

  if (!showImage) {
    return (
      <section className="cb-vehicle-header" aria-labelledby="vehicle-name">
        <div>
          <h1 id="vehicle-name">{name}</h1>
          <p>{vehicle.brand} {vehicle.model} · {vehicle.year}</p>
        </div>
        <span className="cb-mileage">{formatMileage(vehicle.currentMileage)} km</span>
      </section>
    );
  }

  const engineDescription = [vehicle.engine, vehicle.version]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(' · ');
  return (
    <section className="cb-vehicle-header cb-vehicle-header--detailed" aria-labelledby="vehicle-name">
      <div className="cb-vehicle-header__copy">
        <h1 id="vehicle-name">{name}</h1>
        <p>{vehicle.brand} {vehicle.model}{engineDescription ? ` ${engineDescription}` : ''} · {vehicle.year}</p>
        <strong>{formatMileage(vehicle.currentMileage)} <small>km</small></strong>
      </div>
      <div className="cb-vehicle-image" role="img" aria-label={`Ilustração de ${vehicle.brand} ${vehicle.model}`}>
        <img src={vehicleReference} alt="" aria-hidden="true" />
      </div>
    </section>
  );
};
