import { supabase } from '../../../services/supabase/client';
import type { RecordPriority } from '../types';

export interface CreateProblemInput {
  vehicleId: string;
  title: string;
  detectedAt: string;
  mileage: number;
  priority: RecordPriority;
  systemId?: string;
  vehicleComponentId?: string;
  description?: string;
  estimatedCost?: number;
}

export const createProblem = async (input: CreateProblemInput): Promise<string> => {
  const { data, error } = await supabase.rpc('create_problem_record', {
    p_vehicle_id: input.vehicleId,
    p_title: input.title,
    p_detected_at: input.detectedAt,
    p_mileage: input.mileage,
    p_priority: input.priority,
    ...(input.systemId ? { p_system_id: input.systemId } : {}),
    ...(input.vehicleComponentId ? { p_vehicle_component_id: input.vehicleComponentId } : {}),
    ...(input.description ? { p_description: input.description } : {}),
    ...(input.estimatedCost !== undefined ? { p_estimated_cost: input.estimatedCost } : {}),
  });

  if (error) {
    console.error('Falha ao registrar problema no Supabase.', error);
    throw new Error('Não foi possível registrar o problema. Tente novamente.');
  }
  return data;
};
