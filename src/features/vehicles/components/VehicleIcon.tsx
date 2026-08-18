import {
  AirVent,
  CarFront,
  CircleDot,
  Disc3,
  Droplet,
  Fuel,
  Gauge,
  Lightbulb,
  Settings,
  SlidersVertical,
  Sparkles,
  Thermometer,
  Zap,
} from 'lucide-react';
import type { VehicleIconName } from '../types';

const icons = {
  air: AirVent,
  brakes: Disc3,
  cooling: Thermometer,
  electrical: Zap,
  engine: CarFront,
  filter: Gauge,
  fuel: Fuel,
  lighting: Lightbulb,
  oil: Droplet,
  spark: Sparkles,
  suspension: Settings,
  tires: CircleDot,
  transmission: SlidersVertical,
} satisfies Record<VehicleIconName, typeof CarFront>;

interface VehicleIconProps {
  name: VehicleIconName;
  size?: number;
}

export const VehicleIcon = ({ name, size = 21 }: VehicleIconProps) => {
  const Icon = icons[name];
  return <Icon size={size} aria-hidden="true" />;
};
