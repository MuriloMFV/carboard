import { ArrowLeft } from 'lucide-react';
import { useHistory } from 'react-router-dom';

interface OnboardingStepHeaderProps {
  step: 1 | 2 | 3;
  fallbackPath: string;
  progress?: 'none' | 'line' | 'segments';
}

export const OnboardingStepHeader = ({ step, fallbackPath, progress = 'none' }: OnboardingStepHeaderProps) => {
  const history = useHistory();

  const goBack = () => history.push(fallbackPath);

  return (
    <header className={`cb-onboarding-step-header cb-onboarding-step-header--${progress}`}>
      <div className="cb-onboarding-step-header__bar">
        <button type="button" aria-label="Voltar" onClick={goBack}>
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <strong>{step} de 3</strong>
        <span aria-hidden="true" />
      </div>
      {progress === 'line' && (
        <div className="cb-step-line" aria-label={`Etapa ${step} de 3`}>
          <span style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      )}
      {progress === 'segments' && (
        <div className="cb-step-segments" aria-label={`Etapa ${step} de 3`}>
          {[1, 2, 3].map((segment) => <span key={segment} className={segment <= step ? 'is-complete' : ''} />)}
        </div>
      )}
    </header>
  );
};
