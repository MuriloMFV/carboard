import type { ComponentStatus } from '../../types';

export type VehicleIconName =
  | 'air'
  | 'brakes'
  | 'cooling'
  | 'electrical'
  | 'engine'
  | 'filter'
  | 'fuel'
  | 'lighting'
  | 'oil'
  | 'spark'
  | 'suspension'
  | 'tires'
  | 'transmission';

export interface VehicleSystem {
  id: string;
  name: string;
  icon: VehicleIconName;
  componentCount: number;
  goodCount: number;
  attentionCount: number;
  criticalCount: number;
  noDataCount: number;
}

export interface MaintenanceHistoryRecord {
  id: string;
  title: string;
  date: string;
  mileage: number;
  cost: number;
  productSummary?: string;
  workshop?: string;
}

export interface ComponentMaintenanceData {
  lastServiceDate?: string;
  lastServiceMileage?: number;
  intervalKm?: number;
  intervalMonths?: number;
}

export interface ComponentProductData {
  name: string;
  viscosity?: string;
  type?: string;
  quantity?: string;
}

export interface VehicleComponent {
  id: string;
  systemId: string;
  name: string;
  icon: VehicleIconName;
  status: ComponentStatus;
  summary: string;
  maintenance?: ComponentMaintenanceData;
  product?: ComponentProductData;
  history?: MaintenanceHistoryRecord[];
  notes?: string;
}

export interface VehicleHealthSummary {
  percentage: number;
  label: string;
  goodCount: number;
  attentionCount: number;
}

export interface VehicleAttentionItem {
  id: string;
  componentId: string;
  title: string;
  description: string;
  icon: VehicleIconName;
}

export interface VehicleMetadata {
  fuelType: string;
  plate?: string;
  renavam?: string;
  licensingYear?: number;
  insurance?: string;
  addedAt: string;
}
