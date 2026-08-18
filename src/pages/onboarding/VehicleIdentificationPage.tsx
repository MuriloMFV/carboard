import { IonContent, IonPage } from '@ionic/react';
import { ArrowRight, CarFront, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { FormField, SelectField } from '../../components/forms';
import { Card, Divider, PrimaryButton } from '../../components/ui';
import { OnboardingStepHeader } from '../../features/onboarding/components/OnboardingStepHeader';
import { useOnboarding } from '../../features/onboarding/OnboardingContext';
import { brandOptions, engineOptions, modelOptions, yearOptions } from '../../features/onboarding/options';
import './onboarding.css';

export const VehicleIdentificationPage = () => {
  const history = useHistory();
  const { data, updateVehicle } = useOnboarding();
  const { vehicle } = data;

  const continueOnboarding = (event: FormEvent) => {
    event.preventDefault();
    history.push('/onboarding/mileage');
  };

  return (
    <IonPage className="cb-onboarding-page">
      <OnboardingStepHeader step={1} fallbackPath="/onboarding" />
      <IonContent className="cb-onboarding-content cb-onboarding-form-content">
        <main className="cb-onboarding-layout cb-vehicle-step">
          <section className="cb-onboarding-intro">
            <h1>Vamos conhecer seu carro</h1>
            <p>Comece pelas informações básicas. Você poderá editar tudo depois.</p>
          </section>

          <form id="vehicle-form" onSubmit={continueOnboarding}>
            <Card className="cb-vehicle-form">
              <FormField
                label="Marca"
                name="brand"
                list="brand-options"
                value={vehicle.brand}
                onChange={(event) => updateVehicle({ brand: event.target.value })}
                endAdornment={<Search size={20} />}
                required
              />
              <datalist id="brand-options">
                {brandOptions.map((option) => <option key={option.value} value={option.value} />)}
              </datalist>
              <SelectField
                label="Modelo"
                name="model"
                value={vehicle.model}
                options={modelOptions}
                onChange={(event) => updateVehicle({ model: event.target.value })}
                required
              />
              <SelectField
                label="Ano"
                name="year"
                value={vehicle.year}
                options={yearOptions}
                onChange={(event) => updateVehicle({ year: event.target.value })}
                required
              />
              <SelectField
                label="Motor / Versão (Opcional)"
                name="engineVersion"
                value={vehicle.engineVersion}
                options={engineOptions}
                onChange={(event) => updateVehicle({ engineVersion: event.target.value })}
                labelAction={<button className="cb-field-text-action" type="button" onClick={() => updateVehicle({ engineVersion: '' })}>Não sei</button>}
              />
              <Divider />
              <FormField
                label="Apelido do carro (Opcional)"
                name="nickname"
                placeholder="Ex: Projeto Gol"
                value={vehicle.nickname}
                onChange={(event) => updateVehicle({ nickname: event.target.value })}
              />
            </Card>
          </form>

          <p className="cb-plate-coming-soon"><CarFront size={17} aria-hidden="true" /> Buscar pela placa — Em breve</p>
        </main>
      </IonContent>
      <footer className="cb-onboarding-footer">
        <PrimaryButton form="vehicle-form" type="submit">Continuar <ArrowRight size={19} aria-hidden="true" /></PrimaryButton>
      </footer>
    </IonPage>
  );
};
