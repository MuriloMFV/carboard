import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import '../features/auth/auth.css';

export const FlowLoadingPage = () => (
  <IonPage>
    <IonContent fullscreen>
      <main className="cb-flow-loading" aria-live="polite">
        <div>
          <IonSpinner name="crescent" />
          <p>Carregando seu CarBoard...</p>
        </div>
      </main>
    </IonContent>
  </IonPage>
);
