import type { FuelRecord } from '../types';

export const mockPreviousFullTank: FuelRecord = {
  id: 'fuel-previous-full-tank',
  type: 'fuel',
  vehicleId: 'vehicle-1',
  date: '2026-08-01',
  mileage: 141_088,
  fuelType: 'gasoline',
  liters: 36.2,
  fullTank: true,
  station: 'Posto Ipiranga',
};
