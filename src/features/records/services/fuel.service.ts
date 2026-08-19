import { supabase } from '../../../services/supabase/client';
import type { FuelType } from '../types';

export interface CreateFuelInput {
  vehicleId: string;
  fueledAt: string;
  mileage: number;
  fuelType: FuelType;
  totalCost?: number;
  liters?: number;
  pricePerLiter?: number;
  fullTank: boolean;
  station?: string;
  notes?: string;
}

export const getPreviousFullTankMileage = async (
  vehicleId: string,
  beforeMileage: number,
): Promise<number | undefined> => {
  const { data, error } = await supabase
    .from('fuel_records')
    .select('mileage')
    .eq('vehicle_id', vehicleId)
    .eq('full_tank', true)
    .lt('mileage', beforeMileage)
    .order('mileage', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Falha ao buscar o abastecimento anterior.', error);
    throw new Error('Não foi possível consultar os abastecimentos anteriores.');
  }
  return data?.mileage;
};

export const createFuelRecord = async (input: CreateFuelInput): Promise<string> => {
  const { data, error } = await supabase.rpc('create_fuel_record', {
    p_vehicle_id: input.vehicleId,
    p_fueled_at: input.fueledAt,
    p_mileage: input.mileage,
    p_fuel_type: input.fuelType,
    p_full_tank: input.fullTank,
    ...(input.totalCost !== undefined ? { p_total_cost: input.totalCost } : {}),
    ...(input.liters !== undefined ? { p_liters: input.liters } : {}),
    ...(input.pricePerLiter !== undefined ? { p_price_per_liter: input.pricePerLiter } : {}),
    ...(input.station ? { p_station: input.station } : {}),
    ...(input.notes ? { p_notes: input.notes } : {}),
  });

  if (error) {
    console.error('Falha ao registrar abastecimento no Supabase.', error);
    throw new Error('Não foi possível salvar o abastecimento. Verifique sua conexão e tente novamente.');
  }
  return data;
};
