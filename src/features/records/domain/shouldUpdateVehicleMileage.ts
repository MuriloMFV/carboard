export const shouldUpdateVehicleMileage = (currentMileage: number, nextMileage: number): boolean =>
  Number.isFinite(nextMileage) && nextMileage > currentMileage;
