export interface NextMaintenanceInput {
  lastServiceMileage?: number;
  lastServiceDate?: string;
  intervalKm?: number;
  intervalMonths?: number;
  currentMileage: number;
}

export interface NextMaintenanceResult {
  nextMileage?: number;
  nextDate?: string;
  remainingKm?: number;
}

const addMonths = (date: string, months: number): string => {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result.toISOString().slice(0, 10);
};

export const calculateNextMaintenance = ({
  lastServiceMileage,
  lastServiceDate,
  intervalKm,
  intervalMonths,
  currentMileage,
}: NextMaintenanceInput): NextMaintenanceResult => {
  const nextMileage = lastServiceMileage !== undefined && intervalKm !== undefined
    ? lastServiceMileage + intervalKm
    : undefined;
  const nextDate = lastServiceDate && intervalMonths !== undefined
    ? addMonths(lastServiceDate, intervalMonths)
    : undefined;

  return {
    nextMileage,
    nextDate,
    remainingKm: nextMileage !== undefined ? nextMileage - currentMileage : undefined,
  };
};
