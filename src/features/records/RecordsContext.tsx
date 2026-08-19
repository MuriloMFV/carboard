import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { mockVehicle } from '../vehicles/mocks';
import { shouldUpdateVehicleMileage } from './domain/shouldUpdateVehicleMileage';
import { mockPreviousFullTank } from './mocks/records';
import type {
  FuelRecord,
  ImprovementRecord,
  MaintenanceRecord,
  MileageRecord,
  ProblemRecord,
  VehicleRecord,
} from './types';

interface RecordsContextValue {
  records: VehicleRecord[];
  currentMileage: number;
  addMaintenance: (record: MaintenanceRecord) => void;
  addFuel: (record: FuelRecord) => void;
  addProblem: (record: ProblemRecord) => void;
  addImprovement: (record: ImprovementRecord) => void;
  updateMileage: (nextMileage: number) => MileageRecord | undefined;
  previousFullTankMileage?: number;
}

const RecordsContext = createContext<RecordsContextValue | undefined>(undefined);

export const createRecordId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const RecordsProvider = ({ children }: PropsWithChildren) => {
  const [records, setRecords] = useState<VehicleRecord[]>([mockPreviousFullTank]);
  const [currentMileage, setCurrentMileage] = useState(mockVehicle.currentMileage);

  const append = (record: VehicleRecord) => setRecords((current) => [...current, record]);

  const value = useMemo<RecordsContextValue>(() => {
    const previousFullTankMileage = [...records]
      .reverse()
      .find((record): record is FuelRecord => record.type === 'fuel' && record.fullTank)?.mileage;

    return {
      records,
      currentMileage,
      addMaintenance: append,
      addFuel: append,
      addProblem: append,
      addImprovement: append,
      previousFullTankMileage,
      updateMileage: (nextMileage) => {
        if (!shouldUpdateVehicleMileage(currentMileage, nextMileage)) return undefined;
        const record: MileageRecord = {
          id: createRecordId('mileage'),
          type: 'mileage',
          vehicleId: mockVehicle.id,
          date: new Date().toISOString().slice(0, 10),
          mileage: nextMileage,
          previousMileage: currentMileage,
        };
        setCurrentMileage(nextMileage);
        append(record);
        return record;
      },
    };
  }, [currentMileage, records]);

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
};

export const useRecords = () => {
  const context = useContext(RecordsContext);
  if (!context) throw new Error('useRecords must be used within RecordsProvider');
  return context;
};
