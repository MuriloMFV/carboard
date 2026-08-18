import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { InitialVehicleCheck, OnboardingData, OnboardingVehicleData } from './types';

interface OnboardingContextValue {
  data: OnboardingData;
  updateVehicle: (vehicle: Partial<OnboardingVehicleData>) => void;
  setMileage: (mileage?: number) => void;
  updateInitialCheck: (check: Partial<InitialVehicleCheck>) => void;
}

const initialData: OnboardingData = {
  vehicle: {
    brand: 'Volkswagen',
    model: 'Gol',
    year: '2005',
    engineVersion: '1.0 8V',
    nickname: '',
  },
  initialCheck: {},
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export const OnboardingProvider = ({ children }: PropsWithChildren) => {
  const [data, setData] = useState<OnboardingData>(initialData);

  const value = useMemo<OnboardingContextValue>(() => ({
    data,
    updateVehicle: (vehicle) => setData((current) => ({
      ...current,
      vehicle: { ...current.vehicle, ...vehicle },
    })),
    setMileage: (mileage) => setData((current) => ({ ...current, mileage })),
    updateInitialCheck: (check) => setData((current) => ({
      ...current,
      initialCheck: { ...current.initialCheck, ...check },
    })),
  }), [data]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
};
