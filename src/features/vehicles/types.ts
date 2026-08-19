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
  catalogId: string;
  name: string;
  icon: VehicleIconName;
  componentCount: number;
  goodCount: number;
  attentionCount: number;
  criticalCount: number;
  noDataCount: number;
}

export interface ComponentMaintenanceData {
  lastServiceDate?: string;
  lastServiceMileage?: number;
  intervalKm?: number;
  intervalMonths?: number;
}

export interface VehicleComponent {
  id: string;
  systemId: string;
  systemCatalogId: string;
  catalogComponentId?: string;
  catalogSlug?: string;
  name: string;
  icon: VehicleIconName;
  status: ComponentStatus;
  summary: string;
  maintenance?: ComponentMaintenanceData;
  notes?: string;
}

export interface VehicleHealthSummary {
  percentage?: number;
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

export interface VehicleData {
  systems: VehicleSystem[];
  components: VehicleComponent[];
}
