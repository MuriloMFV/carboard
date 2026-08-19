import { supabase } from '../../../services/supabase/client';

export type MileageSourceType = 'manual' | 'maintenance' | 'fuel' | 'problem' | 'onboarding';

interface UpdateVehicleMileageInput {
  vehicleId: string;
  currentMileage: number;
  candidateMileage: number;
  sourceType: MileageSourceType;
  sourceId?: string;
  recordedAt: string;
}

export const updateVehicleMileageIfGreater = async ({
  vehicleId,
  currentMileage,
  candidateMileage,
  sourceType,
  sourceId,
  recordedAt,
}: UpdateVehicleMileageInput): Promise<boolean> => {
  if (!Number.isInteger(candidateMileage) || candidateMileage <= currentMileage) return false;

  const { data, error } = await supabase.rpc('update_vehicle_mileage_if_greater', {
    p_vehicle_id: vehicleId,
    p_candidate_mileage: candidateMileage,
    p_source_type: sourceType,
    p_recorded_at: recordedAt,
    ...(sourceId ? { p_source_id: sourceId } : {}),
  });

  if (error) {
    console.error('Falha ao atualizar quilometragem no Supabase.', error);
    throw new Error('Não foi possível atualizar a quilometragem. Tente novamente.');
  }
  return data;
};
