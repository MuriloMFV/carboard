import maintenanceAnimation from '../../../assets/lottie/maintenance.json';
import refuelingAnimation from '../../../assets/lottie/refueling.json';
import mileageAnimation from '../../../assets/lottie/mileage.json';
import successAnimation from '../../../assets/lottie/success.json';
import type { SuccessFeedbackType } from '../types';

export const recordSuccessAnimations: Record<SuccessFeedbackType, object> = {
  maintenance: maintenanceAnimation,
  fuel: refuelingAnimation,
  mileage: mileageAnimation,
  generic: successAnimation,
};
