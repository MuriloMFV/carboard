import type { Json } from '../../../services/supabase/database.types';
import { supabase } from '../../../services/supabase/client';

export interface MaintenanceItemInput {
  vehicleComponentId: string;
  description?: string;
  productName?: string;
  brand?: string;
  specification?: Record<string, Json>;
  quantity?: number;
  itemCost?: number;
}

export interface CreateMaintenanceInput {
  vehicleId: string;
  serviceDate: string;
  mileage: number;
  title: string;
  items: MaintenanceItemInput[];
  totalCost?: number;
  workshop?: string;
  notes?: string;
  intervalKm?: number;
  intervalMonths?: number;
}

const toRpcItems = (items: MaintenanceItemInput[]): Json => items.map((item) => ({
  vehicleComponentId: item.vehicleComponentId,
  ...(item.description ? { description: item.description } : {}),
  ...(item.productName ? { productName: item.productName } : {}),
  ...(item.brand ? { brand: item.brand } : {}),
  ...(item.specification ? { specification: item.specification } : {}),
  ...(item.quantity !== undefined ? { quantity: item.quantity } : {}),
  ...(item.itemCost !== undefined ? { itemCost: item.itemCost } : {}),
}));

export const createMaintenance = async (input: CreateMaintenanceInput): Promise<string> => {
  const { data, error } = await supabase.rpc('create_maintenance_with_items', {
    p_vehicle_id: input.vehicleId,
    p_service_date: input.serviceDate,
    p_mileage: input.mileage,
    p_title: input.title,
    p_items: toRpcItems(input.items),
    ...(input.totalCost !== undefined ? { p_total_cost: input.totalCost } : {}),
    ...(input.workshop ? { p_workshop: input.workshop } : {}),
    ...(input.notes ? { p_notes: input.notes } : {}),
    ...(input.intervalKm !== undefined ? { p_interval_km: input.intervalKm } : {}),
    ...(input.intervalMonths !== undefined ? { p_interval_months: input.intervalMonths } : {}),
  });

  if (error) {
    console.error('Falha ao registrar manutenção no Supabase.', error);
    throw new Error('Não foi possível registrar a manutenção. Tente novamente.');
  }
  return data;
};
