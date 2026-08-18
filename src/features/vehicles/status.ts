import type { ComponentStatus } from '../../types';

export const componentStatusLabels: Record<ComponentStatus, string> = {
  good: 'Bom',
  attention: 'Atenção',
  critical: 'Crítico',
  no_data: 'Sem dados',
};

export const componentStatusFilters: Array<{ label: string; value: ComponentStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Atenção', value: 'attention' },
  { label: 'Bom', value: 'good' },
  { label: 'Crítico', value: 'critical' },
  { label: 'Sem dados', value: 'no_data' },
];
