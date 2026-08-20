import { CarFront, Home, Plus, ReceiptText, WalletCards } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../../types/navigation';
import { useAppShell } from './AppShellContext';
import './layout.css';

const navigationItems: NavigationItem[] = [
  { label: 'Início', path: '/home', icon: Home },
  { label: 'Meu Carro', path: '/vehicle', icon: CarFront },
  { label: 'Gastos', path: '/expenses', icon: WalletCards },
  { label: 'Histórico', path: '/history', icon: ReceiptText },
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

export const BottomNavigation = () => {
  const { openQuickActions } = useAppShell();

  return (
    <nav className="cb-bottom-nav" aria-label="Navegação principal">
      <NavigationLink item={navigationItems[0]} />
      <NavigationLink item={navigationItems[1]} />
      <button className="cb-quick-action-trigger" type="button" aria-label="Adicionar registro" onClick={openQuickActions}>
        <Plus size={26} aria-hidden="true" />
      </button>
      <NavigationLink item={navigationItems[2]} />
      <NavigationLink item={navigationItems[3]} />
    </nav>
  );
};
