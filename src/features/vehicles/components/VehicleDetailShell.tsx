import { IonContent, IonPage } from '@ionic/react';
import { useState, type PropsWithChildren } from 'react';
import { BottomNavigation } from '../../../components/layout/BottomNavigation';
import { FocusedHeader } from '../../../components/layout/FocusedHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { QuickActionSheet } from '../../../components/ui';
import { formatMileage } from '../../../utils/formatters';
import { mockVehicle } from '../mocks';
import '../vehicle.css';

interface VehicleDetailShellProps extends PropsWithChildren {
  title: string;
  fallbackPath: string;
}

export const VehicleDetailShell = ({ title, fallbackPath, children }: VehicleDetailShellProps) => {
  const [isQuickActionOpen, setQuickActionOpen] = useState(false);

  return (
    <IonPage className="cb-vehicle-page">
      <FocusedHeader title={title} fallbackPath={fallbackPath} />
      <IonContent className="cb-content cb-vehicle-content">
        <div className="cb-detail-vehicle-context">
          {mockVehicle.nickname} · {formatMileage(mockVehicle.currentMileage)} km
        </div>
        <PageContainer className="cb-vehicle-container cb-vehicle-detail-container">
          {children}
        </PageContainer>
      </IonContent>
      <BottomNavigation onQuickAction={() => setQuickActionOpen(true)} />
      <QuickActionSheet isOpen={isQuickActionOpen} onDismiss={() => setQuickActionOpen(false)} />
    </IonPage>
  );
};
