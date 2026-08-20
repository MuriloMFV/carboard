import { IonContent, IonMenu } from '@ionic/react';
import {
  CarFront,
  Home,
  LogOut,
  ReceiptText,
  Settings,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { useState, type RefObject } from 'react';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { APP_CONTENT_ID, APP_MENU_ID } from './appShell.constants';
import './layout.css';

interface AppSideMenuProps {
  menuRef: RefObject<HTMLIonMenuElement>;
  disabled: boolean;
  onNavigate: (path: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

const navigationItems = [
  { label: 'Início', path: '/home', icon: Home },
  { label: 'Meu Carro', path: '/vehicle', icon: CarFront },
  { label: 'Gastos', path: '/expenses', icon: WalletCards },
  { label: 'Histórico', path: '/history', icon: ReceiptText },
];

export const AppSideMenu = ({ menuRef, disabled, onNavigate, onSignOut }: AppSideMenuProps) => {
  const { selectedVehicle } = useVehicle();
  const [isSigningOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const vehicleName = selectedVehicle?.nickname
    || [selectedVehicle?.brand, selectedVehicle?.model].filter(Boolean).join(' ')
    || 'Veículo atual';
  const vehicleDescription = selectedVehicle
    ? `${selectedVehicle.brand} ${selectedVehicle.model}`
    : 'Nenhum veículo selecionado';

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setSigningOut(true);
    setLogoutError('');
    try {
      await onSignOut();
    } catch {
      setLogoutError('Não foi possível sair. Tente novamente.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <IonMenu
      ref={menuRef}
      className="cb-side-menu"
      contentId={APP_CONTENT_ID}
      menuId={APP_MENU_ID}
      side="start"
      type="overlay"
      disabled={disabled}
      swipeGesture={!disabled}
    >
      <IonContent className="cb-side-menu__content">
        <div className="cb-side-menu__layout">
          <header className="cb-side-menu__header">
            <strong className="cb-side-menu__brand">CarBoard</strong>
            <div className="cb-side-menu__vehicle">
              <span>VEÍCULO ATUAL</span>
              <strong>{vehicleName}</strong>
              <small>{vehicleDescription}</small>
            </div>
          </header>

          <nav className="cb-side-menu__section" aria-label="Navegação do menu">
            <span className="cb-side-menu__section-title">NAVEGAÇÃO</span>
            {navigationItems.map(({ label, path, icon: Icon }) => (
              <button type="button" key={path} onClick={() => void onNavigate(path)}>
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <section className="cb-side-menu__section" aria-labelledby="account-menu-title">
            <span id="account-menu-title" className="cb-side-menu__section-title">CONTA</span>
            <button type="button" disabled aria-disabled="true">
              <UserRound size={20} aria-hidden="true" />
              <span>Perfil <small>Em breve</small></span>
            </button>
            <button type="button" disabled aria-disabled="true">
              <Settings size={20} aria-hidden="true" />
              <span>Configurações <small>Em breve</small></span>
            </button>
          </section>

          <footer className="cb-side-menu__footer">
            {logoutError && <p role="alert">{logoutError}</p>}
            <button type="button" onClick={() => void handleSignOut()} disabled={isSigningOut}>
              <LogOut size={20} aria-hidden="true" />
              <span>{isSigningOut ? 'Saindo…' : 'Sair'}</span>
            </button>
          </footer>
        </div>
      </IonContent>
    </IonMenu>
  );
};
