export interface Vehicle {
  id: string;
  userId?: string;
  nickname?: string;
  brand: string;
  model: string;
  year: number;
  engine?: string;
  version?: string;
  plate?: string;
  fuelType?: string;
  currentMileage: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ComponentStatus = 'good' | 'attention' | 'critical' | 'no_data';
export type ProblemPriority = 'low' | 'medium' | 'high';
export type ProblemStatus = 'open' | 'monitoring' | 'resolved';
export type ImprovementStatus = 'planned' | 'purchased' | 'installed';
