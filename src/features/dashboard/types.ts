export interface FuelEconomyPoint {
  date: string;
  value: number;
}

export interface MonthlyExpenses {
  fuel: number;
  maintenance: number;
  other: number;
  total: number;
  monthLabel: string;
}

export interface DashboardImprovement {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  estimatedBudget?: number;
}

export interface DashboardProblem {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DashboardData {
  averageConsumption?: number;
  fuelEconomy: FuelEconomyPoint[];
  monthlyExpenses: MonthlyExpenses;
  nextImprovement?: DashboardImprovement;
  openProblems: DashboardProblem[];
}
