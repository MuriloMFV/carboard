import type { VehicleSystem } from '../types';

export const mockVehicleSystems: VehicleSystem[] = [
  { id: 'motor', name: 'Motor', icon: 'engine', componentCount: 8, goodCount: 6, attentionCount: 1, criticalCount: 0, noDataCount: 1 },
  { id: 'freios', name: 'Freios', icon: 'brakes', componentCount: 5, goodCount: 5, attentionCount: 0, criticalCount: 0, noDataCount: 0 },
  { id: 'suspensao', name: 'Suspensão', icon: 'suspension', componentCount: 7, goodCount: 5, attentionCount: 2, criticalCount: 0, noDataCount: 0 },
  { id: 'pneus', name: 'Pneus', icon: 'tires', componentCount: 4, goodCount: 4, attentionCount: 0, criticalCount: 0, noDataCount: 0 },
  { id: 'arrefecimento', name: 'Arrefecimento', icon: 'cooling', componentCount: 6, goodCount: 6, attentionCount: 0, criticalCount: 0, noDataCount: 0 },
  { id: 'eletrica', name: 'Elétrica', icon: 'electrical', componentCount: 4, goodCount: 3, attentionCount: 1, criticalCount: 0, noDataCount: 0 },
  { id: 'transmissao', name: 'Transmissão', icon: 'transmission', componentCount: 3, goodCount: 3, attentionCount: 0, criticalCount: 0, noDataCount: 0 },
  { id: 'iluminacao', name: 'Iluminação', icon: 'lighting', componentCount: 12, goodCount: 12, attentionCount: 0, criticalCount: 0, noDataCount: 0 },
];
