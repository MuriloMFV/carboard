import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { Bell, Menu } from 'lucide-react';
import { useAppShell } from './AppShellContext';
import './layout.css';

interface AppHeaderProps {
  notificationCount?: number;
}

export const AppHeader = ({ notificationCount = 0 }: AppHeaderProps) => {
  const { openSideMenu } = useAppShell();

  return (
    <IonHeader className="cb-app-header">
      <IonToolbar className="cb-toolbar">
        <button slot="start" className="cb-header-button" type="button" aria-label="Abrir menu" onClick={openSideMenu}>
          <Menu size={22} aria-hidden="true" />
        </button>
        <IonTitle>CarBoard</IonTitle>
        <button slot="end" className="cb-header-button cb-notification-button" type="button" aria-label="Ver notificações">
          <Bell size={21} aria-hidden="true" />
          {notificationCount > 0 && (
            <span className="cb-notification-badge" aria-label={`${notificationCount} alertas`}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </IonToolbar>
    </IonHeader>
  );
};
