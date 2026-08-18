import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { Bell, Menu } from 'lucide-react';
import './layout.css';

export const AppHeader = () => (
  <IonHeader className="cb-app-header">
    <IonToolbar className="cb-toolbar">
      <button slot="start" className="cb-header-button" type="button" aria-label="Abrir menu">
        <Menu size={22} aria-hidden="true" />
      </button>
      <IonTitle>CarBoard</IonTitle>
      <button slot="end" className="cb-header-button" type="button" aria-label="Ver notificações">
        <Bell size={21} aria-hidden="true" />
      </button>
    </IonToolbar>
  </IonHeader>
);
