import type { CurrentProblemAnswer, OilChangeAnswer, TireCondition } from './types';

export const brandOptions = [{ label: 'Volkswagen', value: 'Volkswagen' }];
export const modelOptions = [{ label: 'Gol', value: 'Gol' }];
export const yearOptions = [{ label: '2005', value: '2005' }];
export const engineOptions = [{ label: '1.0 8V', value: '1.0 8V' }];

export const oilChangeOptions: Array<{ value: OilChangeAnswer; label: string }> = [
  { value: 'recently', label: 'Recentemente' },
  { value: 'months_ago', label: 'Há alguns meses' },
  { value: 'due_soon', label: 'Está perto da próxima troca' },
  { value: 'unknown', label: 'Não lembro' },
];

export const tireConditionOptions: Array<{ value: TireCondition; label: string; tone: 'neutral' | 'danger' }> = [
  { value: 'good', label: 'Bons', tone: 'neutral' },
  { value: 'mid_life', label: 'Meia-vida', tone: 'neutral' },
  { value: 'attention', label: 'Precisam de atenção', tone: 'danger' },
  { value: 'unknown', label: 'Não sei', tone: 'neutral' },
];

export const currentProblemOptions: Array<{ value: CurrentProblemAnswer; label: string }> = [
  { value: 'no', label: 'Não' },
  { value: 'yes', label: 'Sim, quero adicionar' },
];
