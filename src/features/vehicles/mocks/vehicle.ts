import type { Vehicle } from '../../../types';
import type { VehicleHealthSummary, VehicleMetadata } from '../types';

export const mockVehicle: Vehicle = {
  id: 'vehicle-1',
  nickname: 'Projeto Gol',
  brand: 'Volkswagen',
  model: 'Gol',
  engine: '1.0 8V',
  year: 2005,
  currentMileage: 141_500,
};

export const mockVehicleHealth: VehicleHealthSummary = {
  percentage: 82,
  label: 'Bom',
  goodCount: 31,
  attentionCount: 4,
};

export const mockVehicleMetadata: VehicleMetadata = {
  fuelType: 'Flex',
  addedAt: '2026-08-12',
};
