import { createClient } from '@supabase/supabase-js';

const url = process.env.CARBOARD_SUPABASE_URL;
const publishableKey = process.env.CARBOARD_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error('Defina CARBOARD_SUPABASE_URL e CARBOARD_SUPABASE_PUBLISHABLE_KEY para validar.');
}

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const createMemoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};

const createTestClient = (storage) => createClient(url, publishableKey, {
  auth: {
    storage,
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const password = 'CarBoard-test-2026!';
const emailA = `carboard-a-${suffix}@carboard.dev`;
const expectedVehicle = {
  brand: 'Honda',
  model: 'Civic',
  year: 2018,
  currentMileage: 141000,
  engine: '1.5 Turbo',
  nickname: 'Civic Azul',
};
const storageA = createMemoryStorage();
const clientA = createTestClient(storageA);

const { data: signupA, error: signupAError } = await clientA.auth.signUp({ email: emailA, password });
assert(!signupAError && signupA.session && signupA.user, `Cadastro A falhou: ${signupAError?.message}`);

const { data: profileA, error: profileAError } = await clientA.from('profiles').select('id').single();
assert(!profileAError && profileA.id === signupA.user.id, 'Trigger de profile não criou o perfil do usuário A.');

const { data: catalog, error: catalogError } = await clientA
  .from('component_catalog')
  .select('id,slug,system_id');
assert(!catalogError && catalog.length > 0, 'Catálogo autenticado não está disponível.');

const { data: systems, error: systemsError } = await clientA.from('system_catalog').select('id,slug');
assert(!systemsError && systems.length > 0, 'Catálogo de sistemas não está disponível.');

const { data: vehicleA, error: vehicleAError } = await clientA.rpc('create_vehicle_with_components', {
  p_brand: expectedVehicle.brand,
  p_model: expectedVehicle.model,
  p_year: expectedVehicle.year,
  p_current_mileage: expectedVehicle.currentMileage,
  p_engine: expectedVehicle.engine,
  p_nickname: expectedVehicle.nickname,
  p_oil_status: 'good',
  p_tire_status: 'attention',
});
assert(!vehicleAError && vehicleA, `Criação do veículo falhou: ${vehicleAError?.message}`);

const { data: resolvedComponents, error: componentsError } = await clientA
  .from('vehicle_components')
  .select('id,status,catalog_component:component_catalog(id,slug,name),system:system_catalog(id,slug,name)')
  .eq('vehicle_id', vehicleA.id);
assert(
  !componentsError
    && resolvedComponents.length === catalog.length
    && resolvedComponents.every((component) => component.catalog_component?.name && component.system?.name),
  'Componentes padrão não foram criados ou não resolveram os catálogos.',
);

const oilComponent = resolvedComponents.find((component) => component.catalog_component.slug === 'oleo-do-motor');
const oilFilterComponent = resolvedComponents.find((component) => component.catalog_component.slug === 'filtro-de-oleo');
const electricalSystem = systems.find((system) => system.slug === 'eletrica');
assert(oilComponent && oilFilterComponent && electricalSystem, 'Seed não contém óleo, filtro de óleo e sistema elétrico.');

const { data: maintenanceId, error: maintenanceError } = await clientA.rpc('create_maintenance_with_items', {
  p_vehicle_id: vehicleA.id,
  p_service_date: '2026-08-12',
  p_mileage: 141500,
  p_title: 'Troca de óleo + filtro',
  p_total_cost: 180,
  p_workshop: 'Oficina do João',
  p_items: [
    {
      vehicleComponentId: oilComponent.id,
      description: 'Óleo do motor',
      productName: 'Mobil Super 3000',
      specification: { viscosity: '5W-40', type: 'Sintético', volumeLiters: 3.5 },
      quantity: 3.5,
    },
    { vehicleComponentId: oilFilterComponent.id, description: 'Filtro de óleo' },
  ],
  p_interval_km: 10000,
  p_interval_months: 12,
});
assert(!maintenanceError && maintenanceId, `Manutenção transacional falhou: ${maintenanceError?.message}`);

const { data: maintenance, error: maintenanceReadError } = await clientA
  .from('maintenance_records')
  .select('id,title,total_cost,workshop,mileage')
  .eq('id', maintenanceId)
  .single();
const { data: maintenanceItems, error: itemsReadError } = await clientA
  .from('maintenance_items')
  .select('id,vehicle_component_id,product_name,specification')
  .eq('maintenance_id', maintenanceId);
assert(
  !maintenanceReadError && !itemsReadError
    && maintenance.title === 'Troca de óleo + filtro'
    && maintenance.total_cost === 180
    && maintenance.workshop === 'Oficina do João'
    && maintenanceItems.length === 2,
  'Manutenção ou seus dois itens não persistiram corretamente.',
);

const { data: servicedComponents, error: servicedComponentsError } = await clientA
  .from('vehicle_components')
  .select('id,last_service_date,last_service_mileage,interval_km,interval_months,status')
  .in('id', [oilComponent.id, oilFilterComponent.id]);
assert(
  !servicedComponentsError && servicedComponents.length === 2
    && servicedComponents.every((component) => component.last_service_date === '2026-08-12'
      && component.last_service_mileage === 141500
      && component.interval_km === 10000
      && component.interval_months === 12
      && component.status === 'good'),
  'A manutenção não atualizou os vehicle_components de forma consistente.',
);

const { count: maintenanceCountBeforeRollback } = await clientA
  .from('maintenance_records')
  .select('id', { count: 'exact', head: true })
  .eq('vehicle_id', vehicleA.id);
const { error: invalidMaintenanceError } = await clientA.rpc('create_maintenance_with_items', {
  p_vehicle_id: vehicleA.id,
  p_service_date: '2026-08-13',
  p_mileage: 141600,
  p_title: 'Teste de rollback',
  p_items: [
    { vehicleComponentId: oilComponent.id },
    { vehicleComponentId: crypto.randomUUID() },
  ],
});
assert(invalidMaintenanceError, 'RPC aceitou componente inválido e não testou rollback.');
const { count: maintenanceCountAfterRollback } = await clientA
  .from('maintenance_records')
  .select('id', { count: 'exact', head: true })
  .eq('vehicle_id', vehicleA.id);
assert(
  maintenanceCountAfterRollback === maintenanceCountBeforeRollback,
  'Uma manutenção parcial permaneceu após falha transacional.',
);

const { data: fuelId, error: fuelError } = await clientA.rpc('create_fuel_record', {
  p_vehicle_id: vehicleA.id,
  p_fueled_at: '2026-08-12',
  p_mileage: 141500,
  p_fuel_type: 'gasoline',
  p_total_cost: 200,
  p_liters: 34.8,
  p_price_per_liter: 5.75,
  p_full_tank: true,
  p_station: 'Posto Ipiranga',
});
assert(!fuelError && fuelId, `Abastecimento falhou: ${fuelError?.message}`);

const { data: problemId, error: problemError } = await clientA.rpc('create_problem_record', {
  p_vehicle_id: vehicleA.id,
  p_title: 'Limpador traseiro não funciona',
  p_system_id: electricalSystem.id,
  p_detected_at: '2026-08-12',
  p_mileage: 141500,
  p_priority: 'medium',
  p_estimated_cost: 150,
});
assert(!problemError && problemId, `Problema falhou: ${problemError?.message}`);

const { data: improvementId, error: improvementError } = await clientA.rpc('create_improvement_record', {
  p_vehicle_id: vehicleA.id,
  p_title: 'Alto-falantes das portas',
  p_category: 'audio',
  p_priority: 'medium',
  p_estimated_budget: 280,
});
assert(!improvementError && improvementId, `Melhoria falhou: ${improvementError?.message}`);

const { data: mileageUpdated, error: mileageError } = await clientA.rpc('update_vehicle_mileage', {
  p_vehicle_id: vehicleA.id,
  p_mileage: 142350,
  p_recorded_at: '2026-08-19',
});
assert(!mileageError && mileageUpdated, `Atualização manual de KM falhou: ${mileageError?.message}`);

const { error: reducedMileageError } = await clientA.rpc('update_vehicle_mileage', {
  p_vehicle_id: vehicleA.id,
  p_mileage: 140000,
  p_recorded_at: '2026-08-19',
});
assert(reducedMileageError, 'A atualização manual permitiu reduzir a quilometragem.');

const { data: persistedRecords, error: persistedRecordsError } = await Promise.all([
  clientA.from('fuel_records').select('id,total_cost,liters,price_per_liter,full_tank,station').eq('id', fuelId).single(),
  clientA.from('problems').select('id,status,estimated_cost').eq('id', problemId).single(),
  clientA.from('improvements').select('id,status,estimated_budget,actual_cost').eq('id', improvementId).single(),
  clientA.from('mileage_records').select('id,mileage,source_type,source_id').eq('vehicle_id', vehicleA.id).order('mileage'),
]).then((results) => ({
  data: results.map((result) => result.data),
  error: results.find((result) => result.error)?.error,
}));
assert(!persistedRecordsError, `Consulta dos registros persistidos falhou: ${persistedRecordsError?.message}`);
const [fuel, problem, improvement, mileageRecords] = persistedRecords;
assert(fuel.id === fuelId && fuel.full_tank && fuel.station === 'Posto Ipiranga', 'Abastecimento não persistiu.');
assert(problem.id === problemId && problem.status === 'open' && problem.estimated_cost === 150, 'Problema não permaneceu open.');
assert(
  improvement.id === improvementId && improvement.status === 'planned'
    && improvement.estimated_budget === 280 && improvement.actual_cost === null,
  'Melhoria não permaneceu planned ou criou custo real.',
);
assert(
  mileageRecords.length === 2
    && mileageRecords.some((record) => record.source_type === 'maintenance' && record.source_id === maintenanceId)
    && mileageRecords.some((record) => record.source_type === 'manual' && record.mileage === 142350),
  'Histórico de KM não registrou apenas os avanços aplicáveis.',
);

const reloadedClientA = createTestClient(storageA);
const { data: restoredSession, error: restoredSessionError } = await reloadedClientA.auth.getSession();
assert(!restoredSessionError && restoredSession.session?.user.id === signupA.user.id, 'Sessão não sobreviveu à recriação do cliente.');
for (const [table, id] of [
  ['maintenance_records', maintenanceId],
  ['fuel_records', fuelId],
  ['problems', problemId],
  ['improvements', improvementId],
]) {
  const { data, error } = await reloadedClientA.from(table).select('id').eq('id', id).single();
  assert(!error && data.id === id, `${table} não permaneceu após recriar o cliente.`);
}

const storageB = createMemoryStorage();
const clientB = createTestClient(storageB);
const { data: signupB, error: signupBError } = await clientB.auth.signUp({
  email: `carboard-b-${suffix}@carboard.dev`,
  password,
});
assert(!signupBError && signupB.session && signupB.user, `Cadastro B falhou: ${signupBError?.message}`);

for (const table of ['vehicles', 'vehicle_components', 'maintenance_records', 'maintenance_items', 'fuel_records', 'problems', 'improvements', 'mileage_records']) {
  const { data, error } = await clientB.from(table).select('id');
  assert(!error && data.length === 0, `RLS permitiu que B lesse dados de A em ${table}.`);
}

const { error: forgedMaintenanceError } = await clientB.from('maintenance_records').insert({
  vehicle_id: vehicleA.id,
  service_date: '2026-08-19',
  mileage: 142350,
  title: 'Registro forjado',
});
assert(forgedMaintenanceError, 'RLS permitiu que B criasse manutenção no veículo de A.');

const { error: forgedItemError } = await clientB.from('maintenance_items').insert({
  maintenance_id: maintenanceId,
  vehicle_component_id: oilComponent.id,
});
assert(forgedItemError, 'RLS permitiu que B alterasse maintenance_items de A.');

const { error: forgedMileageError } = await clientB.rpc('update_vehicle_mileage', {
  p_vehicle_id: vehicleA.id,
  p_mileage: 150000,
});
assert(forgedMileageError, 'RLS permitiu que B atualizasse KM do veículo de A.');

const { error: signOutError } = await reloadedClientA.auth.signOut();
assert(!signOutError, `Logout falhou: ${signOutError?.message}`);
const { data: signedOutSession } = await reloadedClientA.auth.getSession();
assert(signedOutSession.session === null, 'Logout não limpou a sessão persistida.');
const { error: signInAgainError } = await reloadedClientA.auth.signInWithPassword({ email: emailA, password });
assert(!signInAgainError, `Novo login de A falhou: ${signInAgainError?.message}`);

const { data: persistedVehicle, error: persistedVehicleError } = await reloadedClientA
  .from('vehicles')
  .select('id,nickname,brand,model,year,engine,current_mileage')
  .eq('id', vehicleA.id)
  .single();
assert(
  !persistedVehicleError
    && persistedVehicle.nickname === expectedVehicle.nickname
    && persistedVehicle.brand === expectedVehicle.brand
    && persistedVehicle.model === expectedVehicle.model
    && persistedVehicle.current_mileage === 142350,
  'Veículo ou KM final não reapareceu após logout e login.',
);

console.log(JSON.stringify({
  auth: 'cadastro, restauração de sessão, logout e login validados',
  records: 'manutenção, abastecimento, problema, melhoria e KM persistidos',
  transaction: 'manutenção com componente inválido sofreu rollback integral',
  mileage: '141.000 → 141.500 → 142.350; redução para 140.000 bloqueada',
  reload: 'todos os registros reapareceram após recriar o cliente',
  rls: 'usuário B não leu, criou item/manutenção nem atualizou KM de A',
}));
