import type { MaintenanceHistoryRecord } from '../types';

export const mockMotorActivity: MaintenanceHistoryRecord[] = [
  { id: 'motor-activity-1', title: 'Troca de óleo + filtro', date: '2026-03-12', mileage: 132_700, cost: 180 },
  { id: 'motor-activity-2', title: 'Filtro de ar substituído', date: '2025-11-18', mileage: 124_300, cost: 65 },
];
