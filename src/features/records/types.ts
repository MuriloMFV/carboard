export type RecordPriority = 'low' | 'medium' | 'high';
export type FuelType = 'gasoline' | 'ethanol';

export interface MaintenanceItem {
  componentId: string;
  productName?: string;
  brand?: string;
  viscosity?: string;
  productType?: string;
  quantity?: number;
}

export interface MaintenanceRecord {
  id: string;
  type: 'maintenance';
  vehicleId: string;
  date: string;
  mileage: number;
  systemId: string;
  title: string;
  componentIds: string[];
  items: MaintenanceItem[];
  totalCost?: number;
  workshop?: string;
  notes?: string;
  intervalKm?: number;
  intervalMonths?: number;
}

export interface FuelRecord {
  id: string;
  type: 'fuel';
  vehicleId: string;
  date: string;
  mileage: number;
  fuelType: FuelType;
  totalCost?: number;
  liters?: number;
  pricePerLiter?: number;
  fullTank: boolean;
  station?: string;
  notes?: string;
}

export interface ProblemRecord {
  id: string;
  type: 'problem';
  vehicleId: string;
  title: string;
  systemId?: string;
  componentName?: string;
  date: string;
  mileage: number;
  priority: RecordPriority;
  status: 'open' | 'monitoring' | 'resolved';
  description?: string;
  estimatedCost?: number;
}

export interface ImprovementRecord {
  id: string;
  type: 'improvement';
  vehicleId: string;
  title: string;
  date: string;
  category?: string;
  priority: RecordPriority;
  status: 'planned' | 'purchased' | 'installed';
  estimatedBudget?: number;
  actualCost?: number;
  productName?: string;
  productUrl?: string;
  notes?: string;
}

export interface MileageRecord {
  id: string;
  type: 'mileage';
  vehicleId: string;
  date: string;
  mileage: number;
  previousMileage: number;
}

export type VehicleRecord =
  | MaintenanceRecord
  | FuelRecord
  | ProblemRecord
  | ImprovementRecord
  | MileageRecord;

export type SuccessFeedbackType = 'maintenance' | 'fuel' | 'mileage' | 'generic';
