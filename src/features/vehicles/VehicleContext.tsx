import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import type { Vehicle } from '../../types';
import { useAuth } from '../auth/AuthContext';
import type { OnboardingData } from '../onboarding/types';
import type { VehicleComponent, VehicleSystem } from './types';
import { createVehicleFromOnboarding, listVehicles, loadVehicleData } from './vehicle.service';

interface VehicleContextValue {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  vehicleSystems: VehicleSystem[];
  vehicleComponents: VehicleComponent[];
  isVehicleDataLoading: boolean;
  vehicleDataError: string | null;
  selectVehicle: (vehicleId: string) => void;
  createVehicle: (data: OnboardingData) => Promise<Vehicle>;
  refreshVehicles: () => Promise<void>;
  refreshVehicleData: () => Promise<void>;
  updateVehicleMileage: (vehicleId: string, mileage: number) => void;
}

const VehicleContext = createContext<VehicleContextValue | undefined>(undefined);

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Não foi possível carregar o veículo.';

export const VehicleProvider = ({ children }: PropsWithChildren) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleSystems, setVehicleSystems] = useState<VehicleSystem[]>([]);
  const [vehicleComponents, setVehicleComponents] = useState<VehicleComponent[]>([]);
  const [isVehicleDataLoading, setVehicleDataLoading] = useState(false);
  const [vehicleDataError, setVehicleDataError] = useState<string | null>(null);
  const [loadedVehicleDataId, setLoadedVehicleDataId] = useState<string | null>(null);
  const vehicleDataRequest = useRef(0);

  const refreshVehicles = useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setSelectedVehicleId(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const nextVehicles = await listVehicles();
      setVehicles(nextVehicles);
      setSelectedVehicleId((current) =>
        nextVehicles.some((vehicle) => vehicle.id === current) ? current : (nextVehicles[0]?.id ?? null),
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) return;
    void refreshVehicles();
  }, [isAuthLoading, refreshVehicles]);

  const createVehicle = useCallback(async (data: OnboardingData) => {
    const vehicle = await createVehicleFromOnboarding(data);
    setVehicles((current) => [...current, vehicle]);
    setSelectedVehicleId(vehicle.id);
    return vehicle;
  }, []);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;

  const updateVehicleMileage = useCallback((vehicleId: string, mileage: number) => {
    setVehicles((current) => current.map((vehicle) =>
      vehicle.id === vehicleId && mileage > vehicle.currentMileage
        ? { ...vehicle, currentMileage: mileage }
        : vehicle,
    ));
  }, []);

  const refreshVehicleData = useCallback(async () => {
    const requestId = ++vehicleDataRequest.current;
    if (!selectedVehicle) {
      setVehicleSystems([]);
      setVehicleComponents([]);
      setVehicleDataError(null);
      setLoadedVehicleDataId(null);
      setVehicleDataLoading(false);
      return;
    }

    setVehicleDataLoading(true);
    setVehicleDataError(null);
    setLoadedVehicleDataId((current) => current === selectedVehicle.id ? current : null);
    try {
      const data = await loadVehicleData(selectedVehicle.id, selectedVehicle.currentMileage);
      if (requestId !== vehicleDataRequest.current) return;
      setVehicleSystems(data.systems);
      setVehicleComponents(data.components);
      setLoadedVehicleDataId(selectedVehicle.id);
    } catch (loadError) {
      if (requestId !== vehicleDataRequest.current) return;
      setVehicleDataError(getErrorMessage(loadError));
    } finally {
      if (requestId === vehicleDataRequest.current) setVehicleDataLoading(false);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    void refreshVehicleData();
  }, [refreshVehicleData]);

  const value = useMemo<VehicleContextValue>(() => ({
    vehicles,
    selectedVehicle,
    isLoading: isAuthLoading || isLoading,
    error,
    vehicleSystems,
    vehicleComponents,
    isVehicleDataLoading: isVehicleDataLoading
      || Boolean(selectedVehicle && loadedVehicleDataId !== selectedVehicle.id && !vehicleDataError),
    vehicleDataError,
    selectVehicle: setSelectedVehicleId,
    createVehicle,
    refreshVehicles,
    refreshVehicleData,
    updateVehicleMileage,
  }), [
    createVehicle,
    error,
    isAuthLoading,
    isLoading,
    isVehicleDataLoading,
    loadedVehicleDataId,
    refreshVehicleData,
    refreshVehicles,
    selectedVehicle,
    vehicleComponents,
    vehicleDataError,
    vehicleSystems,
    vehicles,
    updateVehicleMileage,
  ]);

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
};

export const useVehicle = (): VehicleContextValue => {
  const context = useContext(VehicleContext);
  if (!context) throw new Error('useVehicle must be used within VehicleProvider');
  return context;
};
