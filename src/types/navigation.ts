import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface QuickAction {
  label: string;
  path?: string;
  icon: LucideIcon;
}
