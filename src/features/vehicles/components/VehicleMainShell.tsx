import { IonContent, IonPage } from '@ionic/react';
import type { PropsWithChildren } from 'react';
import { AppHeader } from '../../../components/layout/AppHeader';
import { BottomNavigation } from '../../../components/layout/BottomNavigation';
import { PageContainer } from '../../../components/layout/PageContainer';
import { VehicleHeader } from '../../../components/vehicle/VehicleHeader';
import { useVehicle } from '../VehicleContext';
import { VehicleTabs } from './VehicleTabs';
import '../vehicle.css';

export const VehicleMainShell = ({ children }: PropsWithChildren) => {
  const { selectedVehicle } = useVehicle();

  if (!selectedVehicle) return null;

  return (
    <IonPage className="cb-vehicle-page">
      <AppHeader />
      <IonContent className="cb-content cb-vehicle-content">
        <PageContainer className="cb-vehicle-container">
          <VehicleHeader vehicle={selectedVehicle} showImage />
          <VehicleTabs />
          {children}
        </PageContainer>
      </IonContent>
      <BottomNavigation />
    </IonPage>
  );
};
