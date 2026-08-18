import { IonContent, IonPage } from '@ionic/react';
import { useState, type PropsWithChildren } from 'react';
import { AppHeader } from '../../../components/layout/AppHeader';
import { BottomNavigation } from '../../../components/layout/BottomNavigation';
import { PageContainer } from '../../../components/layout/PageContainer';
import { QuickActionSheet } from '../../../components/ui';
import { VehicleHeader } from '../../../components/vehicle/VehicleHeader';
import { mockVehicle } from '../mocks';
import { VehicleTabs } from './VehicleTabs';
import '../vehicle.css';

export const VehicleMainShell = ({ children }: PropsWithChildren) => {
  const [isQuickActionOpen, setQuickActionOpen] = useState(false);

  return (
    <IonPage className="cb-vehicle-page">
      <AppHeader />
      <IonContent className="cb-content cb-vehicle-content">
        <PageContainer className="cb-vehicle-container">
          <VehicleHeader vehicle={mockVehicle} showImage />
          <VehicleTabs />
          {children}
        </PageContainer>
      </IonContent>
      <BottomNavigation onQuickAction={() => setQuickActionOpen(true)} />
      <QuickActionSheet isOpen={isQuickActionOpen} onDismiss={() => setQuickActionOpen(false)} />
    </IonPage>
  );
};
