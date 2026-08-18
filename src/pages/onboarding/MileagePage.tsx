import { IonContent, IonPage } from '@ionic/react';
import type { FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { MileageField } from '../../components/forms';
import { PrimaryButton } from '../../components/ui';
import { OnboardingStepHeader } from '../../features/onboarding/components/OnboardingStepHeader';
import { useOnboarding } from '../../features/onboarding/OnboardingContext';
import './onboarding.css';

const formatMileageInput = (mileage?: number): string =>
  new Intl.NumberFormat('pt-BR').format(mileage ?? 0);

export const MileagePage = () => {
  const history = useHistory();
  const { data, setMileage } = useOnboarding();

  const changeMileage = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 7);
    setMileage(digits ? Number(digits) : undefined);
  };

  const continueOnboarding = (event: FormEvent) => {
    event.preventDefault();
    history.push('/onboarding/initial-check');
  };

  return (
    <IonPage className="cb-onboarding-page cb-mileage-page">
      <OnboardingStepHeader step={2} fallbackPath="/onboarding/vehicle" progress="line" />
      <IonContent className="cb-onboarding-content">
        <form className="cb-mileage-layout" onSubmit={continueOnboarding}>
          <section className="cb-onboarding-intro cb-onboarding-intro--centered">
            <h1>Qual a quilometragem atual?</h1>
            <p>Usaremos esse valor para acompanhar manutenções e o estado das peças.</p>
          </section>

          <div className="cb-mileage-entry">
            <MileageField
              label="Quilometragem atual"
              name="mileage"
              value={formatMileageInput(data.mileage)}
              onChange={(event) => changeMileage(event.target.value)}
              aria-describedby="mileage-hint"
            />
            <span aria-hidden="true">km</span>
          </div>
          <p id="mileage-hint" className="cb-mileage-hint">Você poderá atualizar isso a qualquer momento.</p>
          <PrimaryButton type="submit">Continuar</PrimaryButton>
        </form>
      </IonContent>
    </IonPage>
  );
};
