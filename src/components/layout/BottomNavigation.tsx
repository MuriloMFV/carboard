import { CarFront, CircleDollarSign, History, Home, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../../types/navigation';
import './layout.css';

interface BottomNavigationProps {
  onQuickAction: () => void;
}

const navigationItems: NavigationItem[] = [
  { label: 'Início', path: '/home', icon: Home },
  { label: 'Meu Carro', path: '/vehicle', icon: CarFront },
  { label: 'Gastos', path: '/expenses', icon: CircleDollarSign },
  { label: 'Histórico', path: '/history', icon: History },
];

const NavigationLink = ({ item }: { item: NavigationItem }) => {
  const Icon = item.icon;
  return (
    <NavLink className="cb-nav-item" activeClassName="active" to={item.path} exact={item.path !== '/vehicle'}>
      <Icon size={21} aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );
};

export const BottomNavigation = ({ onQuickAction }: BottomNavigationProps) => (
  <nav className="cb-bottom-nav" aria-label="Navegação principal">
    <NavigationLink item={navigationItems[0]} />
    <NavigationLink item={navigationItems[1]} />
    <button className="cb-quick-action-trigger" type="button" aria-label="Adicionar registro" onClick={onQuickAction}>
      <Plus size={26} aria-hidden="true" />
    </button>
    <NavigationLink item={navigationItems[2]} />
    <NavigationLink item={navigationItems[3]} />
  </nav>
);
