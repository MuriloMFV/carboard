import type { ReactNode } from 'react';
import { PrimaryButton } from '../../../components/ui';
import { LottieAnimation } from '../../../components/ui/LottieAnimation';
import { recordSuccessAnimations } from '../domain/recordSuccessConfig';
import type { SuccessFeedbackType } from '../types';

interface SuccessFeedbackProps {
  type: SuccessFeedbackType;
  title: string;
  description?: ReactNode;
  details?: ReactNode;
  onContinue: () => void;
}

export const SuccessFeedback = ({ type, title, description, details, onContinue }: SuccessFeedbackProps) => (
  <section className="cb-success-feedback" aria-live="polite">
    <div className="cb-success-animation">
      <LottieAnimation animationData={recordSuccessAnimations[type]} loop={false} />
    </div>
    <div className="cb-success-copy">
      <h1>{title}</h1>
      {description && <div className="cb-success-description">{description}</div>}
    </div>
    {details && <div className="cb-success-details">{details}</div>}
    <PrimaryButton className="cb-record-primary" onClick={onContinue}>Continuar</PrimaryButton>
  </section>
);
