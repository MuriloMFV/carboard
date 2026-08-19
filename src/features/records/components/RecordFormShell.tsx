import { IonContent, IonPage } from '@ionic/react';
import type { PropsWithChildren } from 'react';
import { FocusedHeader } from '../../../components/layout/FocusedHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { formatMileage } from '../../../utils/formatters';
import { useVehicle } from '../../vehicles/VehicleContext';
import '../records.css';

interface RecordFormShellProps extends PropsWithChildren {
  title: string;
}

export const RecordFormShell = ({ title, children }: RecordFormShellProps) => {
  const { selectedVehicle } = useVehicle();
  const vehicleName = selectedVehicle?.nickname
    || [selectedVehicle?.brand, selectedVehicle?.model].filter(Boolean).join(' ')
    || 'Meu carro';

  return (
    <IonPage className="cb-record-page">
      <FocusedHeader
        title={title}
        fallbackPath="/home"
        context={selectedVehicle ? `${vehicleName} · ${formatMileage(selectedVehicle.currentMileage)} km` : vehicleName}
      />
      <IonContent className="cb-content cb-record-content">
        <PageContainer className="cb-record-container">{children}</PageContainer>
      </IonContent>
    </IonPage>
  );
};
