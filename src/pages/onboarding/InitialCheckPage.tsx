import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { Divider, PrimaryButton } from '../../components/ui';
import { OnboardingStepHeader } from '../../features/onboarding/components/OnboardingStepHeader';
import { SelectionCard } from '../../features/onboarding/components/SelectionCard';
import { useOnboarding } from '../../features/onboarding/OnboardingContext';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { currentProblemOptions, oilChangeOptions, tireConditionOptions } from '../../features/onboarding/options';
import type { TireCondition } from '../../features/onboarding/types';
import './onboarding.css';

const tireIcon: Record<TireCondition, 'good' | 'mid' | 'danger' | 'unknown'> = {
  good: 'good',
  mid_life: 'mid',
  attention: 'danger',
  unknown: 'unknown',
};

export const InitialCheckPage = () => {
  const history = useHistory();
  const { data, updateInitialCheck } = useOnboarding();
  const { createVehicle } = useVehicle();
  const { initialCheck } = data;
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async () => {
    if (isSubmitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createVehicle(data);
      history.replace('/onboarding/complete');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : '';
      setError(message.toLowerCase().includes('fetch')
        ? 'Sem conexão. Seus dados continuam preenchidos; tente novamente.'
        : 'Não foi possível salvar seu veículo. Revise os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage className="cb-onboarding-page cb-initial-check-page">
      <OnboardingStepHeader step={3} fallbackPath="/onboarding/mileage" progress="segments" />
      <IonContent className="cb-onboarding-content">
        <main className="cb-onboarding-layout cb-check-layout">
          <section className="cb-onboarding-intro">
            <h1>Só mais algumas informações</h1>
            <p>Isso ajuda o CarBoard a começar com recomendações mais úteis.</p>
          </section>

          <section className="cb-check-section">
            <h2>Você lembra quando trocou o óleo pela última vez?</h2>
            <div className="cb-selection-list" role="radiogroup" aria-label="Última troca de óleo">
              {oilChangeOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  label={option.label}
                  selected={initialCheck.oilChange === option.value}
                  onSelect={() => updateInitialCheck({ oilChange: option.value })}
                />
              ))}
            </div>
          </section>

          <Divider />

          <section className="cb-check-section">
            <h2>Como estão os pneus?</h2>
            <div className="cb-selection-list" role="radiogroup" aria-label="Estado dos pneus">
              {tireConditionOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  label={option.label}
                  icon={tireIcon[option.value]}
                  stacked
                  selected={initialCheck.tireCondition === option.value}
                  onSelect={() => updateInitialCheck({ tireCondition: option.value })}
                />
              ))}
            </div>
          </section>

          <Divider />

          <section className="cb-check-section">
            <h2>Seu carro tem algo que precisa ser resolvido?</h2>
            <div className="cb-selection-list" role="radiogroup" aria-label="Problema atual">
              {currentProblemOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  label={option.label}
                  selected={initialCheck.hasCurrentProblem === option.value}
                  onSelect={() => updateInitialCheck({ hasCurrentProblem: option.value })}
                />
              ))}
            </div>
          </section>

          <div className="cb-check-actions">
            {error && <p className="cb-onboarding-error" role="alert">{error}</p>}
            <PrimaryButton onClick={() => void complete()} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Finalizar configuração'}
            </PrimaryButton>
            <button className="cb-text-button" type="button" onClick={() => void complete()} disabled={isSubmitting}>
              Pular por enquanto
            </button>
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
};
