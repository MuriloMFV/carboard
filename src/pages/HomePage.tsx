import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, QuickActionSheet, StatusText } from '../components/ui';
import { VehicleHeader } from '../components/vehicle/VehicleHeader';
import { mockVehicle } from '../features/vehicles/mocks';

export const HomePage = () => {
  const [isQuickActionOpen, setQuickActionOpen] = useState(false);

  return (
    <IonPage>
      <AppHeader />
      <IonContent className="cb-content">
        <PageContainer className="cb-stack">
          <VehicleHeader vehicle={mockVehicle} />
          <Card>
            <h2>Visão geral</h2>
            <p className="cb-placeholder-copy">
              A saúde, as próximas manutenções e os alertas do veículo aparecerão aqui.
            </p>
          </Card>
          <Card>
            <h3>Status do veículo</h3>
            <StatusText status="no_data" />
            <p className="cb-placeholder-copy">Os dados serão exibidos quando os primeiros registros forem adicionados.</p>
          </Card>
        </PageContainer>
      </IonContent>
      <BottomNavigation onQuickAction={() => setQuickActionOpen(true)} />
      <QuickActionSheet isOpen={isQuickActionOpen} onDismiss={() => setQuickActionOpen(false)} />
    </IonPage>
  );
};
