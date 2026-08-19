import { IonContent, IonPage } from '@ionic/react';
import type { PropsWithChildren } from 'react';
import { BottomNavigation } from '../../../components/layout/BottomNavigation';
import { FocusedHeader } from '../../../components/layout/FocusedHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { formatMileage } from '../../../utils/formatters';
import { useVehicle } from '../VehicleContext';
import '../vehicle.css';

interface VehicleDetailShellProps extends PropsWithChildren {
  title: string;
  fallbackPath: string;
}

export const VehicleDetailShell = ({ title, fallbackPath, children }: VehicleDetailShellProps) => {
  const { selectedVehicle } = useVehicle();

  if (!selectedVehicle) return null;

  return (
    <IonPage className="cb-vehicle-page">
      <FocusedHeader title={title} fallbackPath={fallbackPath} />
      <IonContent className="cb-content cb-vehicle-content">
        <div className="cb-detail-vehicle-context">
          {selectedVehicle.nickname || `${selectedVehicle.brand} ${selectedVehicle.model}`} · {formatMileage(selectedVehicle.currentMileage)} km
        </div>
        <PageContainer className="cb-vehicle-container cb-vehicle-detail-container">
          {children}
        </PageContainer>
      </IonContent>
      <BottomNavigation />
    </IonPage>
  );
};
