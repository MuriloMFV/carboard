import { IonContent, IonPage } from '@ionic/react';
import { CarFront, Check, ClipboardCheck } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { PrimaryButton } from '../../components/ui';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import './onboarding.css';

export const SetupCompletePage = () => {
  const history = useHistory();
  const { selectedVehicle } = useVehicle();
  const vehicleName = selectedVehicle?.nickname || `${selectedVehicle?.brand} ${selectedVehicle?.model}`;

  return (
    <IonPage className="cb-onboarding-page cb-complete-page">
      <IonContent fullscreen className="cb-onboarding-content">
        <main className="cb-complete-layout">
          <div className="cb-complete-icon" aria-hidden="true">
            <ClipboardCheck size={36} />
            <CarFront size={25} />
          </div>
          <section className="cb-complete-intro">
            <h1>Preparando seu CarBoard</h1>
            <p>Organizando seus dados para a melhor experiência.</p>
          </section>
          <section className="cb-complete-checklist" aria-label="Resumo da configuração">
            <div><span>{vehicleName} configurado</span><Check size={16} aria-hidden="true" /></div>
            <div><span>Quilometragem sincronizada</span><Check size={16} aria-hidden="true" /></div>
            <div><span>Componentes preparados</span><Check size={16} aria-hidden="true" /></div>
          </section>
          <div className="cb-complete-status">
            <span>Tudo pronto...</span>
            <div><i /></div>
          </div>
          <PrimaryButton className="cb-complete-button" onClick={() => history.replace('/home')}>Ir para o CarBoard</PrimaryButton>
        </main>
      </IonContent>
    </IonPage>
  );
};
