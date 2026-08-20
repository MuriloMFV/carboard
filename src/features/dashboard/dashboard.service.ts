import { supabase } from '../../services/supabase/client';
import { formatMonthYear } from '../../utils/formatters';
import type {
  DashboardData,
  DashboardImprovement,
  DashboardProblem,
  FuelEconomyPoint,
} from './types';

const round = (value: number, precision = 1) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const toDateKey = (date: Date): string => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const getMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start: toDateKey(start), end: toDateKey(end) };
};

const sum = (values: Array<number | null>) => values.reduce<number>((total, value) => total + (value ?? 0), 0);

const isPriority = (value: string): value is DashboardProblem['priority'] =>
  value === 'low' || value === 'medium' || value === 'high';

const priorityWeight: Record<DashboardProblem['priority'], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const loadDashboardData = async (vehicleId: string, referenceDate = new Date()): Promise<DashboardData> => {
  const { start, end } = getMonthRange(referenceDate);

  const [
    consumptionResult,
    fuelExpensesResult,
    maintenanceExpensesResult,
    otherExpensesResult,
    improvementResult,
    problemsResult,
  ] = await Promise.all([
    supabase
      .from('fuel_records')
      .select('fueled_at,mileage,liters')
      .eq('vehicle_id', vehicleId)
      .eq('full_tank', true)
      .not('liters', 'is', null)
      .order('mileage', { ascending: false })
      .limit(4),
    supabase
      .from('fuel_records')
      .select('total_cost')
      .eq('vehicle_id', vehicleId)
      .gte('fueled_at', start)
      .lt('fueled_at', end),
    supabase
      .from('maintenance_records')
      .select('total_cost')
      .eq('vehicle_id', vehicleId)
      .gte('service_date', start)
      .lt('service_date', end),
    supabase
      .from('improvements')
      .select('actual_cost,purchased_at,installed_at,created_at,status')
      .eq('vehicle_id', vehicleId)
      .neq('status', 'planned')
      .not('actual_cost', 'is', null)
      .limit(100),
    supabase
      .from('improvements')
      .select('id,title,priority,estimated_budget')
      .eq('vehicle_id', vehicleId)
      .eq('status', 'planned')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('problems')
      .select('id,title,priority')
      .eq('vehicle_id', vehicleId)
      .neq('status', 'resolved')
      .order('detected_at', { ascending: false })
      .limit(20),
  ]);

  const firstError = [
    consumptionResult.error,
    fuelExpensesResult.error,
    maintenanceExpensesResult.error,
    otherExpensesResult.error,
    improvementResult.error,
    problemsResult.error,
  ].find(Boolean);
  if (firstError) throw firstError;

  const consumptionRows = consumptionResult.data ?? [];
  const fuelExpenseRows = fuelExpensesResult.data ?? [];
  const maintenanceExpenseRows = maintenanceExpensesResult.data ?? [];
  const otherExpenseRows = otherExpensesResult.data ?? [];
  const problemRows = problemsResult.data ?? [];
  const fullTanks = [...consumptionRows].reverse();
  const fuelEconomy: FuelEconomyPoint[] = fullTanks.slice(1).flatMap((record, index) => {
    const previous = fullTanks[index];
    if (!record.liters || record.liters <= 0 || record.mileage <= previous.mileage) return [];
    return [{
      date: record.fueled_at,
      value: round((record.mileage - previous.mileage) / record.liters),
    }];
  }).slice(-3);
  const averageConsumption = fuelEconomy.length > 0
    ? round(fuelEconomy.reduce((total, point) => total + point.value, 0) / fuelEconomy.length)
    : undefined;

  const other = otherExpenseRows.reduce((total, record) => {
    const expenseDate = record.purchased_at ?? record.installed_at ?? record.created_at.slice(0, 10);
    return expenseDate >= start && expenseDate < end ? total + (record.actual_cost ?? 0) : total;
  }, 0);
  const fuel = sum(fuelExpenseRows.map((record) => record.total_cost));
  const maintenance = sum(maintenanceExpenseRows.map((record) => record.total_cost));

  const nextImprovement: DashboardImprovement | undefined = improvementResult.data
    ? {
        id: improvementResult.data.id,
        title: improvementResult.data.title,
        priority: isPriority(improvementResult.data.priority) ? improvementResult.data.priority : 'medium',
        estimatedBudget: improvementResult.data.estimated_budget ?? undefined,
      }
    : undefined;
  const openProblems: DashboardProblem[] = problemRows
    .map((problem) => ({
      id: problem.id,
      title: problem.title,
      priority: isPriority(problem.priority) ? problem.priority : 'medium',
    }))
    .sort((left, right) => priorityWeight[right.priority] - priorityWeight[left.priority]);

  return {
    averageConsumption,
    fuelEconomy,
    monthlyExpenses: {
      fuel,
      maintenance,
      other,
      total: fuel + maintenance + other,
      monthLabel: formatMonthYear(start),
    },
    nextImprovement,
    openProblems,
  };
};
