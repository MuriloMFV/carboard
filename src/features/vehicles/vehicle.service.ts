import type { Vehicle } from '../../types';
import type { ComponentStatus } from '../../types';
import { supabase } from '../../services/supabase/client';
import { formatMileage } from '../../utils/formatters';
import type { OnboardingData, OilChangeAnswer, TireCondition } from '../onboarding/types';
import { calculateNextMaintenance } from './domain/calculateNextMaintenance';
import type { VehicleComponent, VehicleData, VehicleIconName, VehicleSystem } from './types';

const mapVehicle = (row: {
  id: string;
  user_id: string;
  nickname: string | null;
  brand: string;
  model: string;
  year: number;
  engine: string | null;
  version: string | null;
  plate: string | null;
  current_mileage: number;
  fuel_type: string | null;
  created_at: string;
  updated_at: string;
}): Vehicle => ({
  id: row.id,
  userId: row.user_id,
  nickname: row.nickname ?? undefined,
  brand: row.brand,
  model: row.model,
  year: row.year,
  engine: row.engine ?? undefined,
  version: row.version ?? undefined,
  plate: row.plate ?? undefined,
  currentMileage: row.current_mileage,
  fuelType: row.fuel_type ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const componentStatuses = new Set<ComponentStatus>(['good', 'attention', 'critical', 'no_data']);
const vehicleIcons = new Set<VehicleIconName>([
  'air', 'brakes', 'cooling', 'electrical', 'engine', 'filter', 'fuel',
  'lighting', 'oil', 'spark', 'suspension', 'tires', 'transmission',
]);

const parseStatus = (status: string): ComponentStatus =>
  componentStatuses.has(status as ComponentStatus) ? status as ComponentStatus : 'no_data';

const parseSystemIcon = (icon: string | null): VehicleIconName =>
  icon && vehicleIcons.has(icon as VehicleIconName) ? icon as VehicleIconName : 'engine';

const resolveComponentIcon = (slug: string | undefined, systemIcon: VehicleIconName): VehicleIconName => {
  if (!slug) return systemIcon;
  if (slug.includes('oleo')) return 'oil';
  if (slug.includes('filtro')) return slug.includes('ar') ? 'air' : 'filter';
  if (slug.includes('vela')) return 'spark';
  if (slug.includes('combustivel')) return 'fuel';
  if (slug.includes('pneu') || slug === 'estepe') return 'tires';
  if (slug.includes('farol') || slug.includes('lanterna')) return 'lighting';
  return systemIcon;
};

const buildComponentSummary = (component: VehicleComponent, currentMileage: number): string => {
  const forecast = calculateNextMaintenance({ currentMileage, ...component.maintenance });
  if (forecast.remainingKm !== undefined) {
    return forecast.remainingKm > 0
      ? `Próxima manutenção em ${formatMileage(forecast.remainingKm)} km`
      : 'Manutenção recomendada';
  }
  if (component.maintenance?.lastServiceMileage !== undefined) {
    return `Último registro aos ${formatMileage(component.maintenance.lastServiceMileage)} km`;
  }
  if (component.status === 'attention') return 'Verificação recomendada';
  if (component.status === 'critical') return 'Ação necessária';
  if (component.status === 'good') return 'Estado inicial informado';
  return 'Sem informações registradas';
};

const oilStatus: Record<OilChangeAnswer, ComponentStatus> = {
  recently: 'good',
  months_ago: 'attention',
  due_soon: 'attention',
  unknown: 'no_data',
};

const tireStatus: Record<TireCondition, ComponentStatus> = {
  good: 'good',
  mid_life: 'attention',
  attention: 'critical',
  unknown: 'no_data',
};

export const listVehicles = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(mapVehicle);
};

export const loadVehicleData = async (vehicleId: string, currentMileage: number): Promise<VehicleData> => {
  const systemsQuery = supabase
    .from('system_catalog')
    .select('id,slug,name,icon,sort_order')
    .order('sort_order', { ascending: true });

  const componentsQuery = supabase
    .from('vehicle_components')
    .select(`
      id,
      catalog_component_id,
      system_id,
      custom_name,
      status,
      interval_km,
      interval_months,
      last_service_date,
      last_service_mileage,
      notes,
      catalog_component:component_catalog(id,slug,name),
      system:system_catalog(id,slug,name,icon)
    `)
    .eq('vehicle_id', vehicleId);

  const [systemsResult, componentsResult] = await Promise.all([systemsQuery, componentsQuery]);
  if (systemsResult.error) throw systemsResult.error;
  if (componentsResult.error) throw componentsResult.error;

  const components: VehicleComponent[] = componentsResult.data.map((row) => {
    const systemIcon = parseSystemIcon(row.system.icon);
    const maintenance = {
      lastServiceDate: row.last_service_date ?? undefined,
      lastServiceMileage: row.last_service_mileage ?? undefined,
      intervalKm: row.interval_km ?? undefined,
      intervalMonths: row.interval_months ?? undefined,
    };
    const component: VehicleComponent = {
      id: row.id,
      systemId: row.system.slug,
      systemCatalogId: row.system_id,
      catalogComponentId: row.catalog_component_id ?? undefined,
      catalogSlug: row.catalog_component?.slug,
      name: row.custom_name || row.catalog_component?.name || 'Componente personalizado',
      icon: resolveComponentIcon(row.catalog_component?.slug, systemIcon),
      status: parseStatus(row.status),
      summary: '',
      maintenance,
      notes: row.notes ?? undefined,
    };
    component.summary = buildComponentSummary(component, currentMileage);
    return component;
  }).sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));

  const systems: VehicleSystem[] = systemsResult.data.map((row) => {
    const systemComponents = components.filter((component) => component.systemCatalogId === row.id);
    return {
      id: row.slug,
      catalogId: row.id,
      name: row.name,
      icon: parseSystemIcon(row.icon),
      componentCount: systemComponents.length,
      goodCount: systemComponents.filter((component) => component.status === 'good').length,
      attentionCount: systemComponents.filter((component) => component.status === 'attention').length,
      criticalCount: systemComponents.filter((component) => component.status === 'critical').length,
      noDataCount: systemComponents.filter((component) => component.status === 'no_data').length,
    };
  });

  return { systems, components };
};

interface CreateCustomVehicleComponentInput {
  vehicleId: string;
  systemCatalogId: string;
  name: string;
}

export const createCustomVehicleComponent = async ({
  vehicleId,
  systemCatalogId,
  name,
}: CreateCustomVehicleComponentInput): Promise<string> => {
  const customName = name.trim();
  if (!customName) throw new Error('Informe o nome do componente.');

  const { data, error } = await supabase
    .from('vehicle_components')
    .insert({
      vehicle_id: vehicleId,
      system_id: systemCatalogId,
      custom_name: customName,
      status: 'no_data',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Falha ao adicionar componente ao veículo.', error);
    throw new Error('Não foi possível adicionar o componente. Tente novamente.');
  }
  return data.id;
};

export const createVehicleFromOnboarding = async (onboarding: OnboardingData): Promise<Vehicle> => {
  const year = Number(onboarding.vehicle.year);
  const mileage = onboarding.mileage ?? 0;

  if (!Number.isInteger(year) || year < 1886) throw new Error('Informe um ano válido para o veículo.');
  if (!Number.isInteger(mileage) || mileage < 0) throw new Error('Informe uma quilometragem válida.');

  const { data, error } = await supabase.rpc('create_vehicle_with_components', {
    p_brand: onboarding.vehicle.brand,
    p_model: onboarding.vehicle.model,
    p_year: year,
    p_current_mileage: mileage,
    ...(onboarding.vehicle.engineVersion ? { p_engine: onboarding.vehicle.engineVersion } : {}),
    ...(onboarding.vehicle.nickname ? { p_nickname: onboarding.vehicle.nickname } : {}),
    p_oil_status: onboarding.initialCheck.oilChange
      ? oilStatus[onboarding.initialCheck.oilChange]
      : 'no_data',
    p_tire_status: onboarding.initialCheck.tireCondition
      ? tireStatus[onboarding.initialCheck.tireCondition]
      : 'no_data',
  });

  if (error) throw error;
  return mapVehicle(data);
};
