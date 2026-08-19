import { IonContent, IonPage } from '@ionic/react';
import { AppHeader } from '../components/layout/AppHeader';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, SecondaryButton, StatusText } from '../components/ui';
import { VehicleHeader } from '../components/vehicle/VehicleHeader';
import { useAuth } from '../features/auth/AuthContext';
import { useVehicle } from '../features/vehicles/VehicleContext';

export const HomePage = () => {
  const { signOut } = useAuth();
  const { selectedVehicle } = useVehicle();

  if (!selectedVehicle) return null;

  return (
    <IonPage>
      <AppHeader />
      <IonContent className="cb-content">
        <PageContainer className="cb-stack">
          <VehicleHeader vehicle={selectedVehicle} />
          <Card>
            <h2>Visão geral</h2>
            <p className="cb-placeholder-copy">
              A saúde, as próximas manutenções e os alertas do veículo aparecerão aqui.
            </p>
          </Card>
          <SecondaryButton onClick={() => void signOut()}>Sair da conta</SecondaryButton>
          <Card>
            <h3>Status do veículo</h3>
            <StatusText status="no_data" />
            <p className="cb-placeholder-copy">Os dados serão exibidos quando os primeiros registros forem adicionados.</p>
          </Card>
        </PageContainer>
      </IonContent>
      <BottomNavigation />
    </IonPage>
  );
};
