import { IonContent, IonPage } from '@ionic/react';
import type { PropsWithChildren } from 'react';
import { FocusedHeader } from '../../../components/layout/FocusedHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { formatMileage } from '../../../utils/formatters';
import { mockVehicle } from '../../vehicles/mocks';
import { useRecords } from '../RecordsContext';
import '../records.css';

interface RecordFormShellProps extends PropsWithChildren {
  title: string;
}

export const RecordFormShell = ({ title, children }: RecordFormShellProps) => {
  const { currentMileage } = useRecords();

  return (
    <IonPage className="cb-record-page">
      <FocusedHeader
        title={title}
        fallbackPath="/home"
        context={`${mockVehicle.nickname} · ${formatMileage(currentMileage)} km`}
      />
      <IonContent className="cb-content cb-record-content">
        <PageContainer className="cb-record-container">{children}</PageContainer>
      </IonContent>
    </IonPage>
  );
};
