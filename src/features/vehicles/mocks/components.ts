import type { VehicleAttentionItem, VehicleComponent } from '../types';

export const mockVehicleComponents: VehicleComponent[] = [
  {
    id: 'engine-oil',
    systemId: 'motor',
    name: 'Óleo do motor',
    icon: 'oil',
    status: 'attention',
    summary: 'Troca em 1.200 km',
    maintenance: {
      lastServiceDate: '2026-03-12',
      lastServiceMileage: 132_700,
      intervalKm: 10_000,
      intervalMonths: 12,
    },
    product: {
      name: 'Mobil Super 3000',
      viscosity: '5W-40',
      type: 'Sintético',
      quantity: '3,5 L',
    },
    history: [
      { id: 'oil-history-1', title: 'Troca de óleo + filtro', date: '2026-03-12', mileage: 132_700, cost: 180, productSummary: '5W-40 · Mobil Super 3000', workshop: 'Oficina do João' },
      { id: 'oil-history-2', title: 'Troca de óleo', date: '2025-05-20', mileage: 122_650, cost: 150 },
      { id: 'oil-history-3', title: 'Troca de óleo + filtro', date: '2024-07-03', mileage: 112_800, cost: 165 },
    ],
    notes: 'Óleo utilizado: 5W-40',
  },
  { id: 'oil-filter', systemId: 'motor', name: 'Filtro de óleo', icon: 'filter', status: 'good', summary: 'Última troca há 8.800 km' },
  { id: 'air-filter', systemId: 'motor', name: 'Filtro de ar', icon: 'air', status: 'good', summary: 'Verificado recentemente' },
  { id: 'timing-belt', systemId: 'motor', name: 'Correia dentada', icon: 'engine', status: 'good', summary: 'Próxima troca em aprox. 38.500 km' },
  { id: 'spark-plugs', systemId: 'motor', name: 'Velas', icon: 'spark', status: 'no_data', summary: 'Sem informações registradas' },
  { id: 'fuel-pump', systemId: 'motor', name: 'Bomba de combustível', icon: 'fuel', status: 'good', summary: 'Sem ocorrências registradas' },
  { id: 'engine-mounts', systemId: 'motor', name: 'Coxins do motor', icon: 'engine', status: 'good', summary: 'Verificados recentemente' },
  { id: 'oil-pump', systemId: 'motor', name: 'Bomba de óleo', icon: 'oil', status: 'good', summary: 'Sem ocorrências registradas' },
  { id: 'front-brake-pads', systemId: 'freios', name: 'Pastilhas dianteiras', icon: 'brakes', status: 'good', summary: 'Verificadas há 6 meses' },
  { id: 'front-shocks', systemId: 'suspensao', name: 'Amortecedores dianteiros', icon: 'suspension', status: 'attention', summary: 'Verificação recomendada' },
  { id: 'front-tires', systemId: 'pneus', name: 'Pneus dianteiros', icon: 'tires', status: 'attention', summary: 'Verificação recomendada' },
  { id: 'rear-wiper', systemId: 'eletrica', name: 'Limpador traseiro', icon: 'electrical', status: 'attention', summary: 'Problema em aberto' },
];

export const mockAttentionItems: VehicleAttentionItem[] = [
  { id: 'attention-oil', componentId: 'engine-oil', title: 'Óleo do motor', description: 'Troca recomendada em aproximadamente 1.200 km', icon: 'oil' },
  { id: 'attention-tires', componentId: 'front-tires', title: 'Pneus dianteiros', description: 'Verificação recomendada', icon: 'tires' },
];
