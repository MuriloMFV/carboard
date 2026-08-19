import { IonHeader, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { ArrowLeft } from 'lucide-react';
import './layout.css';

interface FocusedHeaderProps {
  title: string;
  fallbackPath?: string;
  context?: string;
}

export const FocusedHeader = ({ title, fallbackPath = '/home', context }: FocusedHeaderProps) => {
  const router = useIonRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.goBack();
      return;
    }
    router.push(fallbackPath, 'back');
  };

  return (
    <IonHeader className={`cb-focused-header${context ? ' cb-focused-header--with-context' : ''}`}>
      <IonToolbar className="cb-toolbar">
        <button slot="start" className="cb-header-button" type="button" aria-label="Voltar" onClick={handleBack}>
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <IonTitle>{title}</IonTitle>
      </IonToolbar>
      {context && <div className="cb-focused-context">{context}</div>}
    </IonHeader>
  );
};
