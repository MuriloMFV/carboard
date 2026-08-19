import { IonSpinner } from '@ionic/react';
import { Card, SecondaryButton } from '../../../components/ui';

interface VehicleDataStateProps {
  error?: string | null;
  onRetry?: () => void;
}

export const VehicleDataState = ({ error, onRetry }: VehicleDataStateProps) => (
  <Card className="cb-vehicle-data-state" role={error ? 'alert' : 'status'}>
    {error ? (
      <>
        <strong>Não foi possível carregar os dados do veículo.</strong>
        <p>Verifique sua conexão e tente novamente.</p>
        {onRetry && <SecondaryButton onClick={onRetry}>Tentar novamente</SecondaryButton>}
      </>
    ) : (
      <>
        <IonSpinner name="crescent" />
        <p>Carregando dados do veículo...</p>
      </>
    )}
  </Card>
);
