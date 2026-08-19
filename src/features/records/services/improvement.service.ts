import { supabase } from '../../../services/supabase/client';
import type { RecordPriority } from '../types';

export interface CreateImprovementInput {
  vehicleId: string;
  title: string;
  priority: RecordPriority;
  category?: string;
  estimatedBudget?: number;
  productName?: string;
  productUrl?: string;
  notes?: string;
}

export const createImprovement = async (input: CreateImprovementInput): Promise<string> => {
  const { data, error } = await supabase.rpc('create_improvement_record', {
    p_vehicle_id: input.vehicleId,
    p_title: input.title,
    p_priority: input.priority,
    ...(input.category ? { p_category: input.category } : {}),
    ...(input.estimatedBudget !== undefined ? { p_estimated_budget: input.estimatedBudget } : {}),
    ...(input.productName ? { p_product_name: input.productName } : {}),
    ...(input.productUrl ? { p_product_url: input.productUrl } : {}),
    ...(input.notes ? { p_notes: input.notes } : {}),
  });

  if (error) {
    console.error('Falha ao registrar melhoria no Supabase.', error);
    throw new Error('Não foi possível salvar a melhoria. Tente novamente.');
  }
  return data;
};
