interface FuelValues {
  totalCost?: number;
  liters?: number;
  pricePerLiter?: number;
}

const isValid = (value?: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const round = (value: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const calculateFuelValues = ({ totalCost, liters, pricePerLiter }: FuelValues): FuelValues => {
  if (!isValid(totalCost) && isValid(liters) && isValid(pricePerLiter)) {
    return { totalCost: round(liters * pricePerLiter, 2), liters, pricePerLiter };
  }

  if (!isValid(liters) && isValid(totalCost) && isValid(pricePerLiter)) {
    return { totalCost, liters: round(totalCost / pricePerLiter, 2), pricePerLiter };
  }

  if (!isValid(pricePerLiter) && isValid(totalCost) && isValid(liters)) {
    return { totalCost, liters, pricePerLiter: round(totalCost / liters, 3) };
  }

  return { totalCost, liters, pricePerLiter };
};

export const calculateFuelEconomy = (
  previousFullTankMileage: number | undefined,
  mileage: number,
  liters: number | undefined,
  fullTank: boolean,
) => {
  if (!fullTank || previousFullTankMileage === undefined || !isValid(liters) || mileage <= previousFullTankMileage) {
    return undefined;
  }

  const distance = mileage - previousFullTankMileage;
  return { distance, kmPerLiter: round(distance / liters, 1) };
};
