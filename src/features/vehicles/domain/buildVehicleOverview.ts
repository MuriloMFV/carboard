import type { VehicleAttentionItem, VehicleComponent, VehicleHealthSummary } from '../types';

export const buildVehicleHealth = (components: VehicleComponent[]): VehicleHealthSummary => {
  const goodCount = components.filter((component) => component.status === 'good').length;
  const attentionCount = components.filter((component) => component.status === 'attention').length;
  const criticalCount = components.filter((component) => component.status === 'critical').length;
  const knownCount = goodCount + attentionCount + criticalCount;

  return {
    percentage: undefined,
    label: criticalCount > 0 ? 'Crítico' : attentionCount > 0 ? 'Atenção' : knownCount > 0 ? 'Bom' : 'Sem dados',
    goodCount,
    attentionCount: attentionCount + criticalCount,
  };
};

export const buildAttentionItems = (components: VehicleComponent[]): VehicleAttentionItem[] =>
  components
    .filter((component) => component.status === 'attention' || component.status === 'critical')
    .map((component) => ({
      id: `attention-${component.id}`,
      componentId: component.id,
      title: component.name,
      description: component.summary,
      icon: component.icon,
    }));
