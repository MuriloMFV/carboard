export type OilChangeAnswer = 'recently' | 'months_ago' | 'due_soon' | 'unknown';
export type TireCondition = 'good' | 'mid_life' | 'attention' | 'unknown';
export type CurrentProblemAnswer = 'no' | 'yes';

export interface OnboardingVehicleData {
  brand: string;
  model: string;
  year: string;
  engineVersion: string;
  nickname: string;
}

export interface InitialVehicleCheck {
  oilChange?: OilChangeAnswer;
  tireCondition?: TireCondition;
  hasCurrentProblem?: CurrentProblemAnswer;
}

export interface OnboardingData {
  vehicle: OnboardingVehicleData;
  mileage?: number;
  initialCheck: InitialVehicleCheck;
}
